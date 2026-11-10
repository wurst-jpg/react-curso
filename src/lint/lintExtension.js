import { linter, lintGutter } from '@codemirror/lint'
import { lintSource } from './lintSource.js'

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)

function toPos(doc, line, column) {
  const l = clamp(line, 1, doc.lines)
  const info = doc.line(l)
  return clamp(info.from + Math.max(column - 1, 0), info.from, info.to)
}

/** Convierte resultados de lintSource (línea/columna) en diagnósticos de CodeMirror. */
export function toDiagnostics(doc, results) {
  return results.map((r) => {
    const from = toPos(doc, r.line, r.column)
    const to = Math.max(from, toPos(doc, r.endLine, r.endColumn))
    return {
      from,
      to,
      severity: r.severity === 2 ? 'error' : 'warning',
      message: r.message,
    }
  })
}

export function createLintExtension() {
  return [
    linter((view) => toDiagnostics(view.state.doc, lintSource(view.state.doc.toString())), { delay: 400 }),
    lintGutter(),
  ]
}
