import { safeRead, safeWrite } from './storage.js'

export const PROGRESS_KEY = 'curso-react:progress:v1'

export function emptyProgress() {
  return { completed: {}, xp: 0, solutionViewed: {}, hintsUsed: {} }
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

export function loadProgress() {
  const stored = safeRead(PROGRESS_KEY, null)
  if (!isObj(stored) || !isObj(stored.completed)) return emptyProgress()
  const base = emptyProgress()
  return {
    completed: stored.completed,
    xp: typeof stored.xp === 'number' ? stored.xp : base.xp,
    solutionViewed: isObj(stored.solutionViewed) ? stored.solutionViewed : base.solutionViewed,
    hintsUsed: isObj(stored.hintsUsed) ? stored.hintsUsed : base.hintsUsed,
  }
}

export function saveProgress(p) {
  return safeWrite(PROGRESS_KEY, p)
}

export function completeChallenge(p, challenge) {
  if (p.completed[challenge.id]) return p
  const full = challenge.xp ?? 10
  const xp = p.solutionViewed[challenge.id] ? Math.floor(full / 2) : full
  return {
    ...p,
    xp: p.xp + xp,
    completed: { ...p.completed, [challenge.id]: { xp, at: new Date().toISOString() } },
  }
}

export function markSolutionViewed(p, id) {
  return { ...p, solutionViewed: { ...p.solutionViewed, [id]: true } }
}

export function markHintUsed(p, id) {
  return { ...p, hintsUsed: { ...p.hintsUsed, [id]: true } }
}

// Todos los módulos están abiertos; dentro de un módulo los retos se abren en orden.
export function isChallengeUnlocked(p, modules, id) {
  if (p.completed[id]) return true
  for (const module of modules) {
    const ids = moduleIds(module)
    const i = ids.indexOf(id)
    if (i === -1) continue
    return i === 0 || Boolean(p.completed[ids[i - 1]])
  }
  return false
}

function moduleIds(module) {
  return module.lessons.flatMap((l) => l.challenges.map((c) => c.id))
}

export function moduleStats(p, module, modules = [module]) {
  const ids = moduleIds(module)
  const done = ids.filter((id) => p.completed[id]).length
  const unlocked = ids.length > 0 && isChallengeUnlocked(p, modules, ids[0])
  return { done, total: ids.length, unlocked }
}

export function achievements(p, modules) {
  const list = []
  if (Object.keys(p.completed).length > 0) {
    list.push({ id: 'primer-reto', title: '¡Primer reto!' })
  }
  for (const module of modules) {
    const ids = moduleIds(module)
    if (ids.length === 0 || !ids.every((id) => p.completed[id])) continue
    list.push({ id: `modulo:${module.id}`, title: `Módulo completo: ${module.title}` })
    if (ids.every((id) => !p.hintsUsed[id] && !p.solutionViewed[id])) {
      list.push({ id: `sin-ayuda:${module.id}`, title: `Sin ayuda: ${module.title}` })
    }
  }
  return list
}
