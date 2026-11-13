import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm04')

describe('módulo m04 (Listas y condiciones)', () => {
  it('existe con su título', () => {
    expect(modulo).toBeDefined()
    expect(modulo.title).toBe('Listas y condiciones')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('tiene 5 lecciones y 11 retos', () => {
    expect(modulo.lessons.length).toBe(5)
    expect(modulo.lessons.flatMap((l) => l.challenges).length).toBe(11)
  })

  it('cada lección tiene explicación y 1 a 3 retos', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(80)
      expect(l.challenges.length, l.id).toBeGreaterThanOrEqual(1)
      expect(l.challenges.length, l.id).toBeLessThanOrEqual(3)
    })
  })

  it('cada reto tiene 3 pistas, solución, checks con label y xp', () => {
    modulo.lessons.flatMap((l) => l.challenges).forEach((c) => {
      expect(c.hints.length, c.id).toBe(3)
      expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
      expect(c.checks.length, c.id).toBeGreaterThan(0)
      c.checks.forEach((ch) => expect(ch.label, c.id).toBeTruthy())
      expect([10, 15, 20, 25, 30], c.id).toContain(c.xp)
    })
  })

  it('al menos 4 retos usan checks de interacción', () => {
    const n = modulo.lessons.flatMap((l) => l.challenges).filter((c) => c.checks.some((k) => k.type === 'interaction')).length
    expect(n).toBeGreaterThanOrEqual(4)
  })

  it('no usa conceptos de módulos posteriores en las soluciones', () => {
    modulo.lessons.flatMap((l) => l.challenges).forEach((c) => {
      Object.values(c.solution).forEach((code) => expect(code, c.id).not.toMatch(/useEffect|fetch\(/))
    })
  })
})
