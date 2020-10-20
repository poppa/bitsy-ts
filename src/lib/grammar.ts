export const enum Keyword {
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

export const keywords = [
  'BEGIN',
  'END',
  'LOOP',
  'BREAK',
  'PRINT',
  'READ',
  'IFZ',
  'IFP',
  'IFN',
  'ELSE',
]

export function isKeyword(word: string): word is Keyword {
  return keywords.includes(word)
}

export const knownAtoms = ['(', ')', '+', '-', '*', '/', '%', '=']
