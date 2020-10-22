import { CodeGenerator } from './lib/codegen'
import { Parser } from './lib/parser'
import { Tokenizer } from './lib/tokenizer'

const t = new Tokenizer(`
BEGIN
  READ inp
  PRINT inp
END
`)

const gen = new CodeGenerator()
const p = new Parser(t, gen)
p.parse()

console.log(`%s`, gen.render())
