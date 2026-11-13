import { syntaxTree } from '@codemirror/language'

const QUIET_NODES = new Set(['String', 'TemplateString', 'LineComment', 'BlockComment', 'JSXText'])

/**
 * ¿El cursor está dentro de un texto entre comillas, un comentario o texto suelto de JSX?
 * Ahí se escribe prosa, no código: no se sugiere nada (si no, Enter metería palabras sin querer).
 * Dentro de ${...} de una plantilla sí es código.
 */
export function isInsideTextOrComment(state, pos) {
  let node = syntaxTree(state).resolveInner(pos, -1)
  for (let depth = 0; node && depth < 5; depth++, node = node.parent) {
    if (QUIET_NODES.has(node.name)) return true
    if (node.name === 'Interpolation' || node.name === 'JSXExpressionContainer') return false
  }
  return false
}
