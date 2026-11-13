import { EditorState } from '@codemirror/state'
import { relativeImportPath, createImportSource } from '../../src/autocomplete/importCompletions.js'
import { complete, labels } from './helpers.js'

describe('relativeImportPath', () => {
  it.each([
    ['/src/App.jsx', '/src/Saludo.jsx', './Saludo.jsx'],
    ['/src/App.jsx', '/src/components/Saludo.jsx', './components/Saludo.jsx'],
    ['/src/pages/Inicio.jsx', '/src/components/Saludo.jsx', '../components/Saludo.jsx'],
    ['/src/pages/Inicio.jsx', '/src/api.js', '../api.js'],
    ['/src/a/b/c/X.jsx', '/src/Y.jsx', '../../../Y.jsx'],
    ['/src/App.jsx', '/src/a/b/c/Y.jsx', './a/b/c/Y.jsx'],
    ['/src/a/b/X.jsx', '/src/a/c/Y.jsx', '../c/Y.jsx'],
    ['/src/components/A.jsx', '/src/components/B.jsx', './B.jsx'],
  ])('%s -> %s = %s', (from, to, expected) => {
    expect(relativeImportPath(from, to)).toBe(expected)
  })
})

const files = {
  '/src/App.jsx': 'export default function App() {}',
  '/src/main.jsx': 'import App from "./App.jsx"',
  '/src/components/Saludo.jsx': 'export default function Saludo() {}',
  '/src/hooks/useContador.js': 'export function useContador() {}',
  '/src/pages/Inicio.jsx': 'export default function Inicio() {}',
  '/src/__entry__.js': 'export default 1',
  '/public/index.html': '',
}
const make = (active = '/src/App.jsx', on = true) => createImportSource(() => files, () => active, () => on)
const applied = (result, label, doc) => {
  const o = result.options.find((x) => x.label === label)
  const text = doc.replace('|', '')
  return text.slice(0, result.from) + (o.apply ?? o.label) + text.slice(result.to ?? doc.indexOf('|'))
}

describe('import con nombre', () => {
  it('completa import Saludo con from y ruta relativa', async () => {
    const doc = 'import Sal|'
    const r = await complete(make(), doc)
    expect(labels(r)).toContain('Saludo')
    expect(applied(r, 'Saludo', doc)).toBe("import Saludo from './components/Saludo.jsx'")
  })
  it('reemplaza el resto de la línea', async () => {
    const doc = "import Sal| from 'x'"
    const r = await complete(make(), doc)
    expect(applied(r, 'Saludo', doc)).toBe("import Saludo from './components/Saludo.jsx'")
  })
  it('usa llaves con export nombrado', async () => {
    const doc = 'import useC|'
    const r = await complete(make(), doc)
    expect(applied(r, 'useContador', doc)).toBe("import { useContador } from './hooks/useContador.js'")
  })
  it('ruta con ../ desde otra carpeta', async () => {
    const doc = 'import Sal|'
    const r = await complete(make('/src/pages/Inicio.jsx'), doc)
    expect(applied(r, 'Saludo', doc)).toBe("import Saludo from '../components/Saludo.jsx'")
  })
  it('detalle en español', async () => {
    const r = await complete(make(), 'import Sal|')
    expect(r.options.find((o) => o.label === 'Saludo').detail).toBe('Traer Saludo desde ./components/Saludo.jsx')
  })
  it('excluye archivo actual, main y archivos ocultos', async () => {
    const l = labels(await complete(make('/src/App.jsx'), 'import |', true))
    expect(l).not.toContain('App')
    expect(l).not.toContain('main')
    expect(l).not.toContain('__entry__')
    expect(l).toContain('Inicio')
  })
  it('no sugiere en código normal', async () => {
    expect(await complete(make(), 'const x = Sal|', true)).toBeNull()
  })
  it('apagado no sugiere nada', async () => {
    expect(await complete(make('/src/App.jsx', false), 'import Sal|')).toBeNull()
  })
})

describe('ruta dentro de las comillas', () => {
  it("completa from './c'", async () => {
    const doc = "import X from './c|'"
    const r = await complete(make(), doc)
    expect(labels(r)).toContain('./components/Saludo.jsx')
    expect(labels(r)).toContain('./components/')
    expect(applied(r, './components/Saludo.jsx', doc)).toBe("import X from './components/Saludo.jsx'")
  })
  it('relativa al archivo actual y sin ocultos', async () => {
    const l = labels(await complete(make('/src/pages/Inicio.jsx'), "import X from '|'", true))
    expect(l).toContain('../components/Saludo.jsx')
    expect(l).not.toContain('./Inicio.jsx')
    expect(l.some((x) => x.includes('__entry__') || x.includes('public'))).toBe(false)
  })
  it('también en import "ruta" sin from', async () => {
    expect(labels(await complete(make(), "import './c|'"))).toContain('./components/Saludo.jsx')
  })
  it('no sugiere en otros textos entre comillas', async () => {
    expect(await complete(make(), "const t = './c|'", true)).toBeNull()
  })
  it('apagado no sugiere', async () => {
    expect(await complete(make('/src/App.jsx', false), "import X from './c|'")).toBeNull()
  })
})

it('EditorState de prueba válido', () => {
  expect(EditorState.create({ doc: '' })).toBeTruthy()
})
