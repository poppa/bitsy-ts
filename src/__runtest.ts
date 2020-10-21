import { TypescriptGenerator } from './lib/codegen'
import { Parser } from './lib/parser'
import { Tokenizer } from './lib/tokenizer'

const t = new Tokenizer(`
  BEGIN
    LOOP
      LOOP
        n = n + (1 + 2)
        BREAK
      END
      BREAK
    END
  END`)

const gen = new TypescriptGenerator()
const p = new Parser(t, gen)
p.parse()

console.log(`%s`, gen.render())
