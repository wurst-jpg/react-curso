import { isInsideClassName } from './tailwindCompletions.js'
import { isInsideTextOrComment } from './codeContext.js'
import { reactLabels } from './reactCompletions.js'

const MIN_LENGTH = 3
// Palabras propias del lenguaje: ya las ofrecen otras fuentes o no aportan.
const IGNORED = new Set([
  'const', 'let', 'var', 'function', 'return', 'import', 'export', 'default', 'from', 'new', 'true',
  'false', 'null', 'undefined', 'this', 'else', 'for', 'while', 'switch', 'case', 'break', 'typeof',
])

/** Identificadores (nombres de componentes, variables, funciones) de un código, sin repetir. */
export function extractWords(code) {
  const found = new Set()
  for (const match of String(code).matchAll(/[A-Za-z_$][\w$]*/g)) {
    const word = match[0]
    if (word.length >= MIN_LENGTH && !IGNORED.has(word)) found.add(word)
  }
  return [...found]
}

/**
 * Sugiere los nombres que existen en todos los archivos del alumno.
 * `getFiles()` devuelve `{ ruta: código }` con lo que hay escrito ahora.
 */
export function createProjectSource(getFiles, isEnabled = () => true) {
  const perFile = new Map() // ruta -> { code, words }: solo se vuelve a leer lo que cambió
  return (context) => {
    if (!isEnabled()) return null
    if (isInsideClassName(context.state, context.pos) || isInsideTextOrComment(context.state, context.pos)) return null
    const word = context.matchBefore(/[\w$]*/)
    if (!word || (word.from === word.to && !context.explicit)) return null

    let files
    try {
      files = getFiles()
    } catch {
      return null
    }
    if (!files || typeof files !== 'object') return null

    const all = new Set()
    for (const [path, code] of Object.entries(files)) {
      if (typeof code !== 'string') continue
      let entry = perFile.get(path)
      if (entry?.code !== code) {
        entry = { code, words: extractWords(code) }
        perFile.set(path, entry)
      }
      for (const w of entry.words) all.add(w)
    }
    const typed = word.text
    all.delete(typed) // la palabra a medio escribir no se sugiere a sí misma
    for (const label of reactLabels()) all.delete(label) // ya las ofrece la fuente de React
    if (all.size === 0) return null
    return {
      from: word.from,
      options: [...all].map((label) => ({ label, type: 'variable', detail: 'de tu proyecto' })),
      validFor: /^[\w$]*$/,
    }
  }
}
