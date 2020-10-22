import { resolve } from 'path'
import { compileFile } from '../lib/compiler'

export function getFile(): string {
  const file = process.argv.find((f) => f.endsWith('.bitsy'))

  if (!file) {
    console.error(`Expected a bitsy file as argument`)
    process.exit(1)
  }

  return resolve(file)
}

if (require.main?.filename === __filename) {
  const code = compileFile(getFile())
  console.log(code)
}
