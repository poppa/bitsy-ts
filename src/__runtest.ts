import { readFileSync } from 'fs'
import { join } from 'path'
import { Tokenizer } from './lib/tokenizer'
const data = readFileSync(join(__dirname, '..', 'samples', 'collatz.bitsy'))
const t = new Tokenizer(data)

for (const tok of t.tokenize()) {
  console.log(`Tok:`, tok)
}
