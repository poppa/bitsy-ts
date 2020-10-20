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
    return this.parseProgram()
  }

  private parseProgram(): void {
    // Read the first token
    this.readNext()
    this.expectKeyword(Keyword.Begin)
    this.parseBlock()
    this.expectKeyword(Keyword.End)
  }

  private parseBlock(): Maybe<void> {
    while (!this.isDone) {
      const t = this.readNext().current

      switch (t.value) {
        case Keyword.End:
          break

        case Keyword.Loop:
          this.parseLoop()
          break

        case Keyword.Break:
          this.parseBreak()
          break

        default:
          this.expectType(Type.Symbol)

          switch (t.type) {
            case Type.Symbol:
              this.parseAssigment()
              break

            default:
              break
          }
      }
    }

    this.expectKeyword(Keyword.End)

    return undefined
  }

  private parseAssigment(): void {
    this.expectType(Type.Symbol)
    // const sym = this.current

    this.readNext()
    this.expectType(Type.Equal)
    this.readNext()
    this.parseExpression()
  }

  private parseExpression(): void {
    const c = this.current

    if (c.type !== Type.Symbol && c.type !== Type.Number) {
      throw new TokenTypeError(c, [Type.Symbol, Type.Number])
    }

    this.readNext()
  }

  private parseLoop(): void {
    this.expectKeyword(Keyword.Loop)
    this.parseBlock()
    this.expectKeyword(Keyword.End)
  }

  private parseBreak(): void {
    this.expectKeyword(Keyword.Break)
    this.readNext()
  }

  private expectKeyword(word: string): this {
    if (this.current.value !== word) {
      throw new SyntaxError(this.current, word)
    }

    return this
  }

  private expectType(typ: Type): this {
    if (this.current.type !== typ) {
      throw new TokenTypeError(this.current, typ)
    }

    return this
  }

  private get current(): Token {
    if (!this.token) {
      throw new Error('Wtf')
    }

    return this.token
  }

  private readNext(): this {
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
