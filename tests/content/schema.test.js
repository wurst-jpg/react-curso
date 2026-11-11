import { validateCourse, CHECK_TYPES, IFRAME_CHECK_TYPES } from '../../src/content/schema.js'

const reto = (over = {}) => ({
  id: 'm1-l1-c1',
  title: 'Reto',
  instructions: 'Haz algo',
  files: { '/src/main.jsx': 'x', '/src/App.jsx': 'y' },
  activeFile: '/src/App.jsx',
  hints: ['pista'],
  solution: { '/src/App.jsx': 'z' },
  checks: [{ type: 'text', match: 'hola', label: 'Dice hola' }],
  ...over,
})

const curso = (retoOver, extraReto) => [
  {
    id: 'm1',
    title: 'M',
    summary: 's',
    lessons: [
      {
        id: 'm1-l1',
        title: 'L',
        explanation: 'e',
        challenges: [reto(retoOver), ...(extraReto ? [extraReto] : [])],
      },
    ],
  },
]

describe('validateCourse', () => {
  it('acepta un curso mínimo válido', () => {
    expect(validateCourse(curso())).toEqual([])
  })

  it('detecta ids repetidos en cualquier nivel', () => {
    const errores = validateCourse(curso({}, reto()))
    expect(errores.some((e) => e.includes('m1-l1-c1'))).toBe(true)
    const c = curso()
    c[0].lessons[0].id = 'm1'
    expect(validateCourse(c).some((e) => e.includes("'m1'"))).toBe(true)
  })

  it('detecta un reto sin checks', () => {
    expect(validateCourse(curso({ checks: [] })).length).toBeGreaterThan(0)
  })

  it('exige /src/main.jsx salvo startFrom previous', () => {
    const sinMain = { files: { '/src/App.jsx': 'y' } }
    expect(validateCourse(curso(sinMain)).length).toBeGreaterThan(0)
    const segundo = reto({ id: 'm1-l1-c2', ...sinMain, startFrom: 'previous' })
    expect(validateCourse(curso({}, segundo))).toEqual([])
  })

  it('detecta activeFile fuera de files', () => {
    expect(validateCourse(curso({ activeFile: '/src/Otro.jsx' })).length).toBeGreaterThan(0)
  })

  it('detecta checks con tipo desconocido o sin label', () => {
    expect(
      validateCourse(curso({ checks: [{ type: 'magia', label: 'x' }] })).length,
    ).toBeGreaterThan(0)
    expect(
      validateCourse(curso({ checks: [{ type: 'text', match: 'a' }] })).length,
    ).toBeGreaterThan(0)
  })

  it('acepta message de texto y rechaza uno vacío o no textual', () => {
    const conMsg = (message) => curso({ checks: [{ type: 'file-exists', pattern: 'x', label: 'a', message }] })
    expect(validateCourse(conMsg('Falta algo.'))).toEqual([])
    expect(validateCourse(conMsg(''))).not.toEqual([])
    expect(validateCourse(conMsg(5))).not.toEqual([])
  })

  it('rechaza startFrom previous en el primer reto del curso', () => {
    expect(validateCourse(curso({ startFrom: 'previous' })).length).toBeGreaterThan(0)
  })
})

describe('constantes de checks', () => {
  it('tiene los 10 tipos y los del iframe', () => {
    expect(CHECK_TYPES).toHaveLength(10)
    expect(IFRAME_CHECK_TYPES).toEqual(['text', 'role', 'count', 'class', 'interaction'])
    IFRAME_CHECK_TYPES.forEach((t) => expect(CHECK_TYPES).toContain(t))
  })
})
