import runnerSource from '../checks/domRunner.js?raw'
import { HARNESS_SOURCE } from './harness.js'

export const HIDDEN_PATHS = [
  '/src/__entry__.js',
  '/src/__harness__.js',
  '/src/__runner__.js',
  '/public/index.html',
]

const TAILWIND_URL = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'

const ENTRY_SOURCE = "import './main.jsx'\nimport './__harness__.js'\n"

const INDEX_HTML = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Vista previa</title>
    <script src="${TAILWIND_URL}"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

// Hallazgo del spike (Sandpack 2.19, template="react"): `customSetup.entry` SÍ se respeta,
// pero `/public/index.html` NO se usa como plantilla (la vista previa usa su propio HTML).
// Por eso Tailwind se carga también con `options.externalResources`, que el consumidor
// debe pasar a <SandpackProvider options={options}>. El index.html se mantiene por fidelidad.
//
// Devuelve la forma que espera Sandpack:
// - archivos del alumno: texto plano (Sandpack lo acepta como código);
// - archivos ocultos: `{ code, hidden: true }`.
// Los ocultos siempre ganan sobre lo que traiga el alumno.
export function buildSandboxSetup(files, dependencies = {}) {
  const hidden = {
    '/src/__entry__.js': ENTRY_SOURCE,
    '/src/__harness__.js': HARNESS_SOURCE,
    '/src/__runner__.js': runnerSource,
    '/public/index.html': INDEX_HTML,
  }
  const result = { ...files }
  for (const [path, code] of Object.entries(hidden)) result[path] = { code, hidden: true }
  return {
    files: result,
    customSetup: {
      entry: '/src/__entry__.js',
      dependencies: { react: '^19', 'react-dom': '^19', ...dependencies },
    },
    options: { externalResources: [TAILWIND_URL] },
  }
}

export function studentFiles(files) {
  return Object.fromEntries(Object.entries(files).filter(([path]) => !HIDDEN_PATHS.includes(path)))
}
