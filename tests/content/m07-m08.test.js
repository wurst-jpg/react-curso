import course from '../../src/content/course.js'

const ESPERADO = {
  m07: { title: 'Formularios', lecciones: 4, retos: 8 },
  m08: { title: 'Datos externos', lecciones: 4, retos: 6 },
}

describe.each(Object.entries(ESPERADO))('módulo %s', (id, esperado) => {
  const modulo = course.find((m) => m.id === id)

  it('existe con su título', () => {
    expect(modulo, `falta el módulo ${id}`).toBeDefined()
    expect(modulo.title).toBe(esperado.title)
    expect(modulo.lessons.length).toBe(esperado.lecciones)
  })

  it('tiene el número de retos esperado', () => {
    const retos = modulo.lessons.flatMap((l) => l.challenges)
    expect(retos.length).toBe(esperado.retos)
  })

  it('cada reto tiene 3 pistas, solución, main.jsx y checks con label', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(50)
      expect(l.challenges.length, l.id).toBeGreaterThanOrEqual(1)
      expect(l.challenges.length, l.id).toBeLessThanOrEqual(3)
      l.challenges.forEach((c) => {
        expect(c.hints.length, c.id).toBe(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.files['/src/main.jsx'], c.id).toBeDefined()
        expect(c.checks.length, c.id).toBeGreaterThan(0)
        c.checks.forEach((k) => expect(k.label, c.id).toBeTruthy())
      })
    })
  })
})

describe('m08 no usa APIs externas reales', () => {
  it('ninguna solución llama a una URL http(s) real', () => {
    const modulo = course.find((m) => m.id === 'm08')
    modulo.lessons.forEach((l) =>
      l.challenges.forEach((c) =>
        Object.entries({ ...c.files, ...c.solution }).forEach(([p, code]) =>
          expect(/fetch\(\s*['"`]https?:/.test(code), `${c.id} ${p}`).toBe(false),
        ),
      ),
    )
  })
})
