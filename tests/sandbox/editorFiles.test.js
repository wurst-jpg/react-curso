import { editorFiles, normalizeNewPath } from '../../src/sandbox/editorFiles.js'

test('editorFiles deja solo los archivos del alumno como texto plano', () => {
  const files = {
    '/App.js': { code: 'plantilla' },
    '/package.json': { code: '{}' },
    '/public/index.html': { code: '<html>', hidden: true },
    '/src/__harness__.js': { code: 'h', hidden: true },
    '/src/main.jsx': { code: 'main' },
    '/src/App.jsx': { code: 'app' },
    '/src/estilos.css': 'css',
  }
  expect(editorFiles(files)).toEqual({
    '/src/main.jsx': 'main',
    '/src/App.jsx': 'app',
    '/src/estilos.css': 'css',
  })
})

describe('normalizeNewPath', () => {
  const existing = ['/src/main.jsx', '/src/App.jsx']

  test.each([
    ['Saludo.jsx', '/src/Saludo.jsx'],
    ['  Saludo.jsx  ', '/src/Saludo.jsx'],
    ['/Saludo.jsx', '/src/Saludo.jsx'],
    ['src/Saludo.jsx', '/src/Saludo.jsx'],
    ['./src/Saludo.jsx', '/src/Saludo.jsx'],
    ['/src/components/Boton.js', '/src/components/Boton.js'],
    ['estilos.css', '/src/estilos.css'],
  ])('%s → %s', (input, path) => {
    expect(normalizeNewPath(input, existing)).toEqual({ path })
  })

  test.each([
    ['', /escribe un nombre/i],
    ['   ', /escribe un nombre/i],
    ['/src/', /escribe un nombre/i],
    ['notas.txt', /\.jsx/],
    ['Saludo', /\.jsx/],
    ['App.jsx', /ya existe/i],
    ['/src/main.jsx', /ya existe/i],
    ['__harness__.js', /ya existe|reservado/i],
    ['a/../b.jsx', /no es válido/i],
    ['mi archivo.jsx', /no es válido/i],
  ])('rechaza %j', (input, error) => {
    expect(normalizeNewPath(input, existing).error).toMatch(error)
  })
})
