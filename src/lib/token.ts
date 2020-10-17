export interface Token {
  readonly line: number
  readonly column: number
  readonly position: number
  readonly value: string
}

export function makeToken(tok: Token): Token {
  // const t = Object.create(tok)
  return tok
}
