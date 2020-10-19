import type { Token } from './token'
import { Type } from './token'

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
      else if (c.match(/[ \t]/)) {
        // Do nothing
      }
      // Comment start
      else if (c === '{') {
        this.readComment()
      }
      // Negative number
      else if (c === '-' && this.next.match(/[1-9]/)) {
        yield this.read(Type.Number, /[-_0-9]/)
      }
      // Regular number
      else if (c.match(/[1-9]/)) {
        yield this.read(Type.Number, /[_0-9]/)
      }
      // Symbol
      else if (c.match(/[_a-zA-Z]/)) {
        yield this.read(Type.Symbol, /[_a-zA-Z0-9]/)
      }
      // Operator
      else if (c.match(/[-+*%/]/)) {
        yield this.simpleToken(Type.Operator)
      }
      // Equal sign
      else if (c === '=') {
        yield this.simpleToken(Type.Equal)
      }
      // Syntax error
      else {
        throw new Error(
          `Unexpeted character ${c} at line ${this.line} column ${this.col}`
        )
      }

      this.moveNext()
    }
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

  private moveNext(): this {
    this.cursor += 1
    this.col += 1

    return this
  }

  private addLine(n?: number, col = 1): this {
    this.line += n ?? 1
    this.col = col

    return this
  }

  private simpleToken(type: Type): Token {
    return {
      value: this.current,
      line: this.line,
      column: this.col,
      position: this.cursor,
      type,
    }
  }

  private read(type: Type, pattern: RegExp): Token {
    const buf: string[] = []

    const startLine = this.line
    const startCol = this.col
    const startPos = this.cursor

    while (!this.done) {
      if (this.current.match(pattern)) {
        buf.push(this.current)
      } else {
        this.cursor -= 1
        break
      }

      this.moveNext()
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

    this.moveNext()

    while (!this.done) {
      const c = this.current

      if (c === '\n') {
        this.addLine(1, 0)
      } else if (c === '}') {
        break
      }

      this.moveNext()
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
