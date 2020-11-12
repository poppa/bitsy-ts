import type { Token } from '../Token'

export type Type =
  | 'Program'
  | 'Identifier'
  | 'Expression'
  | 'BinaryExpression'
  | 'Statement'
  | 'Literal'
  | 'Comment'
  | 'AssignmentExpression'

export interface AstNode {
  readonly type: Type
  readonly token?: Token
}

export type Expression = Omit<AstNode, 'token'>

export interface BlockStatement extends AstNode {
  body: AstNode[]
}

export interface Program extends BlockStatement {
  type: 'Program'
}

export interface Identifier extends AstNode {
  type: 'Identifier'
  name: string
}

export interface Literal extends AstNode {
  type: 'Literal'
  value: number
}

export interface Comment extends AstNode {
  type: 'Comment'
  text: string
}

export interface AssignmentExpression extends Expression {
  type: 'AssignmentExpression'
  operator: '='
  left: Identifier
  right: Expression
}
