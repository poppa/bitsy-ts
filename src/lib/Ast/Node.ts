import type { Token } from '../Token'
import type {
  AstNode,
  BlockStatement,
  Identifier,
  Program,
  Type,
  Comment,
  Literal,
  AssignmentExpression,
  Expression,
} from './Interface'

interface Options {
  token?: Token
}

interface BlockOptions extends Options {
  body?: AstNode[]
}

function makeNode<T extends AstNode = AstNode>(
  options: Options & { type: Type }
): T {
  const n: AstNode = { type: options.type }

  if (options.token) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    n.token = options.token
  }

  return n as T
}

function makeBlockNode<T extends BlockStatement>(
  options: Options & { type: Type }
): T {
  const n = makeNode<T>(options)
  n.body = []
  return n
}

export function makeProgramNode(options: Required<BlockOptions>): Program {
  const n = makeBlockNode<Program>({ type: 'Program', ...options })
  n.body = options.body
  return n
}

export function makeIdentifierNode(options: Required<Options>): Identifier {
  const n = makeNode<Identifier>({ type: 'Identifier', ...options })
  n.name = options.token.value
  return n
}

export function makeCommentNode(options: Required<Options>): Comment {
  const n = makeNode<Comment>({ type: 'Comment', ...options })
  n.text = options.token.value
  return n
}

export function makeLiteralNode(options: Required<Options>): Literal {
  const n = makeNode<Literal>({ type: 'Literal', ...options })
  n.value = parseInt(options.token.value, 10)
  return n
}

export function makeAssignmentExpressionNode(options: {
  identifier: Identifier
  expression?: Expression
}): AssignmentExpression {
  const n = makeNode<AssignmentExpression>({ type: 'AssignmentExpression' })
  n.operator = '='
  n.left = options.identifier

  if (options.expression) {
    n.right = options.expression
  }

  return n
}
