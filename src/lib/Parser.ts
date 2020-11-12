import type { Keyword } from './Grammar'
import type { Lexer } from './Lexer'
import type { Maybe } from './TypeTypes'
import type { AstNode } from './Ast'
import {
  makeIdentifierNode,
  makeProgramNode,
  makeAssignmentExpressionNode,
} from './Ast'
import type { Token, TokenKind } from './Token'
import {
  isLeftParen,
  isRightParen,
  isComment,
  isIdentifier,
  isKeyword,
  isKeywordAnyIf,
} from './Token'

export class Parser {
  private readonly lexer: Lexer
  private readonly iter: Generator<Token>
  private token: Maybe<Token>
  private isDone = false

  constructor(lexer: Lexer) {
    this.lexer = lexer
    this.iter = this.lexer.lex()
    this.advance()
  }

  public parse(): AstNode {
    this.comment()
    return this.program()
  }

  protected paren(): void {
    this.expectKind('left-paren')
    this.expression()
    this.expectKind('right-paren')
  }

  protected expression(): void {
    this.expectKind(['identifier', 'number', 'left-paren'], false)

    while (!this.isDone) {
      if (isKeyword(this.current) || isRightParen(this.current)) {
        break
      }

      if (isLeftParen(this.current)) {
        this.paren()
      } else {
        console.log(`-->`, this.current)
      }

      this.advance()
    }
  }

  protected assignment(): AstNode {
    const token = this.current
    this.advance()
    this.expect('=')

    const assignmentAst = makeAssignmentExpressionNode({
      identifier: makeIdentifierNode({ token }),
    })
    console.log(`Handle assignment of:`, assignmentAst)
    this.expression()
    return assignmentAst
  }

  protected block(): AstNode[] {
    const ret: AstNode[] = []

    while (!this.isDone) {
      // console.log(`Curr:`, this.current)
      if (isKeywordAnyIf(this.current)) {
        console.log(`Parse IF: %O\n`, this.current)
      } else if (isIdentifier(this.current)) {
        console.log(`Parse assignment`)
        ret.push(this.assignment())
      }

      this.advance()
    }

    return ret
  }

  protected program(): AstNode {
    const token = this.current
    this.expectKeyword('BEGIN')

    const programAst = makeProgramNode({
      body: this.block(),
      token,
    })

    this.expectKeyword('END')

    return programAst
  }

  protected comment(): this {
    while (isComment(this.current)) {
      this.advance()
    }

    return this
  }

  protected expectKeyword(keyword: Keyword, advance = true): void {
    this.expectKind('keyword', false)

    if (this.current.value !== keyword) {
      throw new Error(
        `Expected keyword ${keyword}, got ${
          this.current.value
        } at "${this.lexer.getErrorPositionMessage(this.current)}"`
      )
    }

    if (advance) {
      this.advance()
    }
  }

  protected expect(val: string, advance = true): this {
    if (this.current.value !== val) {
      throw new Error(`Expected token ${val}, got ${this.current.value}`)
    }

    if (advance) {
      this.advance()
    }

    return this
  }

  protected expectKind(kind: TokenKind | TokenKind[], advance = true): this {
    if (!Array.isArray(kind)) {
      kind = [kind]
    }

    if (!kind.includes(this.current.kind)) {
      throw new Error(`Expected ${kind} got ${this.current.kind}`)
    }

    if (advance) {
      this.advance()
    }

    return this
  }

  protected get current(): Token {
    if (!this.token) {
      throw new Error('Lexer is consumed')
    }

    return this.token
  }

  protected advance(): this {
    const t = this.iter.next()

    if (t.done) {
      this.isDone = true
      return this
    }

    this.token = t.value
    return this
  }
}
