import { act, renderHook } from '@testing-library/react'
import { TIMEOUT_MESSAGE, useCheckRunner } from '../../src/sandbox/useCheckRunner.js'

const SOURCE = 'curso-react'
const checks = [
  { type: 'text', match: 'Hola', label: 'Dice hola' },
  { type: 'role', role: 'button', label: 'Hay un botón' },
]

function makeIframe() {
  const iframe = document.createElement('iframe')
  document.body.appendChild(iframe)
  const spy = vi.spyOn(iframe.contentWindow, 'postMessage').mockImplementation(() => {})
  return { iframe, spy }
}

function sendFrom(win, data) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data: { source: SOURCE, ...data }, source: win }))
  })
}

const lastRunId = (spy) => spy.mock.calls.at(-1)[0].runId

let iframe
let spy

beforeEach(() => {
  ;({ iframe, spy } = makeIframe())
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

test('resuelve con los resultados del runId correcto', async () => {
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  expect(result.current.ready).toBe(true)

  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  await vi.waitFor(() => expect(spy).toHaveBeenCalled())
  const message = spy.mock.calls[0][0]
  expect(message).toMatchObject({ source: SOURCE, type: 'run-checks', checks })
  expect(spy.mock.calls[0][1]).toBe('*')

  const results = [
    { index: 0, label: 'Dice hola', status: 'pass' },
    { index: 1, label: 'Hay un botón', status: 'fail', message: 'No hay' },
  ]
  sendFrom(iframe.contentWindow, { type: 'check-results', runId: message.runId, results })
  await expect(promise).resolves.toEqual(results)
})

test('ignora respuestas con otro runId y de otras fuentes', async () => {
  const other = makeIframe().iframe
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })

  let settled = false
  let promise
  act(() => {
    promise = result.current.run(checks).then((r) => {
      settled = true
      return r
    })
  })
  await vi.waitFor(() => expect(spy).toHaveBeenCalled())
  const runId = lastRunId(spy)
  const good = [{ index: 0, label: 'Dice hola', status: 'pass' }]

  sendFrom(iframe.contentWindow, { type: 'check-results', runId: runId + 'x', results: [] })
  sendFrom(other.contentWindow, { type: 'check-results', runId, results: [] })
  sendFrom(window, { type: 'check-results', runId, results: [] })
  await Promise.resolve()
  expect(settled).toBe(false)

  sendFrom(iframe.contentWindow, { type: 'check-results', runId, results: good })
  await expect(promise).resolves.toEqual(good)
})

test('ignora harness-ready de otra fuente', () => {
  const other = makeIframe().iframe
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  sendFrom(other.contentWindow, { type: 'harness-ready' })
  expect(result.current.ready).toBe(false)
})

test('espera harness-ready antes de enviar las comprobaciones', async () => {
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  await Promise.resolve()
  expect(spy).not.toHaveBeenCalled()

  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  const results = [{ index: 0, label: 'Dice hola', status: 'pass' }]
  sendFrom(iframe.contentWindow, { type: 'check-results', runId: lastRunId(spy), results })
  await expect(promise).resolves.toEqual(results)
})

test('a los 5000 ms sin respuesta devuelve todo como error con el mensaje exacto', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  await act(() => vi.advanceTimersByTimeAsync(4999))
  let settled = false
  promise.then(() => (settled = true))
  await Promise.resolve()
  expect(settled).toBe(false)

  await act(() => vi.advanceTimersByTimeAsync(1))
  const msg = 'La vista previa no respondió. Revisa si hay errores en tu código.'
  expect(TIMEOUT_MESSAGE).toBe(msg)
  await expect(promise).resolves.toEqual([
    { index: 0, label: 'Dice hola', status: 'error', message: msg },
    { index: 1, label: 'Hay un botón', status: 'error', message: msg },
  ])
})

test('el tiempo de espera también cubre la espera de harness-ready', async () => {
  vi.useFakeTimers()
  const { result } = renderHook(() => useCheckRunner(() => iframe, { timeoutMs: 1000 }))
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  const out = await promise
  expect(out.map((r) => r.status)).toEqual(['error', 'error'])
  expect(spy).not.toHaveBeenCalled()
})

test('una respuesta de una ejecución anterior no resuelve la actual', async () => {
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  let first
  let second
  act(() => {
    first = result.current.run(checks)
  })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  const oldRunId = lastRunId(spy)
  act(() => {
    second = result.current.run(checks)
  })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(2))
  const newRunId = lastRunId(spy)
  expect(newRunId).not.toBe(oldRunId)

  let secondSettled = false
  second.then(() => (secondSettled = true))
  sendFrom(iframe.contentWindow, { type: 'check-results', runId: oldRunId, results: [] })
  await Promise.resolve()
  expect(secondSettled).toBe(false)

  const results = [{ index: 0, label: 'Dice hola', status: 'pass' }]
  sendFrom(iframe.contentWindow, { type: 'check-results', runId: newRunId, results })
  await expect(second).resolves.toEqual(results)
  // La ejecución anterior queda sustituida y no se queda colgada para siempre.
  await expect(first).resolves.toHaveLength(2)
})
