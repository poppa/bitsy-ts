import type { Token } from '../mod'
import type { Type } from './token'
import { typeMap } from './token'

export class SyntaxError extends Error {
  constructor(token: Token, expected: string) {
    super()
    this.name = `SyntaxError`
    this.message =
      `Syntax error at line ${token.line} column ${token.column}. ` +
      `Expected ${expected} got ${token.value}`
  }
}

export class TokenTypeError extends Error {
  constructor(token: Token, expected: Type | Type[]) {
    super()

    const typeTrans = Array.isArray(expected)
      ? expected.map((n) => typeMap[n]).join(', ')
      : typeMap[expected]

    this.name = 'TokenTypeError'
    this.message =
      `Syntax error at line ${token.line} column ${token.column}. ` +
      `Expected type ${typeTrans} got ${typeMap[token.type]}`
  }
}
