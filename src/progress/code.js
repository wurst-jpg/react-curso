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

function locate(modules, id) {
  const flat = flattenChallenges(modules)
  const i = flat.findIndex((e) => e.challenge.id === id)
  if (i === -1) return null
  return { challenge: flat[i].challenge, prev: i > 0 ? flat[i - 1].challenge : null }
}

// Versión limpia del reto anterior: sus archivos con su solución aplicada.
function cleanPrevious(prev) {
  return { ...prev.files, ...prev.solution }
}

export function initialFiles(modules, id) {
  const saved = loadCode(id)
  if (saved) return saved
  const found = locate(modules, id)
  if (!found) return {}
  const { challenge, prev } = found
  if (challenge.startFrom === 'previous' && prev) {
    return loadCode(prev.id) ?? cleanPrevious(prev)
  }
  return challenge.files
}

export function cleanStartFiles(modules, id) {
  const found = locate(modules, id)
  if (!found) return {}
  const { challenge, prev } = found
  if (challenge.startFrom === 'previous' && prev) return cleanPrevious(prev)
  return challenge.files
}

export function solutionFiles(challenge, currentFiles) {
  return { ...currentFiles, ...challenge.solution }
}
