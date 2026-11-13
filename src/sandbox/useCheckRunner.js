import { useCallback, useEffect, useRef, useState } from 'react'

const SOURCE = 'curso-react'

export const TIMEOUT_MESSAGE = 'La vista previa no respondió. Revisa si hay errores en tu código.'
export const RELOAD_TIMEOUT_MESSAGE =
  'La vista previa no terminó de cargar. Revisa si hay errores en tu código (mira la vista previa) y pulsa "Comprobar" otra vez.'
const SUPERSEDED_MESSAGE = 'Se empezó una comprobación nueva.'

// Tras enviar las comprobaciones, el arnés puede tardar: 300 ms de pintado + hasta ~2 s de
// espera por cada bloque de comprobaciones que tarda en aparecer (ver domRunner.js).
const DEFAULT_TIMEOUT_MS = 15000
const DEFAULT_READY_TIMEOUT_MS = 20000

const allAs = (checks, message) =>
  checks.map((check, index) => ({ index, label: check.label, status: 'error', message }))

let counter = 0
const newRunId = () => `run-${Date.now()}-${++counter}`

/**
 * Habla con el arnés de la vista previa. Cada ejecución empieza con la vista previa
 * recién cargada: `run` pide recargarla (`refresh`), espera el `harness-ready` NUEVO que
 * llega tras la recarga y solo entonces envía las comprobaciones. Solo acepta mensajes
 * que vengan de la ventana del iframe actual y, para resultados, del `runId` en curso.
 */
export function useCheckRunner(
  getIframe,
  { timeoutMs = DEFAULT_TIMEOUT_MS, readyTimeoutMs = DEFAULT_READY_TIMEOUT_MS, refresh } = {},
) {
  const getIframeRef = useRef(getIframe)
  const refreshRef = useRef(refresh)
  const currentRef = useRef(null)
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

  // Solo se envía cuando llega el harness-ready posterior a la recarga.
  const send = (win) => {
    const current = currentRef.current
    if (!current || current.sent) return
    current.sent = true
    armTimer(current, current.timeoutMs, TIMEOUT_MESSAGE)
    win.postMessage({ source: SOURCE, type: 'run-checks', runId: current.runId, checks: current.checks }, '*')
  }

  useEffect(() => {
    function onMessage(event) {
      const data = event.data
      if (!data || data.source !== SOURCE) return
      const win = currentWindow()
      if (!win || event.source !== win) return
      if (data.type === 'harness-ready') {
        setReady(true)
        send(win)
      } else if (data.type === 'check-results') {
        const current = currentRef.current
        if (!current || data.runId !== current.runId) return
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

  const run = useCallback(
    (checks) => {
      const previous = currentRef.current
      if (previous) {
        clearTimeout(previous.timer)
        currentRef.current = null
        previous.resolve(allAs(previous.checks, SUPERSEDED_MESSAGE))
      }
      return new Promise((resolve) => {
        const current = { runId: newRunId(), checks, resolve, timer: null, sent: false, timeoutMs }
        currentRef.current = current
        armTimer(current, readyTimeoutMs, RELOAD_TIMEOUT_MESSAGE)
        refreshRef.current?.()
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeoutMs, readyTimeoutMs],
  )

  return { run, ready }
}
