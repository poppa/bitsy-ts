/* eslint-disable @typescript-eslint/no-invalid-this */
import type { Token } from './token'
import { EventType } from './events'

interface Variable {
  token: Token
  reassigned?: boolean
}

class CodeBuffer {
  protected ind = 0
  private readonly b: string[] = []

  protected write(t: string, ind?: '+' | '-' | '='): this {
    if (ind && ind === '-') {
      this.ind -= 1
    }

    if (ind) {
      this.b.push('  '.repeat(this.ind))
    }

    this.b.push(t)

    if (ind && ind === '+') {
      this.ind += 1
    }

    return this
  }

  protected nl(): this {
    this.b.push('\n')
    return this
  }

  protected render(): string {
    return this.b.join('')
  }
}

type EventHandler = (token: Token) => void | CodeGenerator
type EventTypeMap = { [key in EventType]?: EventHandler }

const Noop = (): void => void 0
function BlockEnd<T extends CodeBuffer>(this: T): void {
  this.write('}', '-').nl()
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export class CodeGenerator extends CodeBuffer implements EventTypeMap {
  protected indent = 0
  protected variables: Map<string, Variable> = new Map()

  public render(): string {
    return `${this.header()}\n${super.render()}`
  }

  public emit(event: EventType, token: Token): void {
    const fn = this[event]

    if (typeof fn !== 'undefined') {
      fn(token)
    }
  }

  protected header(): string {
    let pre = ''

    this.variables.forEach((v) => {
      pre += `${v.reassigned ? 'let' : 'let'} ${v.token.value} = 0\n`
    })

    return pre
  }

  // Event handlers

  protected [EventType.ProgramStart] = Noop
  protected [EventType.ProgramEnd] = Noop
  protected [EventType.Read] = Noop
  protected [EventType.ReadEnd] = Noop
  protected [EventType.Ifn] = Noop
  protected [EventType.Ifp] = Noop

  protected [EventType.Else] = (): void => {
    this.ind -= 1
    this.write('} else {', '=').nl()
    this.ind += 1
  }

  protected [EventType.Assignment] = (token: Token): void => {
    const prev = this.variables.get(token.value)

    if (prev) {
      prev.reassigned = true
    } else {
      this.variables.set(token.value, { token })
    }

    this.write(`${token.value} = `, '=')
  }

  protected [EventType.Ifz] = (): this => this.write(`if (!`, '+')
  protected [EventType.IfEnd] = (): this => this.write(`) {`).nl()
  protected [EventType.Print] = (): this => this.write('console.log(', '=')
  protected [EventType.PrintEnd] = (): this => this.write(')').nl()
  protected [EventType.BlockEnd] = BlockEnd.bind(this)
  protected [EventType.LoopEnd] = BlockEnd.bind(this)
  protected [EventType.Break] = (): this => this.write('break', '=').nl()
  protected [EventType.AssignmentEnd] = (): this => this.nl()
  protected [EventType.LeftParen] = (): this => this.write('(')
  protected [EventType.RightParen] = (): this => this.write(')')
  protected [EventType.Number] = (token: Token): this => this.write(token.value)

  protected [EventType.LoopStart] = (): this =>
    this.write('while (true) {', '+').nl()

  protected [EventType.Operator] = (token: Token): this =>
    this.write(` ${token.value} `)

  protected [EventType.Symbol] = (token: Token): void => {
    if (!this.variables.has(token.value)) {
      throw new Error(
        `Undefined variable used in expression at line ` +
          `${token.line} column ${token.column}`
      )
    } else {
      const v = this.variables.get(token.value)

      if (v) {
        v.reassigned = true
      }
    }

    this.write(`${token.value}`)
  }
}

export class TypescriptGenerator extends CodeGenerator {
  protected header(): string {
    let pre =
      `/* Generated ${new Date().toISOString()} */\n` +
      `/* eslint-disable no-constant-condition */\n` +
      `/* eslint-disable @typescript-eslint/naming-convention */\n` +
      `/* eslint-disable @typescript-eslint/no-inferrable-types */\n\n`

    this.variables.forEach((v) => {
      pre += `${v.reassigned ? 'let' : 'let'} ${v.token.value}: number = 0\n`
    })

    return pre
  }
}
