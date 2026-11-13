import course, { flattenChallenges } from '../../src/content/course.js'
import { cleanStartFiles } from '../../src/progress/code.js'
import { lintSource } from '../../src/lint/lintSource.js'

const modulo = course.find((m) => m.id === 'm11')
const retos = () => modulo.lessons.flatMap((l) => l.challenges)

describe('m11 Proyecto final', () => {
  it('existe en el curso con su id y título', () => {
    expect(modulo).toBeDefined()
    expect(modulo.title).toBe('Proyecto final')
  })

  it('tiene 5 lecciones y 7 etapas (retos)', () => {
    expect(modulo.lessons.length).toBe(5)
    expect(retos().length).toBe(7)
  })

  it('cada etapa tiene 3 pistas, solución, checks con label y 30 de XP', () => {
    retos().forEach((c) => {
      expect(c.hints.length, c.id).toBe(3)
      expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
      expect(c.checks.length, c.id).toBeGreaterThan(0)
      c.checks.forEach((k) => expect(k.label, c.id).toBeTruthy())
      expect(c.xp, c.id).toBe(30)
    })
  })

  it('la etapa 1 tiene sus propios archivos (con main.jsx) y NO arranca del reto anterior (que es de m10)', () => {
    const [primero] = retos()
    expect(primero.startFrom).toBeUndefined()
    expect(primero.files['/src/main.jsx']).toBeTruthy()
    expect(primero.files['/src/App.jsx']).toBeTruthy()
  })

  it('las etapas 2 a 7 continúan el código anterior', () => {
    retos().slice(1).forEach((c) => expect(c.startFrom, c.id).toBe('previous'))
  })

  it('las etapas con rutas declaran react-router y lo conservan después', () => {
    const lista = retos()
    const i = lista.findIndex((c) => c.checks.some((k) => k.type === 'file-includes' && /react-router/.test(k.pattern)))
    expect(i).toBeGreaterThan(0)
    lista.slice(i).forEach((c) => expect(c.dependencies?.['react-router'], c.id).toBe('^7'))
  })

  it('al llegar a cada etapa hay main.jsx y App.jsx heredados, y todo el código pasa ESLint', () => {
    retos().forEach((c) => {
      const inicio = cleanStartFiles(course, c.id)
      const final = { ...inicio, ...c.solution }
      expect(final['/src/main.jsx'], c.id).toBeTruthy()
      expect(final['/src/App.jsx'], c.id).toBeTruthy()
      Object.entries(final)
        .filter(([p]) => /\.jsx?$/.test(p))
        .forEach(([p, code]) => {
          const errores = lintSource(code).filter((d) => d.severity === 2)
          expect(errores, `${c.id} ${p}`).toEqual([])
        })
    })
  })

  it('el orden global es el esperado: m11 va después de todos los demás', () => {
    const todos = flattenChallenges(course)
    expect(todos[todos.length - 1].module.id).toBe('m11')
  })
})
