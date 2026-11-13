import course from '../../src/content/course.js'

const ESPERADO = [2,2,2,2]

describe('módulo m05', () => {
  const modulo = course.find((m) => m.id === 'm05')

  it('existe en el curso con su título', () => {
    expect(modulo).toBeDefined()
    expect(modulo.title).toBe('Tailwind básico')
    expect(modulo.summary).toBeTruthy()
  })

  it('tiene las lecciones y retos esperados', () => {
    expect(modulo.lessons.map((l) => l.challenges.length)).toEqual(ESPERADO)
    modulo.lessons.forEach((l, i) => {
      expect(l.id).toBe('m05-l' + (i + 1))
      expect(l.explanation.length).toBeGreaterThan(80)
    })
  })

  it('cada reto tiene 3 pistas, solución, checks con label e instrucciones', () => {
    modulo.lessons.forEach((l) =>
      l.challenges.forEach((c) => {
        expect(c.hints, c.id).toHaveLength(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.instructions, c.id).toBeTruthy()
        expect(c.checks.length, c.id).toBeGreaterThan(0)
        c.checks.forEach((k) => expect(k.label, c.id).toBeTruthy())
      }),
    )
  })

  it('el último reto es grande (xp >= 20)', () => {
    const ultima = modulo.lessons.at(-1)
    expect(ultima.challenges.at(-1).xp).toBeGreaterThanOrEqual(20)
  })
})
