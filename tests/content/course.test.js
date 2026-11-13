import { readdirSync, readFileSync } from 'node:fs'
import { parse } from 'acorn'
import course, { flattenChallenges, findChallenge } from '../../src/content/course.js'
import { lintSource } from '../../src/lint/lintSource.js'
import { validateCourse } from '../../src/content/schema.js'

describe('curso', () => {
  it('es válido', () => {
    expect(validateCourse(course)).toEqual([])
  })

  it('descubre los módulos en orden y el id de cada uno coincide con el prefijo de su archivo', () => {
    const archivos = readdirSync('src/content/modules').filter((f) => f.endsWith('.js')).sort()
    expect(course.length).toBe(archivos.length)
    archivos.forEach((archivo, i) => {
      const prefijo = archivo.match(/^(m\d{2})-[a-z0-9-]+\.js$/)
      expect(prefijo, `${archivo}: el nombre debe ser mNN-slug.js`).not.toBeNull()
      expect(course[i].id, `${archivo} debe declarar id "${prefijo?.[1]}"`).toBe(prefijo[1])
    })
    const ids = course.map((m) => m.id)
    expect(ids).toEqual([...ids].sort())
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('los ids de lecciones y retos empiezan con el id de su módulo y son únicos', () => {
    const vistos = new Set()
    flattenChallenges(course).forEach(({ challenge, lesson, module }) => {
      expect(lesson.id.startsWith(`${module.id}-l`), lesson.id).toBe(true)
      expect(challenge.id.startsWith(`${lesson.id}-c`), challenge.id).toBe(true)
      expect(vistos.has(challenge.id), `id repetido ${challenge.id}`).toBe(false)
      vistos.add(challenge.id)
    })
  })

  it('los archivos de módulo no tienen sentencias import (el cargador de e2e/soluciones.spec.js lo exige)', () => {
    readdirSync('src/content/modules')
      .filter((f) => f.endsWith('.js'))
      .forEach((f) => {
        const ast = parse(readFileSync(`src/content/modules/${f}`, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' })
        const imports = ast.body.filter((n) => n.type === 'ImportDeclaration' || n.type === 'ExportAllDeclaration')
        expect(imports, `${f} no debe importar nada: define las constantes dentro del archivo`).toEqual([])
      })
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
