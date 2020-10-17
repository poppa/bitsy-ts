import type { Maybe } from './types'
import type { Token } from './token'
import { makeToken } from './token'
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

  public get length(): number {
    return this.#len
  }

  public get tokens(): Token[] {
    return this.#tokens
  }

  public tokenize(): this {
    const boundComment = this.matchComment.bind(this)
    const boundIdent = this.identifierMatcher.bind(this)
    const boundOp = this.operatorMatcher.bind(this)

    while (!this.done) {
      const curr = this.#cursor

      this.takeWs()
        .pushToken(this.take(boundComment))
        .pushToken(this.take(boundIdent))
        .pushToken(this.take(boundOp))

      if (curr === this.#cursor) {
        throw new Error(
          `Unknown character ${this.currentChar} at ${this.#line}:${this.#col}`
        )
      }
    }

    return this
  }

  private get current(): number {
    const c = this.#input.charCodeAt(this.#cursor)
    return c
  }

  private get currentChar(): string {
    return this.#input.charAt(this.#cursor)
  }

  private get next(): number {
    return this.#input.charCodeAt(this.#cursor + 1)
  }

  private get done(): boolean {
    return isNaN(this.next)
  }

  private takeAndMoveNextChar(): string {
    const c = this.currentChar
    this.#cursor += 1
    this.#col += 1

    return c
  }

  private take(matcher: MatcherFn): Token | undefined {
    const x = matcher()
    return x
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

  private addLine(n?: number, col = 1): this {
    this.#line += n ?? 1
    this.#col = col

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
        this.addLine(1, 0)
      }

      buf.push(this.takeAndMoveNextChar())
    }

    if (buf.length) {
      return makeToken({
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

      return makeToken({
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
      const startCol = this.#col

      while (valid.includes(this.current)) {
        acc.push(this.takeAndMoveNextChar())
      }

      if (acc.length) {
        return makeToken({
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
