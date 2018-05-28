const POSTagger = require('wink-pos-tagger')
const lexicon = require('./data/shavian-lexicon')
const { abbreviations, namingDot } = require('./mapping')

function fixSpacing(text) {
  return text
    .replace(/ ([.…,!?\//—:’”)}\]])/g, '$1')
    .replace(/([\//—‘“({\[]) /g, '$1')
    .replace(/␍/gm, '\n')
    .replace(/␉/g, '\t')
}

function transliterate(english = '') {
  // TODO: Preserve original whitespace?
  const tagger = new POSTagger()
  const entities = tagger.tagSentence(english)

  const transliterated = entities.map(entity => {
    const variants = lexicon[entity.normal]

    if (entity.normal in abbreviations) {
      return abbreviations[entity.normal]
    }
    
    if (!variants || entity.tag === 'punctuation') {
      return entity.value
    }

    const pos = entity.pos.toLowerCase()
    let shaw = variants[0][0]

    if (variants.length > 1) {
      const matching = variants.find(([shaw, ppos]) => ppos.includes(pos))
      shaw = matching ? matching[0] : variants[0][0]
    }

    return pos === 'nnp' ? `${namingDot}${shaw}` : shaw
  })

  return fixSpacing(transliterated.join(' '))
}

module.exports = transliterate
module.exports.fixSpacing = fixSpacing
