import { existsSync, readFileSync } from 'fs'
import { CodeGenerator } from './codegen'
import { Parser } from './parser'
import { Tokenizer } from './tokenizer'

export function compileFile(path: string): string {
  if (!existsSync(path)) {
    console.error(`No such file %O`, path)
  }

  return compileString(readFileSync(path))
}

export function compileString(bitsyCode: string | Buffer): string {
  const gen = new CodeGenerator()
  const tok = new Tokenizer(bitsyCode)
  const parser = new Parser(tok, gen)
  parser.parse()

  return gen.render()
}
