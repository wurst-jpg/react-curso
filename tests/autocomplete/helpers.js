import { EditorState } from '@codemirror/state'
import { CompletionContext } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'

// Escribe `doc` con el cursor donde está "|" y ejecuta una fuente de completado real.
export async function complete(source, docWithCursor, explicit = false) {
  const pos = docWithCursor.indexOf('|')
  const doc = docWithCursor.replace('|', '')
  const state = EditorState.create({ doc, selection: { anchor: pos }, extensions: [javascript({ jsx: true })] })
  return source(new CompletionContext(state, pos, explicit))
}

export const labels = (result) => (result ? result.options.map((o) => o.label) : [])
