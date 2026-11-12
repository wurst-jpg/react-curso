import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm02')

describe('módulo m02 Props', () => {
  it('existe con título y resumen', () => {
    expect(modulo).toBeDefined()
    expect(modulo.title).toBe('Props')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('tiene 5 lecciones y 9 retos', () => {
    expect(modulo.lessons.map((l) => l.id)).toEqual(['m02-l1', 'm02-l2', 'm02-l3', 'm02-l4', 'm02-l5'])
    expect(modulo.lessons.flatMap((l) => l.challenges)).toHaveLength(9)
  })

  it('cada lección explica y cada reto tiene 3 pistas, solución y checks con label', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(40)
      expect(l.challenges.length, l.id).toBeGreaterThanOrEqual(1)
      expect(l.challenges.length, l.id).toBeLessThanOrEqual(3)
      l.challenges.forEach((c) => {
        expect(c.hints, c.id).toHaveLength(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.checks.length, c.id).toBeGreaterThan(0)
        c.checks.forEach((k) => expect(k.label, c.id).toBeTruthy())
      })
    })
  })

  it('no usa conceptos de módulos posteriores', () => {
    const todo = JSON.stringify(modulo)
    expect(todo).not.toMatch(/useState|useEffect|\.map\(|onClick/)
  })
})
