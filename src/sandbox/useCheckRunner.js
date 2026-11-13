import { useCallback, useEffect, useRef, useState } from 'react'

const SOURCE = 'curso-react'

export const TIMEOUT_MESSAGE = 'La vista previa no respondió. Revisa si hay errores en tu código.'
export const RELOAD_TIMEOUT_MESSAGE =
  'La vista previa no terminó de cargar. Revisa si hay errores en tu código (mira la vista previa) y pulsa "Comprobar" otra vez.'
const SUPERSEDED_MESSAGE = 'Se empezó una comprobación nueva.'

// Tras enviar las comprobaciones, el arnés tarda como mucho: 300 ms de pintado + el tope de
// toda la tanda (~10 s, ver TOTAL_MS en domRunner.js) + unos ms por paso de interacción.
const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_READY_TIMEOUT_MS = 20000

const allAs = (checks, message) =>
  checks.map((check, index) => ({ index, label: check.label, status: 'error', message }))

let counter = 0
const newRunId = () => `run-${Date.now()}-${++counter}`

// Mensajes de Sandpack que indican que la vista previa no va a llegar a cargar el arnés.
const isSandpackError = (message) =>
  (message.type === 'action' && message.action === 'show-error') ||
  (message.type === 'done' && message.compilatonError === true)

/**
 * Habla con el arnés de la vista previa. Cada ejecución empieza con la vista previa
 * recién cargada: `run` pide recargarla (`refresh`), espera el `harness-ready` NUEVO que
 * llega tras la recarga y solo entonces envía las comprobaciones.
 *
 * Como la ventana del iframe es la misma antes y después de recargar, cada carga de la
 * página se distingue por la marca `doc` que manda el arnés: tras `run` solo vale un
 * harness-ready con un `doc` distinto al último visto, y solo se aceptan resultados con
 * el `runId` en curso y el `doc` de esa página.
 *
 * `listen` (opcional, el de Sandpack): si la vista previa avisa de un error de compilación
 * o ejecución antes de que el arnés cargue, se termina ya en vez de esperar 20 s.
 */
export function useCheckRunner(
  getIframe,
  { timeoutMs = DEFAULT_TIMEOUT_MS, readyTimeoutMs = DEFAULT_READY_TIMEOUT_MS, refresh, listen } = {},
) {
  const getIframeRef = useRef(getIframe)
  const refreshRef = useRef(refresh)
  const currentRef = useRef(null)
  // Última página del iframe que avisó harness-ready: { win, doc } o null.
  const lastReadyRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getIframeRef.current = getIframe
    refreshRef.current = refresh
  })

  const currentWindow = () => getIframeRef.current?.()?.contentWindow ?? null

  const finish = (results) => {
    const current = currentRef.current
    if (!current) return
    clearTimeout(current.timer)
    currentRef.current = null
    current.resolve(results)
  }

  const armTimer = (current, ms, message) => {
    clearTimeout(current.timer)
    current.timer = setTimeout(() => {
      if (currentRef.current === current) finish(allAs(current.checks, message))
    }, ms)
  }

  const send = (win, doc) => {
    const current = currentRef.current
    if (!current || current.sent) return
    current.sent = true
    current.doc = doc ?? null
    armTimer(current, current.timeoutMs, TIMEOUT_MESSAGE)
    win.postMessage({ source: SOURCE, type: 'run-checks', runId: current.runId, checks: current.checks }, '*')
  }

  // Una página "nueva" es la que trae un `doc` distinto al de la última vista (o cualquiera, si
  // no se había visto ninguna o no viene marcada).
  const isFreshDoc = (current, doc) => current.staleDoc == null || doc == null || doc !== current.staleDoc

  useEffect(() => {
    function onMessage(event) {
      const data = event.data
      if (!data || data.source !== SOURCE) return
      const win = currentWindow()
      if (!win || event.source !== win) return
      if (data.type === 'harness-ready') {
        lastReadyRef.current = { win, doc: data.doc ?? null }
        setReady(true)
        const current = currentRef.current
        if (current && isFreshDoc(current, data.doc)) send(win, data.doc)
      } else if (data.type === 'check-results') {
        const current = currentRef.current
        if (!current || !current.sent || data.runId !== current.runId) return
        if (current.doc != null && data.doc != null && data.doc !== current.doc) return
        finish(Array.isArray(data.results) ? data.results : allAs(current.checks, TIMEOUT_MESSAGE))
      }
    }
    window.addEventListener('message', onMessage)
    return () => {
      window.removeEventListener('message', onMessage)
      const current = currentRef.current
      if (current) {
        clearTimeout(current.timer)
        currentRef.current = null
        current.resolve(allAs(current.checks, TIMEOUT_MESSAGE))
      }
    }
    // `send`/`finish`/`currentWindow` solo leen refs: no necesitan ser dependencias.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof listen !== 'function') return undefined
    return listen((message) => {
      const current = currentRef.current
      if (!current || current.sent || !message || !isSandpackError(message)) return
      finish(allAs(current.checks, RELOAD_TIMEOUT_MESSAGE))
    })
  }, [listen])

  const run = useCallback(
    (checks) => {
      const previous = currentRef.current
      if (previous) {
        clearTimeout(previous.timer)
        currentRef.current = null
        previous.resolve(allAs(previous.checks, SUPERSEDED_MESSAGE))
      }
      return new Promise((resolve) => {
        const last = lastReadyRef.current
        const current = {
          runId: newRunId(),
          checks,
          resolve,
          timer: null,
          sent: false,
          timeoutMs,
          staleDoc: last?.doc ?? null,
          doc: null,
        }
        currentRef.current = current
        const refresh = refreshRef.current
        if (refresh) {
          armTimer(current, readyTimeoutMs, RELOAD_TIMEOUT_MESSAGE)
          refresh()
          return
        }
        // Sin recarga: si la vista previa actual ya está lista, se envía ya.
        const win = currentWindow()
        if (last && win && last.win === win) send(win, last.doc)
        else armTimer(current, readyTimeoutMs, RELOAD_TIMEOUT_MESSAGE)
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeoutMs, readyTimeoutMs],
  )

  return { run, ready }
}
