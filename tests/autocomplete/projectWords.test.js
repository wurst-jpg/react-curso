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

describe('createProjectSource: textos, comentarios y duplicados', () => {
  const source = createProjectSource(() => files)
  it('no sugiere dentro de cadenas, comentarios ni texto de JSX', async () => {
    expect(await complete(source, 'const a = "Hola Salu|"')).toBeNull()
    expect(await complete(source, '// Salu|')).toBeNull()
    expect(await complete(source, '/* Salu|')).toBeNull()
    expect(await complete(source, '<p>Hola mundo Salu|</p>')).toBeNull()
  })
  it('sí sugiere dentro de llaves de JSX', async () => {
    expect(labels(await complete(source, '<p>{Salu|}</p>'))).toContain('Saludo')
  })
  it('no repite palabras que ya ofrece la fuente de React', async () => {
    const src = createProjectSource(() => ({ '/a.jsx': 'const [a, setA] = useState(0); useEffect(); const onClick = 1; className' }))
    const result = await complete(src, 'use|', true)
    expect(labels(result)).not.toContain('useState')
    expect(labels(result)).not.toContain('useEffect')
    expect(labels(await complete(src, 'onC|'))).not.toContain('onClick')
    expect(labels(await complete(src, 'set|'))).toContain('setA')
  })
})
