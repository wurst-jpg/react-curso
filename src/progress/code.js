import { flattenChallenges } from '../content/course.js'
import { safeRead, safeWrite } from './storage.js'

export function codeKey(id) {
  return 'curso-react:code:v1:' + id
}

export function saveCode(id, files) {
  return safeWrite(codeKey(id), files)
}

export function loadCode(id) {
  const v = safeRead(codeKey(id), null)
  return v !== null && typeof v === 'object' && !Array.isArray(v) ? v : null
}

export function clearCode(id) {
  try {
    localStorage.removeItem(codeKey(id))
  } catch {
    // sin acceso al almacenamiento: no hay nada que borrar
  }
}

// Borra todo el código guardado de todos los retos (claves con el prefijo del curso).
export function clearAllCode() {
  try {
    const prefix = codeKey('')
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    // sin acceso al almacenamiento: no hay nada que borrar
  }
}

function locate(modules, id) {
  const flat = flattenChallenges(modules).map((e) => e.challenge)
  const i = flat.findIndex((c) => c.id === id)
  if (i === -1) return null
  return { flat, i }
}

// Versión limpia de un reto ya resuelto: su punto de partida con su solución aplicada.
// Recursivo para cadenas de `startFrom: 'previous'`; `useSaved` permite usar el código guardado.
function carry(flat, i, useSaved) {
  const ch = flat[i]
  if (useSaved) {
    const saved = loadCode(ch.id)
    if (saved) return saved
  }
  return { ...startOf(flat, i, useSaved), ...ch.solution }
}

function startOf(flat, i, useSaved) {
  const ch = flat[i]
  return ch.startFrom === 'previous' && i > 0 ? carry(flat, i - 1, useSaved) : ch.files
}

export function initialFiles(modules, id) {
  const saved = loadCode(id)
  if (saved) return saved
  const found = locate(modules, id)
  if (!found) return {}
  return startOf(found.flat, found.i, true)
}

export function cleanStartFiles(modules, id) {
  const found = locate(modules, id)
  if (!found) return {}
  return startOf(found.flat, found.i, false)
}

// Con `startFrom: 'previous'` la solución es un delta sobre el inicio limpio (no sobre los
// archivos del alumno, que pueden tener otros nombres). `cleanFiles` es ese inicio limpio.
export function solutionFiles(challenge, currentFiles, cleanFiles) {
  const base = challenge.startFrom === 'previous' && cleanFiles ? cleanFiles : currentFiles
  return { ...base, ...challenge.solution }
}
