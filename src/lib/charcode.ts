/* eslint-disable @typescript-eslint/naming-convention */

export const enum Char {
  Zero = 48,
  One = 49,
  Two = 50,
  Three = 51,
  Four = 52,
  Five = 53,
  Six = 54,
  Seven = 55,
  Eight = 56,
  Nine = 57,
  a = 97,
  b = 98,
  c = 99,
  d = 100,
  e = 101,
  f = 102,
  g = 103,
  h = 104,
  i = 105,
  j = 106,
  k = 107,
  l = 108,
  m = 109,
  n = 110,
  o = 111,
  p = 112,
  q = 113,
  r = 114,
  s = 115,
  t = 116,
  u = 117,
  v = 118,
  x = 120,
  y = 121,
  z = 122,
  A = 65,
  B = 66,
  C = 67,
  D = 68,
  E = 69,
  F = 70,
  G = 71,
  H = 72,
  I = 73,
  J = 74,
  K = 75,
  L = 76,
  M = 77,
  N = 78,
  O = 79,
  P = 80,
  Q = 81,
  R = 82,
  S = 83,
  T = 84,
  U = 85,
  V = 86,
  X = 88,
  Y = 89,
  Z = 90,
  Equal = 61,
  Plus = 43,
  Minus = 45,
  Multiply = 42,
  Divide = 47,
  CurlyLeft = 123,
  CurlyRight = 125,
  Percent = 37,
  Underscore = 95,
  Tab = 9,
  Newline = 10,
  Space = 32,
}

// prettier-ignore
const validCodes = [
   9,  10,  32,  37,  42,  43,  45,  47,  48,  49,  50,  51,
  52,  53,  54,  55,  56,  57,  61,  65,  66,  67,  68,  69,
  70,  71,  72,  73,  74,  75,  76,  77,  78,  79,  80,  81,
  82,  83,  84,  85,  86,  88,  89,  90,  95,  97,  98,  99,
 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111,
 112, 113, 114, 115, 116, 117, 118, 120, 121, 122, 123, 125
]

export function isValid(char: number): boolean {
  return validCodes.includes(char)
}

export function validSymbolChars(): number[] {
  const chars: number[] = []

  for (let i = Char.Zero; i < Char.Nine; i++) {
    chars.push(i)
  }

  for (let i = Char.a; i < Char.z; i++) {
    chars.push(i)
  }

  for (let i = Char.A; i < Char.Z; i++) {
    chars.push(i)
  }

  chars.push(Char.Underscore)

  return chars
}

export function validOperatorChars(): number[] {
  return [
    Char.Equal,
    Char.Minus,
    Char.Divide,
    Char.Multiply,
    Char.Percent,
    Char.Plus,
  ]
}
