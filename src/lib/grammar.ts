export enum Keyword {
  Begin = 'BEGIN',
  End = 'END',
  Loop = 'LOOP',
  Break = 'BREAK',
  Print = 'PRINT',
  Read = 'READ',
  Ifz = 'IFZ',
  Ifp = 'IFP',
  Ifn = 'IFN',
  Else = 'ELSE',
}

export const keywords = Object.values(Keyword) as string[]

export function isKeyword(word: string): word is Keyword {
  return keywords.includes(word)
}

export const knownAtoms = ['(', ')', '+', '-', '*', '/', '%', '=']
