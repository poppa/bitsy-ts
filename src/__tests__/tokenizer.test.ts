import 'jest'
import type { Token } from '../lib/token'
import { Tokenizer } from '../lib/tokenizer'

function readAllTokens(t: Tokenizer): Token[] {
  const tokens: Token[] = []

  for (const token of t.tokenize()) {
    tokens.push(token)
  }

  return tokens
}

describe('Tokenizer test suite', () => {
  test('Expect simple tokenizing to work', () => {
    const tz = new Tokenizer(`BEGIN END`)
    const t = readAllTokens(tz)

    expect(t.length).toEqual(2)
    expect(t[0].value).toEqual('BEGIN')
    expect(t[1].value).toEqual('END')
  })

  test('Expect comments to be handled', () => {
    const tz = new Tokenizer(`{this is a comment}`)
    const t = readAllTokens(tz)
    expect(t.length).toEqual(0)
  })

  test('Expect multiline comments to be handled', () => {
    const tz = new Tokenizer(`{
      this is a comment
      over multiple lines}`)

    const t = readAllTokens(tz)
    expect(t.length).toEqual(0)
  })

  test('Expect line counter to work properly', () => {
    const tz = new Tokenizer(`
      BEGIN
        LOOP {comment}
          key = 1
        END
      END
    `)

    const t = readAllTokens(tz)

    console.log(`T:`, t)

    // BEGIN
    expect(t[0].line).toEqual(2)
    expect(t[0].column).toEqual(7)

    // Loop after BEGIN
    expect(t[1].line).toEqual(3)
    expect(t[1].column).toEqual(9)
  })
})
