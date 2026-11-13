import {
  PROGRESS_KEY,
  emptyProgress,
  loadProgress,
  saveProgress,
  completeChallenge,
  markSolutionViewed,
  markHintUsed,
  isChallengeUnlocked,
  moduleStats,
  achievements,
} from '../../src/progress/progress.js'
import course from '../../src/content/course.js'

const ch = (id, xp) => ({ id, title: id, ...(xp ? { xp } : {}) })
const mod = (id, ids) => ({
  id,
  title: `Mod ${id}`,
  lessons: [{ id: `${id}-l`, title: 'l', challenges: ids.map((i) => ch(i)) }],
})
const A = mod('ma', ['a1', 'a2', 'a3'])
const B = mod('mb', ['b1', 'b2'])
const modules = [A, B]
const c = (id) => ({ id })

function completeAll(p, ids) {
  return ids.reduce((acc, id) => completeChallenge(acc, c(id)), p)
}

beforeEach(() => localStorage.clear())

describe('load/save', () => {
  it('clave y vacío', () => {
    expect(PROGRESS_KEY).toBe('curso-react:progress:v1')
    expect(emptyProgress()).toEqual({ completed: {}, xp: 0, solutionViewed: {}, hintsUsed: {} })
  })
  it('sin nada guardado devuelve vacío', () => {
    expect(loadProgress()).toEqual(emptyProgress())
  })
  it('objeto sin completed → vacío', () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ foo: 1 }))
    expect(loadProgress()).toEqual(emptyProgress())
  })
  it('JSON corrupto → vacío', () => {
    localStorage.setItem(PROGRESS_KEY, '{no json')
    expect(loadProgress()).toEqual(emptyProgress())
  })
  it('normaliza objetos parciales', () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ completed: { a1: { xp: 10, at: 'x' } }, xp: 10 }))
    const p = loadProgress()
    expect(p.hintsUsed).toEqual({})
    expect(p.solutionViewed).toEqual({})
    expect(p.completed.a1.xp).toBe(10)
  })
  it('guarda y recupera', () => {
    const p = completeChallenge(emptyProgress(), c('a1'))
    saveProgress(p)
    expect(loadProgress()).toEqual(p)
  })
})

describe('completeChallenge', () => {
  it('suma 10 por defecto y guarda xp y fecha ISO', () => {
    const p = completeChallenge(emptyProgress(), c('a1'))
    expect(p.xp).toBe(10)
    expect(p.completed.a1.xp).toBe(10)
    expect(new Date(p.completed.a1.at).toISOString()).toBe(p.completed.a1.at)
  })
  it('usa challenge.xp', () => {
    expect(completeChallenge(emptyProgress(), { id: 'a1', xp: 20 }).xp).toBe(20)
  })
  it('con solución vista suma la mitad redondeada hacia abajo', () => {
    const p0 = markSolutionViewed(emptyProgress(), 'a1')
    expect(completeChallenge(p0, c('a1')).xp).toBe(5)
    expect(completeChallenge(p0, { id: 'a1', xp: 15 }).xp).toBe(7)
  })
  it('dos veces no duplica y devuelve el mismo objeto', () => {
    const p = completeChallenge(emptyProgress(), c('a1'))
    expect(completeChallenge(p, c('a1'))).toBe(p)
    expect(p.xp).toBe(10)
  })
  it('no muta la entrada', () => {
    const p0 = emptyProgress()
    completeChallenge(p0, c('a1'))
    expect(p0).toEqual(emptyProgress())
  })
})

describe('markSolutionViewed / markHintUsed', () => {
  it('son puros', () => {
    const p0 = emptyProgress()
    const p1 = markSolutionViewed(p0, 'a1')
    const p2 = markHintUsed(p1, 'a1')
    expect(p0).toEqual(emptyProgress())
    expect(p1.solutionViewed.a1).toBe(true)
    expect(p2.hintsUsed.a1).toBe(true)
    expect(p2.solutionViewed.a1).toBe(true)
  })
})

describe('isChallengeUnlocked', () => {
  it('primero abierto, segundo cerrado hasta completar el primero', () => {
    const p = emptyProgress()
    expect(isChallengeUnlocked(p, modules, 'a1')).toBe(true)
    expect(isChallengeUnlocked(p, modules, 'a2')).toBe(false)
    const p2 = completeAll(p, ['a1'])
    expect(isChallengeUnlocked(p2, modules, 'a2')).toBe(true)
    expect(isChallengeUnlocked(p2, modules, 'a3')).toBe(false)
  })
  it('el primer reto de cualquier módulo está abierto sin progreso', () => {
    expect(isChallengeUnlocked(emptyProgress(), modules, 'b1')).toBe(true)
  })
  it('el orden se respeta dentro de cada módulo y no se cruza entre módulos', () => {
    expect(isChallengeUnlocked(emptyProgress(), modules, 'b2')).toBe(false)
    expect(isChallengeUnlocked(completeAll(emptyProgress(), ['a1', 'a2', 'a3']), modules, 'b2')).toBe(false)
    expect(isChallengeUnlocked(completeAll(emptyProgress(), ['b1']), modules, 'b2')).toBe(true)
    expect(isChallengeUnlocked(completeAll(emptyProgress(), ['b1']), modules, 'a2')).toBe(false)
  })
  it('un reto completado sigue abierto', () => {
    expect(isChallengeUnlocked(completeAll(emptyProgress(), ['b2']), modules, 'b2')).toBe(true)
  })
  it('un reto nuevo insertado antes de uno completado no lo bloquea', () => {
    const p = completeAll(emptyProgress(), ['a1', 'a2'])
    const nuevo = mod('ma', ['a1', 'aNuevo', 'a2', 'a3'])
    expect(isChallengeUnlocked(p, [nuevo, B], 'a2')).toBe(true)
  })
  it('id inexistente no está desbloqueado', () => {
    expect(isChallengeUnlocked(emptyProgress(), modules, 'zzz')).toBe(false)
  })
})

describe('moduleStats', () => {
  it('cuenta hechos, total y desbloqueo del primer reto', () => {
    expect(moduleStats(emptyProgress(), A, modules)).toEqual({ done: 0, total: 3, unlocked: true })
    expect(moduleStats(emptyProgress(), B, modules)).toEqual({ done: 0, total: 2, unlocked: true })
    const p = completeAll(emptyProgress(), ['a1', 'a2', 'a3'])
    expect(moduleStats(p, A, modules).done).toBe(3)
  })
  it('ids completados que ya no existen no rompen ni cuentan', () => {
    const p = completeAll(emptyProgress(), ['a1', 'fantasma'])
    expect(moduleStats(p, A, modules)).toEqual({ done: 1, total: 3, unlocked: true })
  })
})

describe('achievements', () => {
  const ids = (list) => list.map((a) => a.id)
  it('sin progreso no hay logros', () => {
    expect(achievements(emptyProgress(), modules)).toEqual([])
  })
  it('primer reto', () => {
    const list = achievements(completeAll(emptyProgress(), ['a1']), modules)
    expect(list).toEqual([{ id: 'primer-reto', title: '¡Primer reto!' }])
  })
  it('módulo completo y sin ayuda', () => {
    const list = achievements(completeAll(emptyProgress(), ['a1', 'a2', 'a3']), modules)
    expect(list).toContainEqual({ id: 'modulo:ma', title: 'Módulo completo: Mod ma' })
    expect(list).toContainEqual({ id: 'sin-ayuda:ma', title: 'Sin ayuda: Mod ma' })
    expect(ids(list)).not.toContain('modulo:mb')
  })
  it('con pista o solución no hay sin-ayuda', () => {
    const hinted = markHintUsed(completeAll(emptyProgress(), ['a1', 'a2', 'a3']), 'a2')
    expect(ids(achievements(hinted, modules))).toEqual(expect.arrayContaining(['modulo:ma']))
    expect(ids(achievements(hinted, modules))).not.toContain('sin-ayuda:ma')
    const sol = markSolutionViewed(completeAll(emptyProgress(), ['a1', 'a2', 'a3']), 'a1')
    expect(ids(achievements(sol, modules))).not.toContain('sin-ayuda:ma')
  })
  it('ids fantasma no rompen', () => {
    const list = achievements(completeAll(emptyProgress(), ['fantasma']), modules)
    expect(ids(list)).toEqual(['primer-reto'])
  })
  it('módulo vacío no da logro', () => {
    const vacio = { id: 'mv', title: 'V', lessons: [] }
    expect(achievements(completeAll(emptyProgress(), ['a1']), [vacio, A])).toHaveLength(1)
  })
})

describe('con el curso real', () => {
  it('el primer reto del curso está abierto y el segundo cerrado', () => {
    const [first, second] = course[0].lessons.flatMap((l) => l.challenges)
    expect(isChallengeUnlocked(emptyProgress(), course, first.id)).toBe(true)
    expect(isChallengeUnlocked(emptyProgress(), course, second.id)).toBe(false)
  })
  it('el primer reto de cada módulo real está abierto y el segundo cerrado', () => {
    for (const m of course) {
      const [first, second] = m.lessons.flatMap((l) => l.challenges)
      expect(isChallengeUnlocked(emptyProgress(), course, first.id)).toBe(true)
      if (second) expect(isChallengeUnlocked(emptyProgress(), course, second.id)).toBe(false)
    }
  })
})
