import type { Token } from './token'
import type { Tokenizer } from './tokenizer'
import type { Maybe } from './types'
import { Keyword } from './grammar'
import { Type } from './token'
import { TokenTypeError, SyntaxError } from './error'
import type { CodeGenerator, EventType } from './codegen'

export class Parser {
  private readonly tz: Tokenizer
  private readonly generator: CodeGenerator
  private tzgen: Maybe<Generator<Token>>
  private token: Maybe<Token>
  private isDone = false

  constructor(tokenizer: Tokenizer, generator: CodeGenerator) {
    this.tz = tokenizer
    this.generator = generator
  }

  public parse(): void {
    // Read the first token
    this.advance()
    return this.program()
  }

  private program(): void {
    this.emit('program start')
    this.expectKeyword(Keyword.Begin)
    this.parseBlock()
    this.emit('program end')
    this.expectKeyword(Keyword.End)
  }

  private parseBlock(): Maybe<void> {
    while (!this.isDone && this.current.value !== Keyword.End) {
      const t = this.current

      switch (t.value) {
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

    return undefined
  }

  private assigment(): void {
    this.emit('assignment')
    this.expectType(Type.Symbol)
    this.expectType(Type.Equal)
    this.expression()
    this.emit('assignment end')
  }

  private expression(): void {
    this.term()

    while (['+', '-'].includes(this.current.value)) {
      const op = this.current.type
      this.emit('operator')
      this.expectType(op)
      this.term()
    }
  }

  private term(): void {
    this.signedFactor()

    while (['*', '/', '%'].includes(this.current.value)) {
      const op = this.current.type
      this.emit('operator')
      this.expectType(op)
      this.factor()
    }
  }

  private signedFactor(): void {
    const c = this.current

    if (['+', '-'].includes(c.value)) {
      this.emit('operator')
      this.expectType(Type.Operator)
    }

    this.factor()
  }

  private factor(): void {
    const c = this.current

    if (c.type === Type.Number) {
      this.emit('number')
      this.expectType(Type.Number)
    } else if (c.type === Type.Symbol) {
      this.emit('symbol')
      this.expectType(Type.Symbol)
    } else {
      this.emit('left paren')
      this.expectType(Type.LeftParen)
      this.expression()
      this.emit('right paren')
      this.expectType(Type.RightParen)
    }
  }

  private loop(): void {
    this.emit('loop start')
    this.expectKeyword(Keyword.Loop)
    this.parseBlock()
    this.emit('loop end')
    this.expectKeyword(Keyword.End)
  }

  private break(): void {
    this.emit('break')
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

  private emit(event: EventType, token?: Token): void {
    this.generator.emit(event, token ?? this.current)
  }
}
