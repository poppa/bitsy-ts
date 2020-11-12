import { Char } from './Char'

export type Keyword =
  | 'BEGIN'
  | 'END'
  | 'LOOP'
  | 'BREAK'
  | 'PRINT'
  | 'READ'
  | 'IFZ'
  | 'IFP'
  | 'IFN'
  | 'ELSE'

export const keywords: Keyword[] = [
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

export const operators = [
  Char.Plus,
  Char.Minus,
  Char.Multiply,
  Char.Divide,
  Char.Percent,
  Char.Equal,
]

export const enum Operator {
  Add = '+',
  Subtract = '-',
  Divide = '/',
  Multiply = '*',
  Modulus = '%',
}

export function isKeyword(word: string): boolean {
  return keywords.includes(word as Keyword)
}

export function isOperator(char: number): boolean {
  return operators.includes(char)
}

export function isIdentifierStartChar(c: number): boolean {
  return (
    (c >= Char.a && c <= Char.z) ||
    (c >= Char.A && c <= Char.Z) ||
    c === Char.Underscore
  )
}

export function isValidIdentifierChar(c: number): boolean {
  return (
    (c >= Char.a && c <= Char.z) ||
    (c >= Char.A && c <= Char.Z) ||
    (c >= Char.Zero && c <= Char.Nine) ||
    c === Char.Underscore
  )
}

export function isNumber(c: number): boolean {
  return c >= Char.Zero && c <= Char.Nine
}

export function isParen(c: number): boolean {
  return c === Char.LeftParen || c === Char.RightParen
}
