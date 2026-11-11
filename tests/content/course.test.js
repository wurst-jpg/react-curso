import course, { flattenChallenges, findChallenge } from '../../src/content/course.js'
import { lintSource } from '../../src/lint/lintSource.js'
import { validateCourse } from '../../src/content/schema.js'

describe('curso', () => {
  it('es válido', () => {
    expect(validateCourse(course)).toEqual([])
  })

  it('flattenChallenges devuelve los retos en orden', () => {
    const todos = flattenChallenges(course)
    expect(todos[0].challenge.id).toBe('m00-l1-c1')
    expect(todos[0].index).toBe(0)
    expect(todos[1].index).toBe(1)
    expect(todos[0].lesson.id).toBe('m00-l1')
    expect(todos[0].module.id).toBe('m00')
  })

  it('findChallenge encuentra o devuelve null', () => {
    expect(findChallenge(course, 'm00-l2-c1').challenge.id).toBe('m00-l2-c1')
    expect(findChallenge(course, 'nope')).toBeNull()
  })

  it('la solución de cada reto cumple sus checks de archivos', () => {
    flattenChallenges(course).forEach(({ challenge }) => {
      const files = { ...challenge.files, ...challenge.solution }
      challenge.checks.forEach((check) => {
        if (check.type === 'lint-clean') {
          Object.entries(files)
            .filter(([p]) => /\.jsx?$/.test(p))
            .forEach(([p, code]) => {
              const errores = lintSource(code).filter((d) => d.severity === 2)
              expect(errores, `${challenge.id} ${p}`).toEqual([])
            })
        }
        if (check.type === 'file-exists') {
          const re = new RegExp(check.pattern)
          expect(Object.keys(files).some((p) => re.test(p)), challenge.id).toBe(true)
        }
        if (check.type === 'file-includes') {
          const re = new RegExp(check.pattern)
          const textos = check.path ? [files[check.path] ?? ''] : Object.values(files)
          expect(textos.some((t) => re.test(t)), challenge.id).toBe(true)
        }
      })
    })
  })

  it('L2 no trae Saludo.jsx de inicio', () => {
    expect(findChallenge(course, 'm00-l2-c1').challenge.files['/src/Saludo.jsx']).toBeUndefined()
  })
})
