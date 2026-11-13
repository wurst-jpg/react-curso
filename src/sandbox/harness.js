// Código que corre DENTRO de la vista previa (iframe). Se guarda como texto y se
// inyecta como archivo oculto `/src/__harness__.js`; Sandpack lo trata como módulo.
// Avisa a la página de que está listo y, cuando se lo piden, ejecuta las
// comprobaciones sobre lo que React ya pintó y devuelve los resultados.
export const HARNESS_SOURCE = `import { runDomChecks } from './__runner__.js'

const SOURCE = 'curso-react'
const PAINT_DELAY_MS = 300
// Marca de ESTA carga de la página: la página distingue el aviso de la vista previa recién
// recargada del de la anterior (la ventana del iframe es la misma antes y después de recargar).
const DOC = typeof performance !== 'undefined' && performance.timeOrigin ? performance.timeOrigin : Date.now()

function send(message) {
  window.parent.postMessage({ source: SOURCE, doc: DOC, ...message }, '*')
}

window.addEventListener('message', async (event) => {
  const data = event.data
  if (!data || data.source !== SOURCE || data.type !== 'run-checks') return
  const checks = Array.isArray(data.checks) ? data.checks : []
  // Damos un momento a React para que termine de pintar.
  await new Promise((resolve) => setTimeout(resolve, PAINT_DELAY_MS))
  let results
  try {
    results = await runDomChecks(checks, document.getElementById('root') ?? document.body)
  } catch (error) {
    results = checks.map((check, index) => ({
      index,
      label: check && check.label,
      status: 'error',
      message: 'No se pudo comprobar: ' + (error && error.message),
    }))
  }
  send({ type: 'check-results', runId: data.runId, results })
})

send({ type: 'harness-ready' })
`
