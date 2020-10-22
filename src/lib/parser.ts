import type { Token } from './token'
import type { Tokenizer } from './tokenizer'
import type { Maybe } from './types'
import type { CodeGenerator } from './codegen'
import { Keyword } from './grammar'
import { Type } from './token'
import { TokenTypeError, SyntaxError } from './error'
import { EventType } from './events'

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
    this.emit(EventType.ProgramStart)
    this.expectKeyword(Keyword.Begin)
    this.block()
    this.emit(EventType.ProgramEnd)
    this.expectKeyword(Keyword.End)
  }

  private block(): Maybe<void> {
    while (
      !this.isDone &&
      ![Keyword.End, Keyword.Else].includes(this.current.value as Keyword)
    ) {
      const t = this.current

      switch (t.value) {
        case Keyword.Loop:
          this.loop()
          break

        case Keyword.Break:
          this.break()
          break

        case Keyword.Print:
          this.print()
          break

        case Keyword.Ifz: // fall-through
        case Keyword.Ifp: // fall-through
        case Keyword.Ifn:
          this.if()
          break

        default:
          this.assigment()
          break
      }
    }

    return undefined
  }

  private print(): void {
    this.emit(EventType.Print)
    this.expectType(Type.Keyword)
    this.expression()
    this.emit(EventType.PrintEnd)
  }

  private if(): void {
    let evt: EventType

    switch (this.current.value) {
      case Keyword.Ifn:
        evt = EventType.Ifn
        break

      case Keyword.Ifp:
        evt = EventType.Ifp
        break

      case Keyword.Ifz:
        evt = EventType.Ifz
        break

      default:
        throw new Error(`If this happens the world is going under`)
    }

    this.emit(evt)
    this.expectType(Type.Keyword)
    this.expression()
    this.emit(EventType.IfEnd)
    this.block()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // Hm: This condition will always return 'false' since the types
    // 'Keyword.Ifz | Keyword.Ifp | Keyword.Ifn' and 'Keyword.Else'
    // have no overlap .ts(2367)
    //
    // TS doesn't seem to understand that current will have moved forward by
    // this time.
    if (this.current.value === Keyword.Else) {
      this.else()
    }

    this.emit(EventType.BlockEnd)
    this.expectKeyword(Keyword.End)
  }

  private else(): void {
    this.emit(EventType.Else)
    this.expectType(Type.Keyword)
    this.block()
  }

  private assigment(): void {
    this.emit(EventType.Assignment)
    this.expectType(Type.Symbol)
    this.expectType(Type.Equal)
    this.expression()
    this.emit(EventType.AssignmentEnd)
  }

  private expression(): void {
    this.term()

    while (['+', '-'].includes(this.current.value)) {
      const op = this.current.type
      this.emit(EventType.Operator)
      this.expectType(op)
      this.term()
    }
  }

  private term(): void {
    this.signedFactor()

    while (['*', '/', '%'].includes(this.current.value)) {
      const op = this.current.type
      this.emit(EventType.Operator)
      this.expectType(op)
      this.factor()
    }
  }

  private signedFactor(): void {
    const c = this.current

    if (['+', '-'].includes(c.value)) {
      this.emit(EventType.Operator)
      this.expectType(Type.Operator)
    }

    this.factor()
  }

  private factor(): void {
    const c = this.current

    if (c.type === Type.Number) {
      this.emit(EventType.Number)
      this.expectType(Type.Number)
    } else if (c.type === Type.Symbol) {
      this.emit(EventType.Symbol)
      this.expectType(Type.Symbol)
    } else {
      this.emit(EventType.LeftParen)
      this.expectType(Type.LeftParen)
      this.expression()
      this.emit(EventType.RightParen)
      this.expectType(Type.RightParen)
    }
  }

  private loop(): void {
    this.emit(EventType.LoopStart)
    this.expectKeyword(Keyword.Loop)
    this.block()
    this.emit(EventType.LoopEnd)
    this.expectKeyword(Keyword.End)
  }

  private break(): void {
    this.emit(EventType.Break)
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
