export class Tokenizer {
  private readonly input: string
  private cursor = 0

  constructor(input: Readonly<string>) {
    this.input = input
  }

  public get position(): number {
    return this.cursor
  }

  public get current(): number {
    const c = this.input.charCodeAt(this.cursor)
    return c
  }

  public takeNext(): void {
    this.cursor += 1
  }
}
