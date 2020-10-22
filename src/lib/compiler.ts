import { existsSync, readFileSync } from 'fs'
import { CodeGenerator } from './codegen'
import { Parser } from './parser'
import { Tokenizer } from '../mod'

export function compileFile(path: string): string {
  if (!existsSync(path)) {
    console.error(`No such file %O`, path)
  }

  const gen = new CodeGenerator()
  const tok = new Tokenizer(readFileSync(path))
  const parser = new Parser(tok, gen)
  parser.parse()

  return gen.render()
}
