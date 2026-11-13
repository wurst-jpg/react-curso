import { EditorState } from '@codemirror/state'
import { createAutocompleteExtension, createCompletionSources } from '../../src/autocomplete/autocompleteExtension.js'
import { complete, labels } from './helpers.js'

const files = { '/src/Saludo.jsx': 'function Saludo() {}' }

async function allLabels(sources, doc) {
  const out = []
  for (const s of sources) out.push(...labels(await complete(s, doc)))
  return out
}

describe('createAutocompleteExtension', () => {
  it('devuelve extensiones válidas para un EditorState', () => {
    const ext = createAutocompleteExtension({ getFiles: () => files })
    expect(Array.isArray(ext)).toBe(true)
    expect(() => EditorState.create({ doc: '', extensions: ext })).not.toThrow()
  })
})

describe('plantillas con el mismo hueco repetido (comp)', () => {
  it('permite varios cursores, necesarios para que el nombre se escriba en todos los sitios', () => {
    const state = EditorState.create({ doc: '', extensions: createAutocompleteExtension({ getFiles: () => files }) })
    expect(state.facet(EditorState.allowMultipleSelections)).toBe(true)
  })
})

describe('createCompletionSources', () => {
  it('juntos sugieren React, Tailwind y nombres del proyecto', async () => {
    const sources = createCompletionSources({ getFiles: () => files })
    expect(await allLabels(sources, 'useS|')).toContain('useState')
    expect(await allLabels(sources, 'Salu|')).toContain('Saludo')
    expect(await allLabels(sources, '<p className="bg-bl|">')).toContain('bg-blue-500')
    expect(await allLabels(sources, 'const bg-bl|')).not.toContain('bg-blue-500')
  })

  it('con el interruptor desactivado no hay ninguna sugerencia, y al reactivarlo vuelven', async () => {
    let enabled = false
    const sources = createCompletionSources({ getFiles: () => files, isEnabled: () => enabled })
    expect(await allLabels(sources, 'useS|')).toEqual([])
    expect(await allLabels(sources, '<p className="bg-bl|">')).toEqual([])
    expect(await allLabels(sources, 'Salu|')).toEqual([])
    enabled = true
    expect(await allLabels(sources, 'useS|')).toContain('useState')
  })
})

describe('createAutocompleteController', () => {
  it('el interruptor y los archivos cambian sin crear otra extensión', async () => {
    const { createAutocompleteController } = await import('../../src/autocomplete/autocompleteExtension.js')
    const controller = createAutocompleteController({ enabled: true, files: {} })
    const extension = controller.extension
    const state = EditorState.create({ doc: '', extensions: extension })
    expect(state).toBeTruthy()
    controller.setEnabled(false)
    controller.setFiles({ '/a.jsx': 'function Cosa() {}' })
    expect(controller.extension).toBe(extension)
  })
})

describe('estilo de la lista', () => {
  it('incluye un tema propio para .cm-tooltip-autocomplete', async () => {
    const { autocompleteTheme } = await import('../../src/autocomplete/autocompleteExtension.js')
    const css = JSON.stringify(autocompleteTheme)
    expect(autocompleteTheme).toBeTruthy()
    expect(Array.isArray(createAutocompleteExtension({ getFiles: () => files }))).toBe(true)
    // El tema se crea con EditorView.theme: debe ser una extensión que acepta EditorState.create
    expect(() => EditorState.create({ doc: '', extensions: [autocompleteTheme] })).not.toThrow()
    expect(css).toBeTruthy()
  })
})
