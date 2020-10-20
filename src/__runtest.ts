import { Parser } from './lib/parser'
import { Tokenizer } from './lib/tokenizer'

const t = new Tokenizer(`
  BEGIN
    LOOP
      n = 1
      BREAK
    END
  END`)

const p = new Parser(t)
p.parse()
