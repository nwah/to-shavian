const fs = require('fs')
const path = require('path')
const { groupBy, map, get } = require('lodash/fp')
const { ipa2shaw } = require('../data/mapping')

const islePath = path.join(__dirname, '..', 'data', 'ISLEDict.txt')

function getOrderedMapping() {
  const patterns = Object.keys(ipa2shaw)
  return patterns
    .sort((a, b) => a.length > b.length ? -1 : a.length < b.length ? 1 : 0)
    .map(pattern => [pattern, ipa2shaw[pattern]])
}

function importISLEDict() {
  const data = fs.readFileSync(islePath, 'utf8')
  const lines = data.split('\n')
  const lexicon = Object.create(null)

  lines.forEach(line => {
    // Skip blank lines, or lines that start with #
    if (/^#|^\s*$/.test(line)) return

    const [entry, ...rest] = line.split(/\s+/)
    const [headword, tagString] = entry.replace(/\)$/, '').split('(')
    const tags = tagString ? (tagString || '').split(/,/) : []
    const pronunciation = rest.slice(1, -1).join(' ').split(' # ')
      .map(word => {
        const syllables = word.split(' . ')
        return syllables.map(syllable => syllable.split(' '))
      })
    lexicon[headword] = lexicon[headword] || []
    lexicon[headword].push([tags, pronunciation])
  })
  return lexicon
}

function generateShawLexicon(dictionary) {
  const ipaIgnore = /[ˈˌ˺]/g
  const lexicon = Object.create(null)
  const mapping = getOrderedMapping()

  const normalizePPOS = ppos => ppos
    .filter(pos => !/^\+|^root:/.test(pos))
    .map(pos => pos.replace(/_\d+\.\d+$/, ''))

  const wordToShavian = syllabes => syllabes.map(phones => {
    const syllable = phones.join('').replace(ipaIgnore, '')

    let converted = ''
    let remaining = syllable

    for (let i = 0; i < mapping.length && remaining.length; i++) {
      const [pattern, shaw] = mapping[i]
      if (remaining.startsWith(pattern)) {
        converted += shaw
        remaining = remaining.substr(pattern.length)
        i = 0
      }
    }

    converted += remaining // just pass thru anything we couldn't convert
    return converted
  }).join('')

  const entryToShavian = ([ppos, words]) => [
    words.map(wordToShavian).join(' '),
    normalizePPOS(ppos),
  ]

  for (let headword in dictionary) {
    const variants = dictionary[headword].map(entryToShavian)
    const byPOS = groupBy(([shaw, ppos]) => ppos.slice().sort().join(','), variants)
    
    for (let pos in byPOS) {
      const alternates = byPOS[pos]
      if (alternates.length <= 1) continue
      const sorted = alternates.sort((a, b) => {
        // prefer /w/ over /hw/
        const aHasHW = a[0].includes('𐑣𐑢')
        const bHasHW = b[0].includes('𐑣𐑢')
        if (aHasHW || bHasHW) {
          return aHasHW && !bHasHW ? 1 : !aHasHW && bHasHW ? -1 : 0
        }
        
        // otherwise, prefer longer version as it's less likely to be the
        // "fast speech" version
        return a[0].length > b[0].length ? -1 : a[0].length > b[0].length ? 1 : 0
      })
      byPOS[pos] = sorted
    }

    lexicon[headword] = map(get(0), byPOS)
  }

  return lexicon
}

const isle = importISLEDict()
const lexicon = generateShawLexicon(isle)
const json = JSON.stringify(lexicon)
const jsSource = 'module.exports = ' + json

fs.writeFileSync(path.join(__dirname, '..', 'data', 'shavian-lexicon.js'), jsSource, 'utf8')
