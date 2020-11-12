import { Lexer } from './lib/Lexer'
import { Parser } from './lib/Parser'

async function run(): Promise<void> {
  const lexer = await Lexer.fromFile('samples/program.bitsy', {
    keepComments: true,
  })
  const parser = new Parser(lexer)

  try {
    const node = parser.parse()
    // console.log(`\nDone`)
    console.log(`Node:`, node)
    // for (const tok of lexer.lex()) {
    //   if (typeof tok === 'object') {
    //     console.log(`Tok:`, tok)
    //   }
    // }
  } catch (err: unknown) {
    console.error('Error:', err)
  }
}

run()
