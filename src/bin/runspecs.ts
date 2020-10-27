import { Console } from 'console'
import { readdirSync, promises } from 'fs'
import { join, resolve } from 'path'
import { format } from 'util'
import { Tokenizer } from '../lib/tokenizer'
import { run } from './bitsy'
const specsdir = resolve(process.cwd(), 'bitsyspec', 'specs')
const files = readdirSync(specsdir)

async function extractExpected(
  path: string
): Promise<{ desc: string; expected: string }> {
  const data = await promises.readFile(path)
  const tok = new Tokenizer(data)
  tok.keepComments = true
  const comment = tok.tokenize().next()

  if (comment.done) {
    throw new Error('No description found')
  }

  const strs = comment.value.value.trim().split('\n')
  let desc = strs.shift()

  if (!desc) {
    throw new Error('No description found')
  }

  const m = desc.replace('Description: ', '').match(/"(.*?)"/)
  desc = m?.[1]

  if (!desc) {
    throw new Error('Malformed spec description')
  }

  const expected = strs.filter((s) => s.length > 0).join('')

  return { desc, expected }
}

class SpecConsole extends Console {
  private _stdoutbuf = ''
  private _stderrbuf = ''

  constructor() {
    super(process.stdout, process.stderr)
  }

  private printToBuf(buffer: 'stdout' | 'stderr', ...args: unknown[]): void {
    const fmt = args.shift()

    let buf = ''

    if (typeof fmt === 'string') {
      buf += format(fmt, ...args)
    } else {
      buf += `${fmt}`
    }

    if (buffer === 'stdout') {
      this._stdoutbuf += buf
    } else {
      this._stderrbuf += buf
    }
  }

  public log(...args: unknown[]): void {
    this.printToBuf('stdout', ...args)
  }

  public error(...args: unknown[]): void {
    this.printToBuf('stderr', ...args)
  }

  public get errors(): string {
    return this._stderrbuf
  }

  public get output(): string {
    return this._stdoutbuf
  }
}

function getConsole(): SpecConsole {
  const c = new SpecConsole()
  return c
}

async function runspec(): Promise<void> {
  for (const file of files) {
    if (file.endsWith('.bitsy')) {
      const fp = join(specsdir, file)
      const c = getConsole()
      const info = await extractExpected(fp)
      const orgConsole = console
      global.console = c
      await run(fp)
      global.console = orgConsole

      if (c.output === info.expected) {
        console.log(`✅ ${info.desc}`)
      } else {
        console.log(
          `❌ ${info.desc}, expected %O got %O`,
          info.expected,
          c.output
        )
      }
    }
  }
}

if (require.main?.filename === __filename) {
  runspec()
}
