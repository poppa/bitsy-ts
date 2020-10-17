export class Token {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  readonly #line: number
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  readonly #col: number
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  readonly #position: number
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  readonly #value: string

  constructor({
    column,
    line,
    value,
    position,
  }: {
    line: number
    column: number
    value: string
    position: number
  }) {
    this.#value = value
    this.#line = line
    this.#col = column
    this.#position = position
  }

  public get line(): number {
    return this.#line
  }

  public get column(): number {
    return this.#col
  }

  public get value(): string {
    return this.#value
  }

  public get position(): number {
    return this.#position
  }
}
