import type { Position, Token, TokenKind } from './Token'
import {
  isIdentifierStartChar,
  isValidIdentifierChar,
  isKeyword,
  isNumber,
  isOperator,
  isParen,
} from './Grammar'
import { Char } from './Char'
import { promises } from 'fs'
import { readFileSync } from 'fs'
import { resolve } from 'path'

class StringBuffer {
  private readonly data: number[]

  constructor(data: number[] = []) {
    this.data = data
  }

  public putc(char: number): this {
    this.data.push(char)
    return this
  }

  public toString(): string {
    return Buffer.from(this.data).toString('utf8')
  }
}

export interface Options {
  file?: string
  keepComments?: boolean
}

export class Lexer {
  private readonly input: Buffer
  private readonly options: Options
  private readonly inputLength: number
  private readonly file: string
  private cursor = 0
  private current = 0
  private line = 1
  private column = 0

  public static async fromFile(
    path: string,
    options?: Omit<Options, 'file'>
  ): Promise<Lexer> {
    path = resolve(path)
    const data = await promises.readFile(path)
    return new this(data, { ...options, file: path })
  }

  public static fromFileSync(
    path: string,
    options?: Omit<Options, 'file'>
  ): Lexer {
    path = resolve(path)
    const data = readFileSync(path)
    return new this(data, { ...options, file: path })
  }

  public static fromString(data: string, options?: Options): Lexer {
    return new this(data, options)
  }

  protected constructor(input: string | Buffer, options?: Options) {
    if (typeof input === 'string') {
      input = Buffer.from(input)
    }

    this.input = input
    this.options = options ?? {}
    this.inputLength = input.length
    this.file = options?.file ?? 'stdin'
    this.advance()
  }

  public getErrorPositionMessage(token: Token): string {
    const ps = token.position.start
    const pe = token.position.end
    return `${this.file}:${ps.line}:${ps.column}-${pe.line}:${pe.column}`
  }

  public *lex(): Generator<Token> {
    const { keepComments } = this.options

    while (!this.done) {
      this.eatWhitespace(true)

      // Comment
      if (this.current === Char.LeftCurly) {
        if (keepComments) {
          yield this.lexComment()
        } else {
          this.lexComment()
        }
      }
      // Parens ( or )
      else if (isParen(this.current)) {
        yield this.lexParen()
      }
      // Identifier (variable/keyword)
      else if (isIdentifierStartChar(this.current)) {
        yield this.lexIdentifier()
      }
      // Operator
      else if (isOperator(this.current)) {
        yield this.lexOperator()
      }
      // Number
      else if (isNumber(this.current)) {
        yield this.lexNumber()
      }
      // Throw here
      else {
        throw new Error(
          `Unahandled character "${this.currentStr}" at ` +
            `"${this.file}:${this.line}:${this.column - 1}" `
        )
      }

      this.advance()
    }
  }

  protected get done(): boolean {
    return this.cursor >= this.inputLength
  }

  protected get currentStr(): string {
    return String.fromCharCode(this.current)
  }

  protected advance(): number {
    if (this.cursor >= this.inputLength) {
      return 0
    }

    this.current = this.input.readInt8(this.cursor)
    this.cursor += 1
    this.column += 1

    if (this.current === Char.CarriageReturn) {
      return this.advance()
    }

    if (this.current == Char.Newline) {
      this.addLine()
    }

    return this.current
  }

  protected addLine(n?: number, col = 1): this {
    this.line += n ?? 1
    this.column = col

    return this
  }

  protected peek(n = 0): number {
    if (n < 0) {
      throw new Error('peek() must be > -1')
    }

    const offset = this.cursor + n

    if (offset >= this.inputLength) {
      return 0
    }

    return this.input.readInt8(offset)
  }

  protected eatWhitespace(includeNewline?: boolean): this {
    const ws = [Char.Tab, Char.Space]

    if (includeNewline) {
      ws.push(Char.Newline)
    }

    if (ws.includes(this.current)) {
      let c = this.current

      while (ws.includes(c)) {
        c = this.advance()
      }
    }

    return this
  }

  protected getPosition(end?: boolean): Position {
    return {
      line: this.line,
      column: this.column - (end ? 0 : 1),
    }
  }

  protected lexComment(): Token {
    const startpos = this.getPosition()
    const data = new StringBuffer()
    let c: number

    this.eatWhitespace()

    while ((c = this.advance())) {
      data.putc(c)

      if (this.peek() === Char.RightCurly) {
        this.advance()
        break
      }
    }

    const endpos = this.getPosition(true)

    return {
      kind: 'comment',
      position: { start: startpos, end: endpos },
      value: data.toString().trim(),
    }
  }

  protected lexIdentifier(): Token {
    const startpos = this.getPosition()
    const data = new StringBuffer([this.current])
    let c: number

    while ((c = this.peek())) {
      if (!isValidIdentifierChar(c)) {
        break
      }

      data.putc(this.advance())
    }

    const buf = data.toString()
    const endpos = this.getPosition(true)

    return {
      kind: isKeyword(buf) ? 'keyword' : 'identifier',
      position: { start: startpos, end: endpos },
      value: buf,
    }
  }

  protected lexOperator(): Token {
    const startpos = this.getPosition()
    const op = this.currentStr
    const endpos = this.getPosition(true)

    return {
      kind: 'operator',
      position: { start: startpos, end: endpos },
      value: op,
    }
  }

  protected lexNumber(): Token {
    const startpos = this.getPosition()
    const data = new StringBuffer([this.current])
    let c: number

    while ((c = this.peek())) {
      if (!isNumber(c) && c !== Char.Underscore) {
        break
      }

      data.putc(this.advance())
    }

    const endpos = this.getPosition(true)

    return {
      kind: 'number',
      position: { start: startpos, end: endpos },
      value: data.toString(),
    }
  }

  protected lexParen(): Token {
    const kind: TokenKind =
      this.current === Char.LeftParen ? 'left-paren' : 'right-paren'

    return {
      kind,
      value: this.currentStr,
      position: {
        start: this.getPosition(),
        end: this.getPosition(true),
      },
    }
  }
}
