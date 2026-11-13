import { lintSource } from '../../src/lint/lintSource.js'
import course, { flattenChallenges } from '../../src/content/course.js'

const errors = (r) => r.filter((d) => d.severity === 2)

describe('lintSource', () => {
  it('variable sin definir: severidad 2 y mensaje en español con el nombre', () => {
    const r = lintSource('export default function A() {\n  return <h1>{mensaje}</h1>\n}\n')
    const d = r.find((x) => x.ruleId === 'no-undef')
    expect(d.severity).toBe(2)
    expect(d.message).toBe("'mensaje' no está definida. ¿La escribiste bien o falta importarla?")
    expect(d.line).toBe(2)
  })

  it('variable sin usar: severidad 1 en español', () => {
    const r = lintSource('const x = 5\nexport default x\nconst y = 1\n')
    const d = r.find((x) => x.ruleId === 'no-unused-vars')
    expect(d.severity).toBe(1)
    expect(d.message).toBe("'y' se creó pero nunca se usa.")
  })

  it('componente importado y usado solo en JSX: sin avisos', () => {
    const code = "import Saludo from './Saludo.jsx'\nexport default function App() {\n  return <Saludo />\n}\n"
    expect(lintSource(code)).toEqual([])
  })

  it('variable en minúscula sin usar sí avisa, y componente sin usar también', () => {
    expect(lintSource('const hola = 1\n').some((d) => d.ruleId === 'no-unused-vars')).toBe(true)
    expect(lintSource("import Saludo from './S.jsx'\n").some((d) => d.ruleId === 'no-unused-vars')).toBe(true)
  })

  it('globals del navegador y React 19 sin import no dan error', () => {
    expect(errors(lintSource('console.log(document.title, window.innerWidth)\n'))).toEqual([])
  })

  it('claves duplicadas y código inalcanzable, en español', () => {
    const dup = lintSource('export default { a: 1, a: 2 }\n').find((d) => d.ruleId === 'no-dupe-keys')
    expect(dup.severity).toBe(2)
    expect(dup.message).toMatch(/a/)
    expect(dup.message).not.toMatch(/Duplicate/)
    const un = lintSource('export function f() {\n  return 1\n  console.log(2)\n}\n').find((d) => d.ruleId === 'no-unreachable')
    expect(un.severity).toBe(1)
    expect(un.message).not.toMatch(/Unreachable/)
  })

  it('error de sintaxis: un resultado severidad 2 con línea', () => {
    const r = lintSource('const a = (\n')
    expect(r).toHaveLength(1)
    expect(r[0].severity).toBe(2)
    expect(r[0].message).toMatch(/^Hay un error de escritura en el código/)
    expect(r[0].line).toBeGreaterThanOrEqual(1)
    expect(r[0].message).toMatch(/línea \d+/)
  })

  it('devuelve posiciones completas', () => {
    const d = lintSource('foo()\n')[0]
    expect(d).toMatchObject({ line: 1, column: 1, endLine: 1, endColumn: 4, ruleId: 'no-undef' })
  })
})

describe('retos del curso y ESLint', () => {
  const all = flattenChallenges(course)

  it('m00-l3-c1: el inicial tiene errores y la solución queda limpia', () => {
    const { challenge } = all.find((e) => e.challenge.id === 'm00-l3-c1')
    const start = Object.values(challenge.files).flatMap((src) => lintSource(src))
    expect(errors(start).length).toBeGreaterThanOrEqual(1)
    expect(start.some((d) => d.ruleId === 'no-unused-vars')).toBe(true)
    const merged = { ...challenge.files, ...challenge.solution }
    for (const src of Object.values(merged)) expect(errors(lintSource(src))).toEqual([])
  })

  it('toda solución de reto queda sin errores de ESLint', () => {
    for (const { challenge } of all) {
      const merged = { ...challenge.files, ...challenge.solution }
      for (const [path, src] of Object.entries(merged)) {
        if (!/\.jsx?$/.test(path)) continue
        expect(errors(lintSource(src)), `${challenge.id} ${path}`).toEqual([])
      }
    }
  })
})
