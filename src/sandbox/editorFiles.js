import { HIDDEN_PATHS, studentFiles } from './buildSandbox.js'

// Sandpack (template "react") mezcla sus propios archivos de plantilla (/App.js,
// /index.js, /styles.css, /package.json) con los nuestros. Los archivos del alumno
// son siempre los que viven bajo /src/ y no están ocultos.
export function editorFiles(sandpackFiles) {
  const plain = {}
  for (const [path, value] of Object.entries(studentFiles(sandpackFiles))) {
    if (!path.startsWith('/src/')) continue
    plain[path] = typeof value === 'string' ? value : (value?.code ?? '')
  }
  return plain
}

const ALLOWED = /\.(jsx|js|css)$/
const SAFE_SEGMENT = /^[A-Za-z0-9_.-]+$/

/** Convierte lo que escribe el alumno en una ruta `/src/...` o devuelve `{ error }`. */
export function normalizeNewPath(input, existingPaths) {
  let rest = String(input ?? '').trim().replace(/\\/g, '/')
  rest = rest.replace(/^\.\//, '').replace(/^\/+/, '')
  if (rest.startsWith('src/')) rest = rest.slice(4)
  rest = rest.replace(/^\/+/, '')
  if (rest === '') return { error: 'Escribe un nombre para el archivo, por ejemplo Saludo.jsx.' }
  const segments = rest.split('/')
  if (segments.some((s) => !SAFE_SEGMENT.test(s) || s === '.' || s === '..')) {
    return {
      error: 'Ese nombre no es válido. Usa solo letras, números, guiones y puntos, sin espacios.',
    }
  }
  if (!ALLOWED.test(rest)) {
    return { error: 'El nombre debe terminar en .jsx, .js o .css (por ejemplo Saludo.jsx).' }
  }
  const path = '/src/' + rest
  if (existingPaths.includes(path) || HIDDEN_PATHS.includes(path)) {
    return { error: `Ya existe un archivo llamado ${path}. Elige otro nombre.` }
  }
  return { path }
}
