import vm from 'vm'
import { compileFile } from '../lib/compiler'
import { getFile } from './compile'

export async function run(file: string): Promise<void> {
  const code = compileFile(file)
  global.require = require
  await vm.runInThisContext(code, { timeout: 200 })
}

if (require.main?.filename === __filename) {
  const file = getFile()
  run(file)
}
