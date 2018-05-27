const fs = require('fs')
const path = require('path')
const { uniqBy, sortBy } = require('lodash/fp')
const { ipa2shaw } = require('./mapping')
const islex = require('./data/islex.json')

function getOrderedMapping() {
  const patterns = Object.keys(ipa2shaw)
  return patterns
    .sort((a, b) => a.length > b.length ? -1 : a.length < b.length ? 1 : 0)
    .map(pattern => [pattern, ipa2shaw[pattern]])
}

function generateShawLexicon() {
  const ipaIgnore = /[ˈˌ˺]/g
  const lexicon = Object.create(null)
  const mapping = getOrderedMapping()

  const normalizePPOS = ppos =>
    ppos.filter(pos => !/^\+|^root:|\d$/.test(pos))

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

  for (let headword in islex) {
    const variants = islex[headword].map(entryToShavian)
    const unique = uniqBy(([word, ppos]) => sortBy(x => x, ppos).join(','), variants)
    lexicon[headword] = variants
  }

  return lexicon
}

const lexicon = generateShawLexicon()
const json = JSON.stringify(lexicon)
const jsSource = 'export default ' + json

fs.writeFileSync(path.join(__dirname, 'data', 'shavian-lexicon.js'), jsSource, 'utf8')
