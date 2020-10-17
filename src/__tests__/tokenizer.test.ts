import 'jest'
import { Tokenizer } from '../lib/tokenizer'

describe('Tokenizer test suite', () => {
  test('Expect simple tokenizing to work', () => {
    const tz = new Tokenizer(`BEGIN END`).tokenize()
    const t = tz.tokens

    expect(t.length).toEqual(3)
    expect(t[0].value).toEqual('BEGIN')
    expect(t[1].value).toEqual(' ')
    expect(t[2].value).toEqual('END')
  })

  test('Expect comments to be handled', () => {
    const tz = new Tokenizer(`{this is a comment}`).tokenize()
    expect(tz.tokens[0].value).toEqual('{this is a comment}')
  })

  test('Expect multiline comments to be handled', () => {
    const tz = new Tokenizer(`{
      this is a comment
      over multiple lines}`).tokenize()

    expect(tz.tokens[0].value).toEqual(`{
      this is a comment
      over multiple lines}`)
  })

  test('Expect line counter to work properly', () => {
    const tz = new Tokenizer(`
      BEGIN
        LOOP {comment}
          key = 1
        END
      END
    `).tokenize()

    const t = tz.tokens

    // Beginning newline and space
    expect(t[0].line).toEqual(1)
    expect(t[0].column).toEqual(1)

    // BEGIN
    expect(t[1].line).toEqual(2)
    expect(t[1].column).toEqual(7)

    // Newline after BEGIN
    expect(t[2].line).toEqual(2)
    expect(t[2].column).toEqual(12)

    expect(tz.position).toEqual(tz.length)
  })
})
