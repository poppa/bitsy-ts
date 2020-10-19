export const enum Type {
  Symbol,
  Operator,
  Equal,
  Number,
}

export interface Token {
  readonly line: number
  readonly column: number
  readonly position: number
  readonly value: string
  readonly type: Type
}

export type SimpleToken = Omit<Token, 'type'>

export function makeToken(tok: Token): Token {
  // const t = Object.create(tok)
  return tok
}
