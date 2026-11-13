import { HIDDEN_PATHS, buildSandboxSetup, studentFiles } from '../../src/sandbox/buildSandbox.js'

const alumno = {
  '/src/main.jsx': "import App from './App.jsx'",
  '/src/App.jsx': 'export default function App() { return null }',
}

describe('buildSandboxSetup', () => {
  it('añade los 4 archivos ocultos con hidden: true', () => {
    const { files } = buildSandboxSetup(alumno)
    expect(HIDDEN_PATHS).toEqual([
      '/src/__entry__.js',
      '/src/__harness__.js',
      '/src/__runner__.js',
      '/public/index.html',
    ])
    for (const path of HIDDEN_PATHS) {
      expect(files[path].hidden).toBe(true)
      expect(typeof files[path].code).toBe('string')
    }
  })

  it('conserva los archivos del alumno sin marcarlos ocultos', () => {
    const { files } = buildSandboxSetup(alumno)
    expect(files['/src/App.jsx']).toBe(alumno['/src/App.jsx'])
    expect(files['/src/main.jsx']).toBe(alumno['/src/main.jsx'])
  })

  it('no deja que el alumno pise un archivo oculto', () => {
    const { files } = buildSandboxSetup({ ...alumno, '/src/__entry__.js': 'malo' })
    expect(files['/src/__entry__.js'].code).not.toBe('malo')
    expect(files['/src/__entry__.js'].hidden).toBe(true)
  })

  it('la entrada importa main.jsx y el arnés', () => {
    const { files } = buildSandboxSetup(alumno)
    expect(files['/src/__entry__.js'].code).toContain("import './main.jsx'")
    expect(files['/src/__entry__.js'].code).toContain("import './__harness__.js'")
  })

  it('index.html tiene el hueco root y Tailwind', () => {
    const html = buildSandboxSetup(alumno).files['/public/index.html'].code
    expect(html).toContain('<div id="root"></div>')
    expect(html).toContain('<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>')
  })

  it('el runner exporta runDomChecks y no tiene imports', () => {
    const code = buildSandboxSetup(alumno).files['/src/__runner__.js'].code
    expect(code).toContain('runDomChecks')
    expect(code).not.toContain('import ')
  })

  it('customSetup trae entry y dependencias mezcladas', () => {
    const { customSetup } = buildSandboxSetup(alumno, { 'react-router-dom': '^7.0.0' })
    expect(customSetup.entry).toBe('/src/__entry__.js')
    expect(customSetup.dependencies).toEqual({
      react: '^19',
      'react-dom': '^19',
      'react-router-dom': '^7.0.0',
    })
  })

  it('pide Tailwind como recurso externo (index.html no se usa en Sandpack)', () => {
    expect(buildSandboxSetup(alumno).options.externalResources).toEqual([
      'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
    ])
  })

  it('dependencies es opcional', () => {
    expect(buildSandboxSetup(alumno).customSetup.dependencies).toEqual({
      react: '^19',
      'react-dom': '^19',
    })
  })
})

describe('studentFiles', () => {
  it('quita los archivos ocultos', () => {
    const todo = buildSandboxSetup(alumno).files
    expect(Object.keys(studentFiles(todo)).sort()).toEqual(['/src/App.jsx', '/src/main.jsx'])
  })
})
