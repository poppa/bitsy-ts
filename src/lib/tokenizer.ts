import type { Maybe } from './types'
import { Token } from './token'
import * as CharCode from './charcode'

type MatcherFn = () => Token | undefined

export class Tokenizer {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  readonly #input: string
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  readonly #len: number
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  #cursor = 0
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  #line = 1
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  #col = 1
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  #tokens: Token[] = []

  constructor(input: Readonly<string>) {
    this.#input = input
    this.#len = input.length
  }

  public get position(): number {
    return this.#cursor
  }

  public get length(): number {
    return this.#len
  }

  public get current(): number {
    const c = this.#input.charCodeAt(this.#cursor)
    return c
  }

  public get currentChar(): string {
    return this.#input.charAt(this.#cursor)
  }

  public get next(): number {
    return this.#input.charCodeAt(this.#cursor + 1)
  }

  public get prev(): number {
    return this.#input.charCodeAt(this.#cursor - 1)
  }

  public get done(): boolean {
    return isNaN(this.next)
  }

  public get tokens(): Token[] {
    return this.#tokens
  }

  public takeAndMoveNext(moveColumn = true): number {
    const c = this.current
    this.#cursor += 1

    if (moveColumn) {
      this.#col += 1
    }

    return c
  }

  public takeAndMoveNextChar(moveColumn = true): string {
    const c = this.currentChar
    this.#cursor += 1

    if (moveColumn) {
      this.#col += 1
    }

    return c
  }

  public take(matcher: MatcherFn): Token | undefined {
    const x = matcher()
    return x
  }

  public isValid(c: number): boolean {
    return CharCode.isValid(c)
  }

  public tokenize(): this {
    while (!this.done) {
      const curr = this.#cursor
      // console.log(`-> cursor: %O, %O (%O)`, curr, this.currentChar, this.#col)

      this.takeWs()
        .pushToken(this.take(this.matchComment.bind(this)))
        .pushToken(this.take(this.identifierMatcher.bind(this)))
        .pushToken(this.take(this.operatorMatcher.bind(this)))

      if (curr === this.#cursor) {
        throw new Error(
          `Unknown character ${this.currentChar} at ${this.#line}:${this.#col}`
        )
      }
    }

    return this
  }

  private takeWs(): this {
    this.pushToken(this.take(this.matchWhitespace.bind(this)))
    return this
  }

  private pushToken(token: Maybe<Token>, assert?: string): this {
    if (token) {
      this.#tokens.push(token)
    } else if (assert) {
      throw new Error(assert)
    }

    return this
  }

  private addLine(n?: number): this {
    this.#line += n ?? 1
    this.#col = 1

    return this
  }

  private moveCursor(n: number): this {
    this.#cursor += n
    this.#col += n

    return this
  }

  private matchWhitespace(): Maybe<Token> {
    const valid = [
      CharCode.Char.Space,
      CharCode.Char.Tab,
      CharCode.Char.Newline,
    ]

    const startCol = this.#col
    const startLine = this.#line
    const buf: string[] = []

    while (valid.includes(this.current)) {
      if (this.current === CharCode.Char.Newline) {
        this.addLine()
      }

      buf.push(this.takeAndMoveNextChar())
    }

    if (buf.length) {
      return new Token({
        column: startCol,
        line: startLine,
        position: this.#cursor,
        value: buf.join(''),
      })
    } else {
      return undefined
    }
  }

  private matchComment(): Maybe<Token> {
    if (this.current === CharCode.Char.CurlyLeft) {
      const colStart = this.#col
      const lineStart = this.#line
      const posStart = this.#cursor
      const endPos = this.#input.indexOf(
        String.fromCharCode(CharCode.Char.CurlyRight),
        this.#cursor + 1
      )

      if (endPos < 0) {
        throw new Error(
          `Comment close brace missing at ${lineStart}:${colStart}`
        )
      }

      const str = this.#input.substring(this.#cursor, endPos + 1)
      const nLines =
        str.split(String.fromCharCode(CharCode.Char.Newline)).length - 1

      if (nLines) {
        this.addLine(nLines)
      }

      this.moveCursor(str.length)

      return new Token({
        column: colStart,
        position: posStart,
        line: lineStart,
        value: str,
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-this
  private readonly identifierMatcher = this.makeSimpleMatcher(
    CharCode.validIdentiferChars()
  )

  // eslint-disable-next-line @typescript-eslint/no-invalid-this
  private readonly operatorMatcher = this.makeSimpleMatcher(
    CharCode.validOperatorChars()
  )

  private makeSimpleMatcher(valid: number[]): MatcherFn {
    return (): Maybe<Token> => {
      const acc: string[] = []
      const startCol = this.#col - 1

      while (valid.includes(this.current)) {
        acc.push(this.takeAndMoveNextChar())
      }

      if (acc.length) {
        return new Token({
          value: acc.join(''),
          column: startCol,
          line: this.#line,
          position: this.#cursor,
        })
      }

      return undefined
    }
  }
}
