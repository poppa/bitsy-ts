import { isKeyword, knownAtoms } from './grammar'
import type { Token } from './token'
import { charToType, Type } from './token'

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
      else if (c === '-' && /[0-9]/.test(this.input[this.cursor + 1])) {
        yield this.readNumber()
      }
      // Regular number
      else if (/[0-9]/.test(c)) {
        yield this.readNumber()
      }
      // Symbol
      else if (/[_a-zA-Z]/.test(c)) {
        yield this.readSymbol()
      }
      // Operators, equal, and parenses
      else if (knownAtoms.includes(c)) {
        yield this.currentToken()
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

  private get current(): string {
    const c = this.input[this.cursor]

    if (c === undefined) {
      throw new Error(`Read beyond input lenth`)
    }

    return this.input[this.cursor]
  }

  private get done(): boolean {
    return this.input[this.cursor] === undefined
  }

  private advance(): this {
    this.cursor += 1
    this.col += 1

    return this
  }

  private pushback(): this {
    this.cursor -= 1
    this.col -= 1

    return this
  }

  private addLine(n?: number, col = 1): this {
    this.line += n ?? 1
    this.col = col

    return this
  }

  private currentToken(typ?: Type): Token {
    return {
      value: this.current,
      line: this.line,
      column: this.col,
      position: this.cursor,
      type: typ ?? charToType(this.current),
    }
  }

  private readSymbol(): Token {
    const initpos = this.positionInfo()

    let buf = this.current
    const re = /[_a-zA-Z0-9]/
    this.advance()

    while (!this.done && re.test(this.current)) {
      buf += this.current
      this.advance()
    }

    this.pushback()

    return {
      ...initpos,
      type: isKeyword(buf) ? Type.Keyword : Type.Symbol,
      value: buf,
    }
  }

  private readNumber(): Token {
    const initpos = this.positionInfo()

    let buf = this.current
    const re = /[_0-9]/

    this.advance()

    while (!this.done && re.test(this.current)) {
      buf += this.current
      this.advance()
    }

    this.pushback()

    return {
      ...initpos,
      type: Type.Number,
      value: buf,
    }
  }

  private positionInfo(): { line: number; column: number; position: number } {
    return {
      line: this.line,
      column: this.col,
      position: this.cursor,
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
