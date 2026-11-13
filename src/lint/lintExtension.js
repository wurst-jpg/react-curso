import { linter, lintGutter } from '@codemirror/lint'
import { EditorView } from '@codemirror/view'
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

// Aviso oscuro, a juego con el editor (sin esto salía texto claro sobre fondo blanco).
export const lintTheme = EditorView.theme({
  // Al pasar el ratón por el subrayado, la lista `.cm-tooltip-lint` va dentro de un `.cm-tooltip`
  // (el marco); en el margen, el marco y la lista son el mismo elemento. Se pintan los dos casos.
  '.cm-tooltip.cm-tooltip-lint, .cm-tooltip:has(> .cm-tooltip-lint), .cm-tooltip-lint': {
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  '.cm-diagnostic': { padding: '4px 8px 4px 10px', color: '#e2e8f0', borderLeft: '5px solid #94a3b8' },
  '.cm-diagnostic-error': { borderLeftColor: '#f87171' },
  '.cm-diagnostic-warning': { borderLeftColor: '#fbbf24' },
  '.cm-diagnostic-info': { borderLeftColor: '#7dd3fc' },
  '.cm-diagnosticSource': { color: '#94a3b8' },
  '.cm-diagnosticAction': { backgroundColor: '#0369a1', color: '#ffffff', borderRadius: '4px', padding: '0 6px' },
  '.cm-panel.cm-panel-lint': { backgroundColor: '#0f172a', color: '#e2e8f0' },
  '.cm-panel.cm-panel-lint ul [aria-selected]': { backgroundColor: '#0369a1', color: '#ffffff' },
  '.cm-panel.cm-panel-lint button[name=close]': { color: '#e2e8f0' },
})

export function createLintExtension() {
  return [
    linter((view) => toDiagnostics(view.state.doc, lintSource(view.state.doc.toString())), { delay: 400 }),
    lintGutter(),
    lintTheme,
  ]
}
