import transliterate, { fixSpacing } from '../'

describe('fixSpacing()', () => {
  it('should removing spaces inside brackets and quotes', () => {
    const input = ' “ a ” ‘ b ’ ( c ) [ d ] { e }'
    const fixed = '“a” ‘b’ (c) [d] {e}'

    expect(fixSpacing(input)).toEqual(fixed)
  })

  it('should remove space before punctuation', () => {
    const input = 'a , b . . . c … e . f ! g ?'
    const fixed = 'a, b... c… e. f! g?'

    expect(fixSpacing(input)).toEqual(fixed)
  })
})

describe('transliterate()', () => {
  it('should distinguish homographs based on part of speech', () => {
    const english = 'I like to read. I have read many books.'

    expect(transliterate(english)).toMatchSnapshot()
  })
})