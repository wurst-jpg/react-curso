import { autocompletion, acceptCompletion } from '@codemirror/autocomplete'
import { EditorState, Prec } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { createReactSource } from './reactCompletions.js'
import { createTailwindSource } from './tailwindCompletions.js'
import { createProjectSource } from './projectWords.js'
import { createImportSource } from './importCompletions.js'

// Lista oscura, a juego con el editor: fondo oscuro, texto claro, opción elegida en azul cielo.
export const autocompleteTheme = EditorView.theme({
  '.cm-tooltip.cm-tooltip-autocomplete': {
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    border: '1px solid #334155',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  '.cm-tooltip-autocomplete > ul': { fontFamily: 'inherit', maxHeight: '14em' },
  '.cm-tooltip-autocomplete > ul > li': { padding: '2px 8px', color: '#e2e8f0' },
  '.cm-tooltip-autocomplete .cm-completionDetail': { color: '#94a3b8', fontStyle: 'normal', marginLeft: '0.8em' },
  '.cm-tooltip-autocomplete .cm-completionMatchedText': { color: '#7dd3fc', textDecoration: 'none', fontWeight: 'bold' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: '#0284c7', color: '#ffffff' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionDetail': { color: '#e0f2fe' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected] .cm-completionMatchedText': { color: '#ffffff' },
})

/**
 * Las tres fuentes de sugerencias. `isEnabled()` se consulta cada vez: así el interruptor
 * funciona sin reconfigurar ni recrear el editor (el código y la vista previa no se tocan).
 */
export function createCompletionSources({ getFiles, getActivePath = () => '', isEnabled = () => true }) {
  return [createImportSource(getFiles, getActivePath, isEnabled), createReactSource(isEnabled), createTailwindSource(isEnabled), createProjectSource(getFiles, isEnabled)]
}

/**
 * Autocompletado tipo VS Code. El cierre automático de paréntesis, comillas y etiquetas
 * ya lo hace Sandpack (closeBrackets + autoCloseTags de lang-javascript), no se repite aquí.
 */
export function createAutocompleteExtension({ getFiles, getActivePath, isEnabled }) {
  return [
    // Las plantillas repiten un hueco (p. ej. el nombre del componente) con varios cursores a la vez.
    EditorState.allowMultipleSelections.of(true),
    autocompleteTheme,
    autocompletion({ override: createCompletionSources({ getFiles, getActivePath, isEnabled }), icons: true }),
    // Tab elige la sugerencia (como Enter); sin lista abierta, Tab sigue sangrando como siempre.
    Prec.high(keymap.of([{ key: 'Tab', run: acceptCompletion }])),
  ]
}

/**
 * Autocompletado con interruptor y archivos "vivos": `extension` se crea una sola vez
 * (por eso el editor no se recrea) y `setEnabled` / `setFiles` solo cambian lo que las
 * fuentes consultan en cada sugerencia.
 */
export function createAutocompleteController({ enabled = true, files = {}, activePath = '' } = {}) {
  let isOn = enabled
  let current = files
  let active = activePath
  return {
    extension: createAutocompleteExtension({ getFiles: () => current, getActivePath: () => active, isEnabled: () => isOn }),
    setEnabled(value) {
      isOn = Boolean(value)
    },
    setFiles(value) {
      current = value
    },
    setActivePath(value) {
      active = value
    },
  }
}
