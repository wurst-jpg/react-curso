import { runFileChecks } from '../../src/checks/fileChecks.js'

const files = {
  '/src/main.jsx': 'import App from "./App"',
  '/src/App.jsx': 'export default function App() { return <h1>Hola</h1> }',
  '/src/styles.css': 'body{}',
}
const lint = () => []

describe('runFileChecks', () => {
  it('file-exists por regex de ruta', () => {
    const res = runFileChecks(
      [
        { type: 'file-exists', label: 'a', pattern: 'components/Button\\.jsx$' },
        { type: 'file-exists', label: 'b', pattern: 'App\\.jsx$' },
      ],
      files,
      { lint },
    )
    expect(res.map((r) => r.status)).toEqual(['fail', 'pass'])
    expect(res[0].message).toBeTruthy()
  })
  it('file-includes con y sin path', () => {
    const res = runFileChecks(
      [
        { type: 'file-includes', label: 'a', path: '/src/App.jsx', pattern: '<h1>' },
        { type: 'file-includes', label: 'b', path: '/src/main.jsx', pattern: '<h1>' },
        { type: 'file-includes', label: 'c', pattern: 'import App' },
        { type: 'file-includes', label: 'd', pattern: 'zzz' },
        { type: 'file-includes', label: 'e', path: '/no/existe.js', pattern: 'x' },
      ],
      files,
      { lint },
    )
    expect(res.map((r) => r.status)).toEqual(['pass', 'fail', 'pass', 'fail', 'fail'])
  })
  it('file-count cuenta solo .js/.jsx', () => {
    const res = runFileChecks(
      [
        { type: 'file-count', label: 'a', min: 2 },
        { type: 'file-count', label: 'b', min: 3 },
      ],
      files,
      { lint },
    )
    expect(res.map((r) => r.status)).toEqual(['pass', 'fail'])
  })
  it('lint-clean usa el linter inyectado', () => {
    const c = [{ type: 'lint-clean', label: 'l' }]
    expect(runFileChecks(c, files, { lint })[0].status).toBe('pass')
    expect(runFileChecks(c, files, { lint: () => [{ severity: 1 }] })[0].status).toBe('pass')
    const bad = runFileChecks(c, files, { lint: () => [{ severity: 2 }] })[0]
    expect(bad.status).toBe('fail')
    expect(bad.message).toBeTruthy()
  })
  it('lint-clean solo revisa archivos .js/.jsx', () => {
    const lintJsOnly = (code) => (code.includes('body{}') ? [{ severity: 2 }] : [])
    const r = runFileChecks([{ type: 'lint-clean', label: 'l' }], files, { lint: lintJsOnly })[0]
    expect(r.status).toBe('pass')
  })
  it('lint que lanza excepción da error', () => {
    const r = runFileChecks([{ type: 'lint-clean', label: 'l' }], files, {
      lint: () => {
        throw new Error('boom')
      },
    })[0]
    expect(r.status).toBe('error')
  })
  it('manual pendiente o hecho', () => {
    const c = [
      { type: 'manual', label: 'a' },
      { type: 'manual', label: 'b' },
    ]
    expect(runFileChecks(c, files, { lint }).map((r) => r.status)).toEqual([
      'manual-pending',
      'manual-pending',
    ])
    expect(
      runFileChecks(c, files, { lint, manualDone: { 1: true } }).map((r) => r.status),
    ).toEqual(['manual-pending', 'manual-done'])
  })
  it('omite tipos de iframe y conserva el índice original', () => {
    const res = runFileChecks(
      [
        { type: 'text', label: 'i', match: 'x' },
        { type: 'file-count', label: 'f', min: 1 },
        { type: 'manual', label: 'm' },
      ],
      files,
      { lint },
    )
    expect(res.map((r) => r.index)).toEqual([1, 2])
    expect(res[0].label).toBe('f')
  })
})
