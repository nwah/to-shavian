import POSTagger from 'wink-pos-tagger'
import { values } from 'lodash/fp'
import lexicon from './data/shavian-lexicon'
import { abbreviations, namingDot, consonants } from './data/mapping'

const shawConsonants = values(consonants)
const shawNasals = ['𐑙', '𐑥', '𐑯']
const shawFricatives = ['𐑓', '𐑝', '𐑕', '𐑟', '𐑔', '𐑞', '𐑖', '𐑠']
const shawAffricates = ['𐑗', '𐑡']
const voiced = ['𐑚', '𐑛', '𐑜', '𐑝', '𐑞', '𐑟', '𐑠', '𐑡']
const unvoiced = ['𐑐', '𐑑', '𐑒', '𐑓', '𐑔', '𐑕', '𐑖', '𐑗']

function fixSpacing(text) {
  return text
    .replace(/ ([.…,!?\//—:’”)}\]])/g, '$1')
    .replace(/([\//—‘“({\[]) /g, '$1')
    .replace(/␍/gm, '\n')
    .replace(/␉/g, '\t')
}

function getFinalSSound(base) {
  const last = base.slice(-2) // shaw characters are 2-wide
  return (
    ['𐑕', '𐑟', '𐑖', '𐑠', '𐑗', '𐑡'].includes(last) ? '𐑦𐑟'
    : unvoiced.includes(last) ? '𐑕'
    : '𐑟'
  )
}

function guessPronunciation(entity) {
  if (entity.lemma in lexicon) {
    const base = transliterateEntity({ ...entity, normal: entity.lemma, value: entity.lemma})

    // build -ing words from lemma
    if (entity.pos === 'VBG') {
      return `${base}𐑦𐑙`
    }

    // build -ed words from lemma
    if (entity.pos === 'VBD' && /ed$/.test(entity.normal)) {
      const last = base.slice(-2) // shaw characters are 2-wide
      const ending =
        (last === '𐑛' || last === '𐑑') ? '𐑦𐑛'
        : shawNasals.includes(last) ? '𐑛'
        : shawConsonants.includes(last) ? '𐑑'
        : '𐑛'
      return `${base}${ending}`
    }

    // build -(e)s words from lemma
    if ((entity.pos === 'NNS' || entity.pos === 'VBZ') && /s$/.test(entity.normal)) {
      const ending = getFinalSSound(base)
      return `${base}${ending}`
    }
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

function getPossessive(entity, previous) {
  const prevShaw = transliterateEntity(previous)
  return getFinalSSound(prevShaw)
}

function isName(entity) {
  const variants = lexicon[entity.normal]
  if (!variants) return false
  if (!/^NN/i.test(entity.pos)) return false
  const tags = variants[0][1]
  // match nnp_girlname, nnp_city, etc
  const hasNnp = tags.some(tag => /^nnp_/.test(tag))
  const hasOthers = tags.includes('nn') || tags.includes('jj') || tags.some(tag => /^vb_/.test(tag))
  return hasNnp && (!hasOthers || /^[A-Z]/.test(entity.value))
}

function normalizeApostrophes(english) {
  return english
    .replace(/’(s\W|$)/ig, (match, group) => `'${group}`)
    .replace(/s'(\W|$)/ig, (match, group) => `s’${group}`)
}

function transliterateEntity(entity, i, entities) {
  const variants = lexicon[entity.normal]

  if (entity.normal in abbreviations) {
    return abbreviations[entity.normal]
  }
  
  if (entity.tag === 'punctuation') {
    return entity.value
  }

  if (i > 0 && /['’]s$/.test(entity.normal)) {
    return '’' + getPossessive(entity, entities[i - 1])
  }

  if (i > 1 && entity.normal === 's' && /^['’]$/.test(entities[i - 1].normal)) {
    return getPossessive(entity, entities[i - 2])
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
  const normalized = normalizeApostrophes(english)
  const entities = tagger.tagSentence(normalized)

  const transliterated = entities.map(transliterateEntity)

  return fixSpacing(transliterated.join(' '))
}

transliterate.fixSpacing = fixSpacing

export default transliterate
