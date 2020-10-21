import type { Token } from './token'
import type { Tokenizer } from './tokenizer'
import type { Maybe } from './types'
import { Keyword } from './grammar'
import { Type } from './token'
import { TokenTypeError, SyntaxError } from './error'

export class Parser {
  private readonly tz: Tokenizer
  private tzgen: Maybe<Generator<Token>>
  private token: Maybe<Token>
  private isDone = false

  constructor(tokenizer: Tokenizer) {
    this.tz = tokenizer
  }

  public parse(): void {
    // Read the first token
    this.advance()
    return this.program()
  }

  private program(): void {
    this.expectKeyword(Keyword.Begin)
    this.parseBlock()
    this.expectKeyword(Keyword.End)
  }

  private parseBlock(): Maybe<void> {
    while (!this.isDone && this.current.value !== Keyword.End) {
      const t = this.current

      switch (t.value) {
        case Keyword.End:
          break

        case Keyword.Loop:
          this.loop()
          break

        case Keyword.Break:
          this.break()
          break

        default:
          this.assigment()
          break
      }
    }

    this.expectKeyword(Keyword.End)

    return undefined
  }

  private assigment(): void {
    this.expectType(Type.Symbol)
    this.expectType(Type.Equal)
    this.expression()
  }

  private expression(): void {
    this.term()

    while (['+', '-'].includes(this.current.value)) {
      const op = this.current.type
      this.expectType(op)
      this.term()
    }
  }

  private term(): void {
    this.signedFactor()

    while (['*', '/', '%'].includes(this.current.value)) {
      const op = this.current.type
      this.expectType(op)
      this.factor()
    }
  }

  private signedFactor(): void {
    const c = this.current

    if (['+', '-'].includes(c.value)) {
      this.expectType(Type.Operator)
    }

    this.factor()
  }

  private factor(): void {
    const c = this.current

    if (c.type === Type.Number) {
      this.expectType(Type.Number)
    } else if (c.type === Type.Symbol) {
      this.expectType(Type.Symbol)
    } else {
      this.expectType(Type.LeftParen)
      this.expression()
      this.expectType(Type.RightParen)
    }
  }

  private loop(): void {
    this.expectKeyword(Keyword.Loop)
    this.parseBlock()
    this.expectKeyword(Keyword.End)
  }

  private break(): void {
    this.expectKeyword(Keyword.Break)
  }

  private expectKeyword(word: string, advance = true): this {
    if (this.current.value !== word) {
      throw new SyntaxError(this.current, word)
    }

    if (advance) {
      this.advance()
    }

    return this
  }

  private expectType(typ: Type, advance = true): this {
    if (this.current.type !== typ) {
      throw new TokenTypeError(this.current, typ)
    }

    if (advance) {
      this.advance()
    }

    return this
  }

  private get current(): Token {
    if (!this.token) {
      throw new Error('Wtf')
    }

    return this.token
  }

  private advance(): this {
    if (!this.tzgen) {
      this.tzgen = this.tz.tokenize()
    }

    const v = this.tzgen.next()

    if (v.done) {
      this.isDone = true
      return this
    }

    this.token = v.value

    return this
  }
}
