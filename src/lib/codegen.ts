import type { Token } from './token'

export type EventType =
  | 'program start'
  | 'program end'
  | 'loop start'
  | 'loop end'
  | 'break'
  | 'ifz start'
  | 'ifz end'
  | 'ifp start'
  | 'ifp end'
  | 'ifn start'
  | 'ifn end'
  | 'else'
  | 'assignment'
  | 'assignment end'
  | 'number'
  | 'operator'
  | 'left paren'
  | 'right paren'
  | 'symbol'

interface Variable {
  token: Token
  reassigned?: boolean
}

class CodeBuffer {
  private ind = 0
  private readonly b: string[] = []

  public write(t: string, ind?: '+' | '-' | '='): this {
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

  public nl(): this {
    this.b.push('\n')
    return this
  }

  public render(): string {
    return this.b.join('')
  }
}

export class CodeGenerator {
  protected indent = 0
  protected variables: Map<string, Variable> = new Map()
  protected buf = new CodeBuffer()

  public render(): string {
    return `${this.header()}\n${this.buf.render()}\n`
  }

  public emit(event: EventType, token: Token): void {
    switch (event) {
      case 'assignment':
        this.startAssignment(token)
        break

      case 'assignment end':
        this.endAssignment()
        break

      case 'loop start':
        this.startLoop()
        break

      case 'loop end':
        this.endBlock()
        break

      case 'break':
        this.break()
        break

      case 'left paren':
        this.leftParen()
        break

      case 'right paren':
        this.rightParen()
        break

      case 'operator':
        this.operator(token)
        break

      case 'number':
        this.number(token)
        break

      case 'symbol':
        this.symbol(token)
        break

      default:
      // throw new Error(`Unhandled event ${event}`)
    }
  }

  protected header(): string {
    let pre = ''

    this.variables.forEach((v) => {
      pre += `${v.reassigned ? 'let' : 'const'} ${v.token.value} = 0\n`
    })

    return pre
  }

  protected startLoop(): void {
    this.buf.write('while (true) {', '+').nl()
  }

  protected endBlock(): void {
    this.buf.write('}', '-').nl()
  }

  protected break(): void {
    this.buf.write('break', '=').nl()
  }

  protected startAssignment(token: Token): void {
    const prev = this.variables.get(token.value)

    if (prev) {
      prev.reassigned = true
    } else {
      this.variables.set(token.value, { token })
    }

    this.buf.write(`${token.value} = `, '=')
  }

  protected endAssignment(): void {
    this.buf.nl()
  }

  protected leftParen(): void {
    this.buf.write('(')
  }

  protected rightParen(): void {
    this.buf.write(')')
  }

  protected number(token: Token): void {
    this.buf.write(token.value)
  }

  protected operator(token: Token): void {
    this.buf.write(` ${token.value} `)
  }

  protected symbol(token: Token): void {
    if (!this.variables.has(token.value)) {
      throw new Error(
        `Undefined variable used in expression at line ${token.line} column ${token.column}`
      )
    } else {
      const v = this.variables.get(token.value)

      if (v) {
        v.reassigned = true
      }
    }

    this.buf.write(`${token.value}`)
  }
}

export class TypescriptGenerator extends CodeGenerator {
  protected header(): string {
    let pre = ''

    this.variables.forEach((v) => {
      pre += `${v.reassigned ? 'let' : 'const'} ${v.token.value}: number = 0\n`
    })

    return pre
  }
}
