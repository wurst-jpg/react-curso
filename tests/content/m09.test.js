import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm09')

describe('módulo m09', () => {
  it('existe con título y 4 lecciones', () => {
    expect(modulo, 'falta el módulo m09').toBeDefined()
    expect(modulo.title).toBe('Organización pro')
    expect(modulo.lessons.length).toBe(4)
  })

  it('tiene 8 retos', () => {
    const retos = modulo.lessons.flatMap((l) => l.challenges)
    expect(retos.length).toBe(8)
  })

  it('cada reto tiene 3 pistas, solución, instrucciones y checks con label', () => {
    modulo.lessons.forEach((l) => {
      expect(l.challenges.length, l.id).toBeGreaterThanOrEqual(1)
      expect(l.challenges.length, l.id).toBeLessThanOrEqual(3)
      l.challenges.forEach((c) => {
        expect(c.hints.length, c.id).toBe(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.instructions.length, c.id).toBeGreaterThan(10)
        expect(c.checks.length, c.id).toBeGreaterThan(0)
        c.checks.forEach((k) => expect(k.label, c.id).toBeTruthy())
      })
    })
  })

  it('usa carpetas components, hooks y context', () => {
    const texto = JSON.stringify(modulo)
    expect(texto).toMatch(/src\/components\//)
    expect(texto).toMatch(/src\/hooks\//)
    expect(texto).toMatch(/src\/context\//)
  })
})
