import vm from 'vm'
import { compileFile } from '../lib/compiler'
import { getFile } from './compile'

const file = getFile()
const code = compileFile(file)

vm.runInThisContext(code, { timeout: 200 })
