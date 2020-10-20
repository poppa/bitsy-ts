import 'jest'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { Token } from '../lib/token'
import { Type } from '../lib/token'
import { Tokenizer } from '../lib/tokenizer'
import { isKeyword, keywords } from '../lib/grammar'

function readSampleFile(name: string): Buffer {
  return readFileSync(join(__dirname, '..', '..', 'samples', name))
}

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

    // BEGIN
    expect(t[0].line).toEqual(2)
    expect(t[0].column).toEqual(7)

    // Loop after BEGIN
    expect(t[1].line).toEqual(3)
    expect(t[1].column).toEqual(9)
  })

  test('Expect negative numbers to be tokenized', () => {
    const t = readAllTokens(new Tokenizer(`BEGIN -1 -19812 END`))

    expect(t.length).toEqual(4)
    expect(t[1].value).toEqual('-1')
    expect(t[1].type).toEqual(Type.Number)
    expect(t[2].value).toEqual('-19812')
    expect(t[2].type).toEqual(Type.Number)
  })

  test('Expect keywords to be recognized', () => {
    const t = readAllTokens(new Tokenizer(keywords.join('\n')))
    expect(t.every((tt) => isKeyword(tt.value))).toEqual(true)
    expect(t.every((tt) => tt.type === Type.Keyword)).toEqual(true)
  })

  test(`Expect keywords to be defined`, () => {
    const kw = [
      'BEGIN',
      'END',
      'LOOP',
      'BREAK',
      'PRINT',
      'READ',
      'IFZ',
      'IFP',
      'IFN',
      'ELSE',
    ]

    expect(kw.every((k) => keywords.includes(k)))
  })

  test('Verify that token types are set properly', () => {
    const t = readAllTokens(
      new Tokenizer(`BEGIN n = 1 / (2 * 3) % 4 + 2 - 1 END`)
    )

    expect(t.length).toEqual(17)
    expect(t[0].type).toEqual(Type.Keyword)
    expect(t[1].type).toEqual(Type.Symbol)
    expect(t[2].type).toEqual(Type.Equal)
    expect(t[3].type).toEqual(Type.Number)
    expect(t[4].type).toEqual(Type.Operator)
    expect(t[5].type).toEqual(Type.LeftParen)
    expect(t[6].type).toEqual(Type.Number)
    expect(t[7].type).toEqual(Type.Operator)
    expect(t[8].type).toEqual(Type.Number)
    expect(t[9].type).toEqual(Type.RightParen)
    expect(t[10].type).toEqual(Type.Operator)
    expect(t[11].type).toEqual(Type.Number)
    expect(t[12].type).toEqual(Type.Operator)
    expect(t[13].type).toEqual(Type.Number)
    expect(t[14].type).toEqual(Type.Operator)
    expect(t[15].type).toEqual(Type.Number)
    expect(t[16].type).toEqual(Type.Keyword)
  })

  test(`Verify that collatz.bitsy has the correct amount of tokens`, () => {
    const buf = readSampleFile('collatz.bitsy')
    const tokens = readAllTokens(new Tokenizer(buf))
    expect(tokens.length).toEqual(39)
  })

  test(`Verify that comment.bitsy has the correct amount of tokens`, () => {
    const buf = readSampleFile('comment.bitsy')
    const tokens = readAllTokens(new Tokenizer(buf))
    expect(tokens.length).toEqual(2)
    expect(tokens[0].value).toEqual('BEGIN')
    expect(tokens[1].value).toEqual('END')
  })

  test(`Verify that factorial.bitsy has the correct amount of tokens`, () => {
    const buf = readSampleFile('factorial.bitsy')
    const tokens = readAllTokens(new Tokenizer(buf))
    expect(tokens.length).toEqual(29)
  })

  test(`Verify that fibonacci.bitsy has the correct amount of tokens`, () => {
    const buf = readSampleFile('fibonacci.bitsy')
    const tokens = readAllTokens(new Tokenizer(buf))
    expect(tokens.length).toEqual(33)
  })

  test(`Verify that gcd.bitsy has the correct amount of tokens`, () => {
    const buf = readSampleFile('gcd.bitsy')
    const tokens = readAllTokens(new Tokenizer(buf))
    expect(tokens.length).toEqual(40)
  })

  test(`Verify that program.bitsy has the correct amount of tokens`, () => {
    const buf = readSampleFile('program.bitsy')
    const tokens = readAllTokens(new Tokenizer(buf))
    expect(tokens.length).toEqual(2)
  })
})
