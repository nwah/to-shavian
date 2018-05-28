const POSTagger = require('wink-pos-tagger')
const { values } = require('lodash/fp')
const lexicon = require('./data/shavian-lexicon')
const { abbreviations, namingDot, consonants } = require('./data/mapping')

const shawConsonants = values(consonants)
const shawNasals = ['𐑙', '𐑥', '𐑯']

function fixSpacing(text) {
  return text
    .replace(/ ([.…,!?\//—:’”)}\]])/g, '$1')
    .replace(/([\//—‘“({\[]) /g, '$1')
    .replace(/␍/gm, '\n')
    .replace(/␉/g, '\t')
}

function guessPronunciation(entity) {
  // build -ing words from lemma
  if (entity.pos === 'VBG' && entity.lemma in lexicon) {
    const base = transliterateEntity({ ...entity, normal: entity.lemma, value: entity.lemma})
    return `${base}𐑦𐑙`
  }

  // build -ed words from lemma
  if (entity.pos === 'VBD' && entity.lemma in lexicon && /ed$/.test(entity.normal)) {
    const base = transliterateEntity({ ...entity, normal: entity.lemma, value: entity.lemma })
    const last = base.slice(-2) // shaw characters are 2-wide
    const ending =
      (last === '𐑛' || last === '𐑑') ? '𐑦𐑛'
      : shawNasals.includes(last) ? '𐑛'
      : shawConsonants.includes(last) ? '𐑑'
      : '𐑛'
    return `${base}${ending}`
  }

  // guess CamelCased words based on individual pieces
  if (/^(?:[A-Z][a-z]+){2,}$/.test(entity.value)) {
    const shaw = entity.value.replace(/[A-Z][a-z]+/g, value =>
      transliterateEntity(new POSTagger().tagSentence(value.toLowerCase())[0])
    )
    return entity.pos === 'NNP' ? `${namingDot}${shaw}` : shaw
  }

  return entity.value
}

function isName(entity) {
  const variants = lexicon[entity.normal]
  if (!variants) return false
  if (!/^NN/i.test(entity.pos)) return false
  const tags = variants[0][1]
  // match nnp_girlname, nnp_city, etc
  return tags.some(tag => /^nnp_/.test(tag))
}

function transliterateEntity(entity) {
  const variants = lexicon[entity.normal]

  if (entity.normal in abbreviations) {
    return abbreviations[entity.normal]
  }
  
  if (entity.tag === 'punctuation') {
    return entity.value
  }

  if (!variants) {
    return guessPronunciation(entity)
  }

  const pos = entity.pos.toLowerCase()
  let shaw = variants[0][0]

  if (variants.length > 1) {
    const matching = variants.find(([shaw, ppos]) => ppos.includes(pos))
    shaw = matching ? matching[0] : variants[0][0]
  }

  // Sometimes tagger doesn't tag names with NNP, but if the only ISLE entry is
  // NNP we can be pretty sure it should be a proper noun
  const isProper = pos === 'nnp' || isName(entity)

  return isProper ? `${namingDot}${shaw}` : shaw
}

function transliterate(english = '') {
  // TODO: Preserve original whitespace?
  const tagger = new POSTagger()
  const entities = tagger.tagSentence(english)

  const transliterated = entities.map(transliterateEntity)

  return fixSpacing(transliterated.join(' '))
}

transliterate.fixSpacing = fixSpacing

module.exports = transliterate
