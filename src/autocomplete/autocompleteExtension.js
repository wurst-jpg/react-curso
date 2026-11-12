import { autocompletion, acceptCompletion } from '@codemirror/autocomplete'
import { EditorState, Prec } from '@codemirror/state'
import { keymap } from '@codemirror/view'
import { createReactSource } from './reactCompletions.js'
import { createTailwindSource } from './tailwindCompletions.js'
import { createProjectSource } from './projectWords.js'

/**
 * Las tres fuentes de sugerencias. `isEnabled()` se consulta cada vez: así el interruptor
 * funciona sin reconfigurar ni recrear el editor (el código y la vista previa no se tocan).
 */
export function createCompletionSources({ getFiles, isEnabled = () => true }) {
  return [createReactSource(isEnabled), createTailwindSource(isEnabled), createProjectSource(getFiles, isEnabled)]
}

/**
 * Autocompletado tipo VS Code. El cierre automático de paréntesis, comillas y etiquetas
 * ya lo hace Sandpack (closeBrackets + autoCloseTags de lang-javascript), no se repite aquí.
 */
export function createAutocompleteExtension({ getFiles, isEnabled }) {
  return [
    // Las plantillas repiten un hueco (p. ej. el nombre del componente) con varios cursores a la vez.
    EditorState.allowMultipleSelections.of(true),
    autocompletion({ override: createCompletionSources({ getFiles, isEnabled }), icons: true }),
    // Tab elige la sugerencia (como Enter); sin lista abierta, Tab sigue sangrando como siempre.
    Prec.high(keymap.of([{ key: 'Tab', run: acceptCompletion }])),
  ]
}

/**
 * Autocompletado con interruptor y archivos "vivos": `extension` se crea una sola vez
 * (por eso el editor no se recrea) y `setEnabled` / `setFiles` solo cambian lo que las
 * fuentes consultan en cada sugerencia.
 */
export function createAutocompleteController({ enabled = true, files = {} } = {}) {
  let isOn = enabled
  let current = files
  return {
    extension: createAutocompleteExtension({ getFiles: () => current, isEnabled: () => isOn }),
    setEnabled(value) {
      isOn = Boolean(value)
    },
    setFiles(value) {
      current = value
    },
  }
}
