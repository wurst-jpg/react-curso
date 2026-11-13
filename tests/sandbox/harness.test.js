import { HARNESS_SOURCE } from '../../src/sandbox/harness.js'

// Convierte el import del arnés en un parámetro para poder ejecutarlo aquí.
function install(runDomChecks, win) {
  const body = HARNESS_SOURCE.replace(/^import .*$/m, '')
  new Function('runDomChecks', 'window', 'document', body)(runDomChecks, win, document)
}

function fakeWindow() {
  const listeners = []
  const parent = { postMessage: vi.fn() }
  return {
    parent,
    listeners,
    addEventListener: (type, fn) => listeners.push({ type, fn }),
    send: (data) => listeners.filter((l) => l.type === 'message').forEach((l) => l.fn({ data })),
  }
}

describe('HARNESS_SOURCE', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('importa runDomChecks de ./__runner__.js', () => {
    expect(HARNESS_SOURCE).toMatch(/import \{ runDomChecks \} from '\.\/__runner__\.js'/)
  })

  it('avisa harness-ready al cargar', () => {
    const win = fakeWindow()
    install(vi.fn(), win)
    expect(win.parent.postMessage).toHaveBeenCalledWith(
      { source: 'curso-react', type: 'harness-ready', doc: expect.any(Number) },
      '*',
    )
  })

  it('etiqueta harness-ready y check-results con el mismo `doc` (una marca por carga de página)', async () => {
    const win = fakeWindow()
    install(vi.fn().mockResolvedValue([]), win)
    const ready = win.parent.postMessage.mock.calls[0][0]
    expect(ready.doc).toBe(performance.timeOrigin)
    win.send({ source: 'curso-react', type: 'run-checks', runId: 1, checks: [] })
    await vi.advanceTimersByTimeAsync(400)
    const results = win.parent.postMessage.mock.calls[1][0]
    expect(results).toMatchObject({ type: 'check-results', runId: 1, doc: ready.doc })
  })

  it('responde run-checks con el mismo runId y la raíz #root', async () => {
    const win = fakeWindow()
    const root = document.createElement('div')
    root.id = 'root'
    document.body.append(root)
    const run = vi.fn().mockResolvedValue([{ index: 0, label: 'x', status: 'pass' }])
    install(run, win)
    win.parent.postMessage.mockClear()
    const checks = [{ type: 'text', match: 'hola', label: 'x' }]
    win.send({ source: 'curso-react', type: 'run-checks', runId: 7, checks })
    await vi.advanceTimersByTimeAsync(400)
    expect(run).toHaveBeenCalledWith(checks, root)
    expect(win.parent.postMessage).toHaveBeenCalledWith(
      {
        source: 'curso-react',
        type: 'check-results',
        runId: 7,
        doc: expect.any(Number),
        results: [{ index: 0, label: 'x', status: 'pass' }],
      },
      '*',
    )
    root.remove()
  })

  it('ignora mensajes sin source curso-react u otros tipos', async () => {
    const win = fakeWindow()
    const run = vi.fn().mockResolvedValue([])
    install(run, win)
    win.parent.postMessage.mockClear()
    win.send({ type: 'run-checks', runId: 1, checks: [] })
    win.send({ source: 'otro', type: 'run-checks', runId: 2, checks: [] })
    win.send({ source: 'curso-react', type: 'otra-cosa', runId: 3 })
    win.send(null)
    await vi.advanceTimersByTimeAsync(1000)
    expect(run).not.toHaveBeenCalled()
    expect(win.parent.postMessage).not.toHaveBeenCalled()
  })

  it('si el corrector falla, responde un error por cada comprobación', async () => {
    const win = fakeWindow()
    install(vi.fn().mockRejectedValue(new Error('boom')), win)
    win.parent.postMessage.mockClear()
    win.send({ source: 'curso-react', type: 'run-checks', runId: 3, checks: [{ label: 'a' }, { label: 'b' }] })
    await vi.advanceTimersByTimeAsync(400)
    const msg = win.parent.postMessage.mock.calls[0][0]
    expect(msg.runId).toBe(3)
    expect(msg.results.map((r) => [r.index, r.status])).toEqual([[0, 'error'], [1, 'error']])
  })
})
