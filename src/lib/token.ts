export const enum Type {
  Symbol,
  Operator,
  Equal,
  Number,
  LeftParen,
  RightParen,
}

export const typeMap = [
  'Symbol',
  'Operator',
  'Equal',
  'Number',
  'LeftParen',
  'RightParen',
]

export interface Token {
  readonly line: number
  readonly column: number
  readonly position: number
  readonly value: string
  readonly type: Type
}

export function charToType(c: string): Type {
  switch (c) {
    case '-': // fall-through
    case '+': // fall-through
    case '/': // fall-through
    case '*': // fall-through
    case '%':
      return Type.Operator

    case '=':
      return Type.Equal

    case '(':
      return Type.LeftParen

    case ')':
      return Type.RightParen

    default:
      throw new Error(`Unknown character`)
  }
}
