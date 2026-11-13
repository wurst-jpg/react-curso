import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { forceLinting, forEachDiagnostic } from '@codemirror/lint'
import { createLintExtension, lintTheme, toDiagnostics } from '../../src/lint/lintExtension.js'

describe('lintExtension', () => {
  it('createLintExtension devuelve un arreglo de extensiones', () => {
    expect(Array.isArray(createLintExtension())).toBe(true)
  })

  it('convierte línea/columna a posiciones del documento', () => {
    const doc = 'const a = 1\nfoo()\n'
    const state = EditorState.create({ doc })
    const [d] = toDiagnostics(state.doc, [
      { line: 2, column: 1, endLine: 2, endColumn: 4, severity: 2, message: 'm' },
    ])
    expect(d).toMatchObject({ from: 12, to: 15, severity: 'error', message: 'm' })
  })

  it('protege posiciones fuera de rango y mapea severidad 1 a warning', () => {
    const state = EditorState.create({ doc: 'a' })
    const [d] = toDiagnostics(state.doc, [
      { line: 99, column: 99, endLine: 120, endColumn: 5, severity: 1, message: 'x' },
    ])
    expect(d.from).toBeGreaterThanOrEqual(0)
    expect(d.to).toBeLessThanOrEqual(1)
    expect(d.from).toBeLessThanOrEqual(d.to)
    expect(d.severity).toBe('warning')
  })

  it('el editor real marca los errores del código', async () => {
    const view = new EditorView({
      state: EditorState.create({ doc: 'foo()\n', extensions: createLintExtension() }),
      parent: document.body,
    })
    forceLinting(view)
    await new Promise((r) => setTimeout(r, 50))
    const found = []
    forEachDiagnostic(view.state, (d) => found.push(d))
    expect(found.some((d) => d.severity === 'error')).toBe(true)
    view.destroy()
  })

  it('incluye un tema oscuro para el aviso (texto claro sobre fondo oscuro)', () => {
    expect(createLintExtension()).toContain(lintTheme)
    const view = new EditorView({
      state: EditorState.create({ doc: 'a', extensions: createLintExtension() }),
      parent: document.body,
    })
    expect(view.dom.className).toMatch(/ͼ/)
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent).join('\n')
    expect(css).toMatch(/\.cm-tooltip\.cm-tooltip-lint/)
    expect(css).toContain('#0f172a')
    view.destroy()
  })
})
