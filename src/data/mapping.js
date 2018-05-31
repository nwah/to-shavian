const abbreviations = {
  'to': '𐑑',
  'the': '𐑞',
  'and': '𐑯',
  'of': '𐑝',
}

const namingDot = '·'

const consonants = {
  'p': '𐑐',
  'b': '𐑚',
  'd': '𐑛',
  't': '𐑑',
  'k': '𐑒',
  'g': '𐑜',
  'f': '𐑓',
  'v': '𐑝',
  'ɵ': '𐑔',
  'ð': '𐑞',
  's': '𐑕',
  'z': '𐑟',
  'ʃ': '𐑖',
  'ʒ': '𐑠',
  'tʃ': '𐑗',
  'dʒ': '𐑡',
  'j': '𐑘',
  'w': '𐑢',
  'ŋ': '𐑙',
  'h': '𐑣',
  'l̩': '𐑩𐑤',
  'l': '𐑤',
  'ɹ': '𐑮',
  'r': '𐑮',
  'm': '𐑥',
  'n': '𐑯',
  'n̩': '𐑩𐑯',
}

const vowels = {
  'ɪ': '𐑦',
  'i': '𐑰',
  'iː': '𐑰',
  'ɛ': '𐑧',
  'eɪ': '𐑱',
  'æ': '𐑨',
  'ɑɪ': '𐑲',
  'aɪ': '𐑲',
  'ə': '𐑩',
  'ʌ': '𐑳',
  'ɒ': '𐑪',
  'oʊ': '𐑴',
  'ʊ': '𐑫',
  'u': '𐑵',
  'aʊ': '𐑬',
  'ɔi': '𐑶',
  'ɔɪ': '𐑶',
  'ɑ': '𐑭',
  'ɑː': '𐑭',
  'ɔ': '𐑷',
  'ɔː': '𐑷',
  'ei': '𐑱',
  'iə': '𐑾',
  'ju': '𐑿',
}

const rColored = {
  'ɑɹ': '𐑸',
  'ɑːɹ': '𐑸',
  'ɔɹ': '𐑹',
  'ɔəɹ': '𐑹',
  'ɛəɹ': '𐑺',
  'ɛɹ': '𐑺',
  'ɝ': '𐑻',
  'ɜɹ': '𐑻',
  'ɚ': '𐑼',
  'əɹ': '𐑼',
  'ɪɹ': '𐑽',
  'ɪəɹ': '𐑽',
}

const ipa2shaw = {
  ...consonants,
  ...vowels,
  ...rColored,
}

export {
  ipa2shaw,
  consonants,
  vowels,
  rColored,
  abbreviations,
  namingDot,
}
