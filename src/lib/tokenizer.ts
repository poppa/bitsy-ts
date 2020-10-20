import type { Token } from './token'
import { charToType } from './token'
import { Type } from './token'

const NumberStart = /^[1-9]+(?![a-zA-Z])|^0(?![a-zA-Z0-9])/
const SymbolStart = /^_|[a-zA-Z]/
const NegativeNumberRead = /[-_0-9]/
const NumberRead = /[_0-9]/
const SymbolRead = /[_a-zA-Z0-9]/

export class Tokenizer {
  private readonly input: string
  private readonly len: number
  private cursor = 0
  private line = 1
  private col = 1

  constructor(input: Readonly<string | Buffer>) {
    this.input = typeof input === 'string' ? input : input.toString('utf8')
    this.len = input.length
  }

  public get length(): number {
    return this.len
  }

  public *tokenize(): Generator<Token> {
    while (!this.done) {
      const c = this.current

      if (c === '\n') {
        this.addLine(1, 0)
      }
      // Match space and tab
      else if (c === ' ' || c === '\t') {
        // Do nothing
      }
      // Comment start
      else if (c === '{') {
        this.readComment()
      }
      // Negative number
      else if (c === '-' && NumberStart.test(this.next)) {
        yield this.read(Type.Number, NegativeNumberRead)
      }
      // Regular number
      else if (this.test(NumberStart)) {
        yield this.read(Type.Number, NumberRead)
      }
      // Symbol
      else if (SymbolStart.test(c)) {
        yield this.read(Type.Symbol, SymbolRead)
      }
      // Operators, equal, and parenses
      else if (['(', ')', '+', '-', '*', '/', '%', '='].includes(c)) {
        yield this.simpleToken()
      }
      // Syntax error
      else {
        throw new Error(
          `Unexpeted character ${c} at line ${this.line} column ${this.col}`
        )
      }

      this.advance()
    }
  }

  private test(re: RegExp): boolean {
    const s = this.input.substring(this.cursor)
    return re.test(s)
  }

  private get current(): string {
    const c = this.input[this.cursor]

    if (c === undefined) {
      throw new Error(`Read beyond input lenth`)
    }

    return this.input[this.cursor]
  }

  private get next(): string {
    return this.input[this.cursor + 1]
  }

  private get done(): boolean {
    return this.input[this.cursor] === undefined
  }

  private advance(): this {
    this.cursor += 1
    this.col += 1

    return this
  }

  private addLine(n?: number, col = 1): this {
    this.line += n ?? 1
    this.col = col

    return this
  }

  private simpleToken(): Token {
    return {
      value: this.current,
      line: this.line,
      column: this.col,
      position: this.cursor,
      type: charToType(this.current),
    }
  }

  private read(type: Type, pattern: RegExp): Token {
    const buf: string[] = []

    const startLine = this.line
    const startCol = this.col
    const startPos = this.cursor

    while (!this.done) {
      if (pattern.test(this.current)) {
        buf.push(this.current)
      } else {
        this.cursor -= 1
        break
      }

      this.advance()
    }

    if (!buf.length) {
      throw new Error(`read() gave to result`)
    }

    return {
      value: buf.join(''),
      line: startLine,
      column: startCol,
      position: startPos,
      type,
    }
  }

  private readComment(): void {
    this.expect('{')

    const startLine = this.line
    const startCol = this.col

    this.advance()

    while (!this.done) {
      const c = this.current

      if (c === '\n') {
        this.addLine(1, 0)
      } else if (c === '}') {
        break
      }

      this.advance()
    }

    this.expect('}', { startCol, startLine })
  }

  private expect(
    char: string,
    opts?: { startLine: number; startCol: number }
  ): void {
    const safeCc = this.input[this.cursor]

    if (safeCc !== char) {
      let msg =
        `Expected ${char} got ${safeCc ?? 'end of input'}` +
        ` at line ${this.line} column ${this.col}.`

      if (opts) {
        msg +=
          ` Problem started at line ${opts.startLine}` +
          ` column ${opts.startCol}.`
      }

      throw new Error(msg)
    }
  }
}
