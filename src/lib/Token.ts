import type { Keyword } from './Grammar'

export type TokenKind =
  | 'comment'
  | 'operator'
  | 'keyword'
  | 'identifier'
  | 'number'
  | 'left-paren'
  | 'right-paren'

export interface Position {
  line: number
  column: number
}

export interface Token {
  kind: TokenKind
  value: string
  position: {
    start: Position
    end: Position
  }
}

type IsFunction = (token: Token) => boolean

function is(kind: TokenKind): IsFunction {
  return (token): boolean => token.kind === kind
}

function iskw(kw: Keyword): IsFunction {
  return (token): boolean => token.kind === 'keyword' && token.value === kw
}

export const isComment = is('comment')
export const isOperator = is('operator')
export const isKeyword = is('keyword')
export const isIdentifier = is('identifier')
export const isNumber = is('number')
export const isLeftParen = is('left-paren')
export const isRightParen = is('right-paren')

export const isKeywordBegin = iskw('BEGIN')
export const isKeywordEnd = iskw('END')
export const isKeywordLoop = iskw('LOOP')
export const isKeywordBreak = iskw('BREAK')
export const isKeywordPrint = iskw('PRINT')
export const isKeywordRead = iskw('READ')
export const isKeywordIfz = iskw('IFZ')
export const isKeywordIfn = iskw('IFN')
export const isKeywordIfp = iskw('IFP')
export const isKeywordElse = iskw('ELSE')

export const isKeywordAnyIf: IsFunction = (token): boolean => {
  return isKeyword(token) && ['IFN', 'IFP', 'IFZ'].includes(token.value)
}
