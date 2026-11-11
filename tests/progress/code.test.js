import {
  codeKey,
  saveCode,
  loadCode,
  clearCode,
  initialFiles,
  cleanStartFiles,
  solutionFiles,
} from '../../src/progress/code.js'

const modules = [
  {
    id: 'm',
    title: 'M',
    lessons: [
      {
        id: 'l',
        title: 'L',
        challenges: [
          { id: 'c1', files: { '/a.js': 'a1', '/b.js': 'b1' }, solution: { '/a.js': 'a1-sol' } },
          { id: 'c2', files: { '/a.js': 'a2' }, solution: { '/a.js': 'a2-sol' } },
          { id: 'c3', startFrom: 'previous', files: { '/a.js': 'a3' }, solution: { '/a.js': 'a3-sol' } },
        ],
      },
    ],
  },
]
const first = [{ ...modules[0], lessons: [{ ...modules[0].lessons[0], challenges: [{ id: 'x', startFrom: 'previous', files: { '/a.js': 'x' }, solution: {} }] }] }]

beforeEach(() => localStorage.clear())

describe('storage de código', () => {
  it('codeKey', () => {
    expect(codeKey('c1')).toBe('curso-react:code:v1:c1')
  })
  it('guarda y carga', () => {
    saveCode('c1', { '/a.js': 'hola' })
    expect(loadCode('c1')).toEqual({ '/a.js': 'hola' })
  })
  it('loadCode sin nada → null', () => {
    expect(loadCode('c1')).toBeNull()
  })
  it('loadCode con JSON corrupto → null', () => {
    localStorage.setItem(codeKey('c1'), '{no json')
    expect(loadCode('c1')).toBeNull()
  })
  it('loadCode con valor que no es objeto → null', () => {
    localStorage.setItem(codeKey('c1'), '"texto"')
    expect(loadCode('c1')).toBeNull()
  })
  it('clearCode borra', () => {
    saveCode('c1', { '/a.js': 'x' })
    clearCode('c1')
    expect(loadCode('c1')).toBeNull()
  })
  it('clearCode no lanza si removeItem falla', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error()
    })
    expect(() => clearCode('c1')).not.toThrow()
    vi.restoreAllMocks()
  })
})

const chain = [
  {
    id: 'm',
    title: 'M',
    lessons: [
      {
        id: 'l',
        title: 'L',
        challenges: [
          { id: 'c1', files: { '/src/main.jsx': 'm', '/src/App.jsx': 'a1' }, solution: { '/src/App.jsx': 'a1-sol' } },
          { id: 'c2', startFrom: 'previous', solution: { '/src/B.jsx': 'b2' } },
          { id: 'c3', startFrom: 'previous', solution: { '/src/C.jsx': 'c3' } },
          { id: 'c4', startFrom: 'previous', solution: { '/src/D.jsx': 'd4' } },
        ],
      },
    ],
  },
]

describe('cadenas de startFrom previous', () => {
  const all = { '/src/main.jsx': 'm', '/src/App.jsx': 'a1-sol', '/src/B.jsx': 'b2', '/src/C.jsx': 'c3' }
  it('initialFiles de c4 arrastra todo lo anterior', () => {
    expect(initialFiles(chain, 'c4')).toEqual(all)
  })
  it('cleanStartFiles de c4 arrastra todo e ignora guardados', () => {
    saveCode('c3', { '/src/main.jsx': 'mío' })
    expect(cleanStartFiles(chain, 'c4')).toEqual(all)
  })
  it('initialFiles usa el guardado más cercano', () => {
    saveCode('c2', { '/src/main.jsx': 'm', '/src/Z.jsx': 'z' })
    expect(initialFiles(chain, 'c4')).toEqual({ '/src/main.jsx': 'm', '/src/Z.jsx': 'z', '/src/C.jsx': 'c3' })
  })
})

describe('initialFiles', () => {
  it('reto normal sin guardado → files', () => {
    expect(initialFiles(modules, 'c2')).toEqual({ '/a.js': 'a2' })
  })
  it('código guardado gana', () => {
    saveCode('c2', { '/a.js': 'mío' })
    expect(initialFiles(modules, 'c2')).toEqual({ '/a.js': 'mío' })
  })
  it('startFrom previous con código guardado del anterior', () => {
    saveCode('c2', { '/a.js': 'mío2' })
    expect(initialFiles(modules, 'c3')).toEqual({ '/a.js': 'mío2' })
  })
  it('startFrom previous sin guardado → files del anterior + solution', () => {
    expect(initialFiles(modules, 'c3')).toEqual({ '/a.js': 'a2-sol' })
    const m2 = structuredClone(modules)
    m2[0].lessons[0].challenges[1].files['/extra.js'] = 'e'
    expect(initialFiles(m2, 'c3')).toEqual({ '/a.js': 'a2-sol', '/extra.js': 'e' })
  })
  it('el guardado propio gana sobre startFrom', () => {
    saveCode('c2', { '/a.js': 'prev' })
    saveCode('c3', { '/a.js': 'propio' })
    expect(initialFiles(modules, 'c3')).toEqual({ '/a.js': 'propio' })
  })
  it('startFrom previous en el primer reto → files', () => {
    expect(initialFiles(first, 'x')).toEqual({ '/a.js': 'x' })
  })
  it('clearCode y luego initialFiles devuelve los iniciales', () => {
    saveCode('c2', { '/a.js': 'mío' })
    clearCode('c2')
    expect(initialFiles(modules, 'c2')).toEqual({ '/a.js': 'a2' })
  })
  it('id desconocido → {}', () => {
    expect(initialFiles(modules, 'zzz')).toEqual({})
  })
})

describe('cleanStartFiles', () => {
  it('reto normal → files', () => {
    expect(cleanStartFiles(modules, 'c1')).toEqual({ '/a.js': 'a1', '/b.js': 'b1' })
  })
  it('startFrom previous → files+solution del anterior, ignorando guardado', () => {
    saveCode('c2', { '/a.js': 'mío' })
    expect(cleanStartFiles(modules, 'c3')).toEqual({ '/a.js': 'a2-sol' })
  })
  it('startFrom previous en el primero → files', () => {
    expect(cleanStartFiles(first, 'x')).toEqual({ '/a.js': 'x' })
  })
})

describe('solutionFiles', () => {
  it('mezcla sin mutar', () => {
    const cur = { '/a.js': 'mío', '/b.js': 'b' }
    const out = solutionFiles(modules[0].lessons[0].challenges[0], cur)
    expect(out).toEqual({ '/a.js': 'a1-sol', '/b.js': 'b' })
    expect(cur['/a.js']).toBe('mío')
  })
})
