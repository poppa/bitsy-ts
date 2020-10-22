import { CodeGenerator } from './lib/codegen'
import { Parser } from './lib/parser'
import { Tokenizer } from './lib/tokenizer'

const t = new Tokenizer(`
  { Calculate the factorial of a postive integer }
  BEGIN
    factorial_of = 10

    counter = factorial_of
    accumulator = 1

    LOOP
      IFZ counter
        BREAK
      END

      accumulator = accumulator * counter
      counter = counter - 1
    END

    PRINT accumulator
  END`)

const gen = new CodeGenerator()
const p = new Parser(t, gen)
p.parse()

console.log(`%s`, gen.render())
