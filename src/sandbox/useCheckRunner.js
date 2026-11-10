import { useCallback, useEffect, useRef, useState } from 'react'

const SOURCE = 'curso-react'

export const TIMEOUT_MESSAGE = 'La vista previa no respondió. Revisa si hay errores en tu código.'
const SUPERSEDED_MESSAGE = 'Se empezó una comprobación nueva.'

const allAs = (checks, message) =>
  checks.map((check, index) => ({ index, label: check.label, status: 'error', message }))

let counter = 0
const newRunId = () => `run-${Date.now()}-${++counter}`

/**
 * Habla con el arnés de la vista previa. Solo acepta mensajes que vengan de la
 * ventana del iframe actual y, para resultados, del `runId` en curso.
 */
export function useCheckRunner(getIframe, { timeoutMs = 5000 } = {}) {
  const getIframeRef = useRef(getIframe)
  const readyWindowRef = useRef(null)
  const currentRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getIframeRef.current = getIframe
  })

  const currentWindow = () => getIframeRef.current?.()?.contentWindow ?? null

  const finish = (results) => {
    const current = currentRef.current
    if (!current) return
    clearTimeout(current.timer)
    currentRef.current = null
    current.resolve(results)
  }

  const send = () => {
    const current = currentRef.current
    const win = currentWindow()
    if (!current || current.sent || !win || readyWindowRef.current !== win) return
    current.sent = true
    win.postMessage({ source: SOURCE, type: 'run-checks', runId: current.runId, checks: current.checks }, '*')
  }

  useEffect(() => {
    function onMessage(event) {
      const data = event.data
      if (!data || data.source !== SOURCE) return
      const win = currentWindow()
      if (!win || event.source !== win) return
      if (data.type === 'harness-ready') {
        readyWindowRef.current = win
        setReady(true)
        send()
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
        const runId = newRunId()
        const timer = setTimeout(() => {
          if (currentRef.current?.runId === runId) finish(allAs(checks, TIMEOUT_MESSAGE))
        }, timeoutMs)
        currentRef.current = { runId, checks, resolve, timer, sent: false }
        send()
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timeoutMs],
  )

  return { run, ready }
}
