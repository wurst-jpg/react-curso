import { act, renderHook } from '@testing-library/react'
import { RELOAD_TIMEOUT_MESSAGE, TIMEOUT_MESSAGE, useCheckRunner } from '../../src/sandbox/useCheckRunner.js'

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
let refresh

// Cada ejecución empieza con la vista previa recién cargada: `run` pide recargar y
// espera un harness-ready NUEVO (el que llega tras la recarga) antes de enviar nada.
const render = (options = {}) => renderHook(() => useCheckRunner(() => iframe, { refresh, ...options }))

beforeEach(() => {
  ;({ iframe, spy } = makeIframe())
  refresh = vi.fn()
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

test('pide recargar la vista previa antes de enviar y resuelve con los resultados del runId correcto', async () => {
  const { result } = render()
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  expect(result.current.ready).toBe(true)

  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  expect(refresh).toHaveBeenCalledTimes(1)
  // El harness-ready anterior a la recarga no vale: todavía no se envía nada.
  await Promise.resolve()
  expect(spy).not.toHaveBeenCalled()

  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  const message = spy.mock.calls[0][0]
  expect(message).toMatchObject({ source: SOURCE, type: 'run-checks', checks })
  expect(spy.mock.calls[0][1]).toBe('*')
  expect(refresh.mock.invocationCallOrder[0]).toBeLessThan(spy.mock.invocationCallOrder[0])

  const results = [
    { index: 0, label: 'Dice hola', status: 'pass' },
    { index: 1, label: 'Hay un botón', status: 'fail', message: 'No hay' },
  ]
  sendFrom(iframe.contentWindow, { type: 'check-results', runId: message.runId, results })
  await expect(promise).resolves.toEqual(results)
})

test('un segundo harness-ready durante la misma ejecución no reenvía las comprobaciones', async () => {
  const { result } = render()
  act(() => {
    result.current.run(checks)
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  await Promise.resolve()
  expect(spy).toHaveBeenCalledTimes(1)
})

test('ignora respuestas con otro runId y de otras fuentes', async () => {
  const other = makeIframe().iframe
  const { result } = render()

  let settled = false
  let promise
  act(() => {
    promise = result.current.run(checks).then((r) => {
      settled = true
      return r
    })
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
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

test('ignora harness-ready de otra fuente', async () => {
  const other = makeIframe().iframe
  const { result } = render()
  sendFrom(other.contentWindow, { type: 'harness-ready' })
  expect(result.current.ready).toBe(false)

  act(() => {
    result.current.run(checks)
  })
  sendFrom(other.contentWindow, { type: 'harness-ready' })
  await Promise.resolve()
  expect(spy).not.toHaveBeenCalled()
})

// Cada carga de la página del iframe lleva una marca `doc` (performance.timeOrigin). Tras pedir
// recargar, solo vale un harness-ready con una marca DISTINTA a la última vista: la página vieja
// puede seguir mandando mensajes mientras la nueva empieza a cargar.
test('un harness-ready de la página vieja (mismo doc) tras run() no envía nada; el de la nueva sí', async () => {
  const { result } = render()
  sendFrom(iframe.contentWindow, { type: 'harness-ready', doc: 1000 })
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready', doc: 1000 })
  await Promise.resolve()
  expect(spy).not.toHaveBeenCalled()

  sendFrom(iframe.contentWindow, { type: 'harness-ready', doc: 2000 })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  const runId = lastRunId(spy)

  // Resultados de la página vieja (otro doc) se ignoran aunque traigan el runId correcto.
  let settled = false
  promise.then(() => (settled = true))
  sendFrom(iframe.contentWindow, { type: 'check-results', runId, doc: 1000, results: [] })
  await Promise.resolve()
  expect(settled).toBe(false)

  const results = [{ index: 0, label: 'Dice hola', status: 'pass' }]
  sendFrom(iframe.contentWindow, { type: 'check-results', runId, doc: 2000, results })
  await expect(promise).resolves.toEqual(results)
})

test('sin ningún harness-ready previo, el primero que llegue vale (doc cualquiera)', async () => {
  const { result } = render()
  act(() => {
    result.current.run(checks)
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready', doc: 1000 })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
})

test('sin función de recarga y con la vista previa ya lista, envía de inmediato', async () => {
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  sendFrom(iframe.contentWindow, { type: 'harness-ready', doc: 1000 })
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  expect(spy).toHaveBeenCalledTimes(1)
  const results = [{ index: 0, label: 'Dice hola', status: 'pass' }]
  sendFrom(iframe.contentWindow, { type: 'check-results', runId: lastRunId(spy), doc: 1000, results })
  await expect(promise).resolves.toEqual(results)
})

test('si Sandpack avisa de un error de compilación/ejecución mientras recarga, termina ya con el mensaje de recarga', async () => {
  vi.useFakeTimers()
  const callbacks = []
  const unsubscribe = vi.fn()
  const listen = vi.fn((cb) => {
    callbacks.push(cb)
    return unsubscribe
  })
  const { result, unmount } = renderHook(() => useCheckRunner(() => iframe, { refresh, listen }))
  // Un error anterior a run() no afecta.
  act(() => callbacks.forEach((cb) => cb({ type: 'action', action: 'show-error', message: 'viejo' })))
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  act(() => callbacks.forEach((cb) => cb({ type: 'done', compilatonError: false })))
  await act(() => vi.advanceTimersByTimeAsync(100))
  let settled = null
  promise.then((r) => (settled = r))
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(settled).toBeNull()

  act(() => callbacks.forEach((cb) => cb({ type: 'action', action: 'show-error', message: 'SyntaxError' })))
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(settled.map((r) => r.message)).toEqual([RELOAD_TIMEOUT_MESSAGE, RELOAD_TIMEOUT_MESSAGE])
  expect(spy).not.toHaveBeenCalled()

  // Con las comprobaciones ya enviadas, un error de ejecución no corta la espera de resultados.
  act(() => {
    promise = result.current.run(checks)
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready', doc: 3000 })
  expect(spy).toHaveBeenCalledTimes(1)
  settled = null
  promise.then((r) => (settled = r))
  act(() => callbacks.forEach((cb) => cb({ type: 'action', action: 'show-error', message: 'en caliente' })))
  await act(() => vi.advanceTimersByTimeAsync(0))
  expect(settled).toBeNull()

  unmount()
  expect(unsubscribe).toHaveBeenCalled()
})

test('desmontar durante una ejecución quita el listener, limpia el temporizador y resuelve', async () => {
  vi.useFakeTimers()
  const add = vi.spyOn(window, 'addEventListener')
  const remove = vi.spyOn(window, 'removeEventListener')
  const clear = vi.spyOn(globalThis, 'clearTimeout')
  const { result, unmount } = render()
  const onMessage = add.mock.calls.find(([type]) => type === 'message')[1]
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  clear.mockClear()
  unmount()
  expect(remove).toHaveBeenCalledWith('message', onMessage)
  expect(clear).toHaveBeenCalled()
  expect((await promise).map((r) => r.status)).toEqual(['error', 'error'])
  await act(() => vi.advanceTimersByTimeAsync(30000)) // no queda nada pendiente que explote
  add.mockRestore()
  remove.mockRestore()
  clear.mockRestore()
})

test('funciona sin función de recarga (solo espera el siguiente harness-ready)', async () => {
  const { result } = renderHook(() => useCheckRunner(() => iframe))
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  const results = [{ index: 0, label: 'Dice hola', status: 'pass' }]
  sendFrom(iframe.contentWindow, { type: 'check-results', runId: lastRunId(spy), results })
  await expect(promise).resolves.toEqual(results)
})

test('a los 15000 ms sin respuesta (tras enviar) devuelve todo como error con el mensaje exacto', async () => {
  vi.useFakeTimers()
  const { result } = render()
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  await act(() => vi.advanceTimersByTimeAsync(3000)) // la recarga tarda un poco
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  expect(spy).toHaveBeenCalledTimes(1)

  await act(() => vi.advanceTimersByTimeAsync(14999))
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

test('si la vista previa no vuelve a avisar en 20000 ms, falla con un mensaje claro y sin enviar nada', async () => {
  vi.useFakeTimers()
  const { result } = render()
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  await act(() => vi.advanceTimersByTimeAsync(19999))
  let settled = false
  promise.then(() => (settled = true))
  await Promise.resolve()
  expect(settled).toBe(false)

  await act(() => vi.advanceTimersByTimeAsync(1))
  const msg = 'La vista previa no terminó de cargar. Revisa si hay errores en tu código (mira la vista previa) y pulsa "Comprobar" otra vez.'
  expect(RELOAD_TIMEOUT_MESSAGE).toBe(msg)
  await expect(promise).resolves.toEqual([
    { index: 0, label: 'Dice hola', status: 'error', message: msg },
    { index: 1, label: 'Hay un botón', status: 'error', message: msg },
  ])
  expect(spy).not.toHaveBeenCalled()

  // Un harness-ready tardío ya no envía nada.
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  expect(spy).not.toHaveBeenCalled()
})

test('los tiempos de espera se pueden configurar', async () => {
  vi.useFakeTimers()
  const { result } = render({ readyTimeoutMs: 1000, timeoutMs: 500 })
  let promise
  act(() => {
    promise = result.current.run(checks)
  })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  expect((await promise).map((r) => r.message)).toEqual([RELOAD_TIMEOUT_MESSAGE, RELOAD_TIMEOUT_MESSAGE])

  act(() => {
    promise = result.current.run(checks)
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  await act(() => vi.advanceTimersByTimeAsync(500))
  expect((await promise).map((r) => r.message)).toEqual([TIMEOUT_MESSAGE, TIMEOUT_MESSAGE])
})

test('una respuesta de una ejecución anterior no resuelve la actual', async () => {
  const { result } = render()
  let first
  let second
  act(() => {
    first = result.current.run(checks)
  })
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
  await vi.waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  const oldRunId = lastRunId(spy)
  act(() => {
    second = result.current.run(checks)
  })
  expect(refresh).toHaveBeenCalledTimes(2)
  sendFrom(iframe.contentWindow, { type: 'harness-ready' })
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
