import { extractWords, createProjectSource } from '../../src/autocomplete/projectWords.js'
import { complete, labels } from './helpers.js'

const files = {
  '/src/Saludo.jsx': 'export default function Saludo({ nombreAlumno }) { return <h1>{nombreAlumno}</h1> }',
  '/src/App.jsx': "import Saludo from './Saludo.jsx'\nconst contador = 1",
}

describe('extractWords', () => {
  it('saca identificadores únicos de largo mínimo 3', () => {
    const words = extractWords('const ab = miVariable + miVariable; function Hola() {}')
    expect(words).toContain('miVariable')
    expect(words).toContain('Hola')
    expect(words).not.toContain('ab')
    expect(words.filter((w) => w === 'miVariable')).toHaveLength(1)
  })
})

describe('createProjectSource', () => {
  it('Salu sugiere Saludo que existe en otro archivo', async () => {
    const source = createProjectSource(() => files)
    expect(labels(await complete(source, 'return <Salu|'))).toContain('Saludo')
  })

  it('sugiere variables de cualquier archivo y no la palabra a medio escribir', async () => {
    const source = createProjectSource(() => files)
    const result = await complete(source, 'nombreAl|')
    expect(labels(result)).toContain('nombreAlumno')
    expect(labels(await complete(source, 'nombreAlumno|'))).not.toContain('nombreAlumno')
  })

  it('con el interruptor desactivado no sugiere nada', async () => {
    const source = createProjectSource(() => files, () => false)
    expect(await complete(source, 'Salu|')).toBeNull()
  })

  it('no sugiere dentro de className', async () => {
    const source = createProjectSource(() => files)
    expect(await complete(source, '<div className="Salu|">')).toBeNull()
  })

  it('tolera getFiles que falla o devuelve algo raro', async () => {
    expect(await complete(createProjectSource(() => null), 'Salu|')).toBeNull()
    expect(await complete(createProjectSource(() => ({ '/a': 5 })), 'Salu|')).toBeNull()
  })
})
