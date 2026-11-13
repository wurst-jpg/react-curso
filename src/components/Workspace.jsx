import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { SandpackCodeEditor, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react'
import { IFRAME_CHECK_TYPES } from '../content/schema.js'
import { runFileChecks } from '../checks/fileChecks.js'
import { summarizeResults } from '../checks/summarize.js'
import { lintSource } from '../lint/lintSource.js'
import { createLintExtension } from '../lint/lintExtension.js'
import { createAutocompleteController } from '../autocomplete/autocompleteExtension.js'
import { completeChallenge } from '../progress/progress.js'
import { useProgress } from '../progress/ProgressContext.jsx'
import { saveCode, solutionFiles } from '../progress/code.js'
import { loadSettings, saveSettings } from '../progress/settings.js'
import { editorFiles } from '../sandbox/editorFiles.js'
import { useCheckRunner } from '../sandbox/useCheckRunner.js'
import FileTabsBar from './FileTabsBar.jsx'
import AutocompleteToggle from './AutocompleteToggle.jsx'
import CheckPanel from './CheckPanel.jsx'
import HintBox from './HintBox.jsx'
import Celebration from './Celebration.jsx'

const SAVE_DELAY_MS = 500
const SLOW_PREVIEW_MS = 30000
const PREVIEW_PREPARING_MESSAGE =
  'La vista previa todavía se está preparando. Espera a que aparezca tu página y pulsa "Comprobar" otra vez.'

const button =
  'rounded-lg px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:opacity-60'

const CONFIRMS = {
  solution: {
    text: 'Si ves la solución, este reto te dará solo la mitad de XP. ¿Quieres verla?',
    yes: 'Sí, ver la solución',
  },
  reset: { text: 'Se borrará lo que escribiste en este reto y volverás al principio. ¿Seguro?', yes: 'Sí, reiniciar' },
  clean: {
    text: 'Empezarás con una versión limpia del reto anterior (ya resuelto) y se borrará lo que escribiste aquí. ¿Seguro?',
    yes: 'Sí, empezar limpio',
  },
}

// Comprobaciones del iframe: se mandan solo esas y sus resultados se devuelven a su
// posición original en `checks`.
async function runAllChecks(checks, files, run, manualDone) {
  const pageResults = runFileChecks(checks, files, { lint: lintSource, manualDone })
  const iframeIndices = []
  checks.forEach((check, i) => {
    if (IFRAME_CHECK_TYPES.includes(check.type)) iframeIndices.push(i)
  })
  let iframeResults = []
  if (iframeIndices.length > 0) {
    const raw = await run(iframeIndices.map((i) => checks[i]))
    iframeResults = iframeIndices.map((original, k) => {
      const r = raw.find((x) => x.index === k)
      const label = checks[original].label
      return r
        ? { ...r, index: original, label }
        : { index: original, label, status: 'error', message: 'No pude hacer esta comprobación.' }
    })
  }
  return [...pageResults, ...iframeResults].sort((a, b) => a.index - b.index)
}

export default function Workspace({ challenge, nextChallenge, hintsShown, onRevealHint, onRestart, canCleanStart }) {
  const { sandpack, listen, dispatch } = useSandpack()
  const { progress, complete, viewSolution } = useProgress()
  const files = useMemo(() => editorFiles(sandpack.files), [sandpack.files])
  const paths = Object.keys(files)

  // El interruptor del autocompletado no reconfigura el editor: las extensiones se crean una
  // sola vez y solo cambia lo que consultan, así no se recrea el editor ni la vista previa.
  const [autocomplete, setAutocomplete] = useState(() => loadSettings().autocomplete)
  const [controller] = useState(() => createAutocompleteController({ enabled: autocomplete, files }))
  const extensions = useMemo(() => [createLintExtension(), controller.extension], [controller])
  useEffect(() => controller.setFiles(files), [controller, files])
  function toggleAutocomplete() {
    const next = !autocomplete
    controller.setEnabled(next)
    setAutocomplete(next)
    saveSettings({ autocomplete: next })
  }

  const previewRef = useRef(null)
  const previewBoxRef = useRef(null)
  // Cada "Comprobar" recarga la vista previa (mismo mensaje que su botón de recargar) para que
  // el estado de clics anteriores no se cuele en la comprobación.
  const { run, ready } = useCheckRunner(
    () => previewRef.current?.getClient?.()?.iframe ?? previewBoxRef.current?.querySelector('iframe') ?? null,
    { refresh: () => dispatch({ type: 'refresh' }), listen },
  )
  // Solo la última comprobación lanzada escribe resultados (por si el botón se pulsa dos veces).
  const checkSeqRef = useRef(0)

  const [results, setResults] = useState(null)
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState(null)
  const [manualDone, setManualDone] = useState({})
  const [celebration, setCelebration] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [bundled, setBundled] = useState(false)
  const [slow, setSlow] = useState(false)
  const previewLoaded = ready || bundled

  // Guardado con espera: se guarda ~500 ms después de dejar de escribir.
  // Solo si el alumno cambió algo: abrir un reto no guarda sus archivos de inicio
  // (si no, en retos `startFrom: 'previous'` se congelaría el código del reto anterior).
  const [initialJson] = useState(() => JSON.stringify(files))
  const pendingRef = useRef(null)
  const discardRef = useRef(false)
  useEffect(() => {
    if (JSON.stringify(files) === initialJson) {
      pendingRef.current = null
      return undefined
    }
    pendingRef.current = files
    const timer = setTimeout(() => {
      saveCode(challenge.id, files)
      pendingRef.current = null
    }, SAVE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [challenge.id, files, initialJson])
  // Si el alumno sale del reto o cierra la pestaña antes de la espera, se guarda
  // ya lo pendiente (salvo al reiniciar o ver la solución).
  useEffect(() => {
    const flush = () => {
      if (pendingRef.current && !discardRef.current) {
        saveCode(challenge.id, pendingRef.current)
        pendingRef.current = null
      }
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [challenge.id])

  useEffect(() => {
    if (!listen) return undefined
    return listen((message) => {
      if (message.type === 'done') setBundled(true)
    })
  }, [listen])
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_PREVIEW_MS)
    return () => clearTimeout(timer)
  }, [])

  // `kind`: 'solution' (con los archivos ya resueltos), 'reset' o 'clean'.
  function restart(kind, newFiles) {
    discardRef.current = true
    pendingRef.current = null
    onRestart(kind, newFiles)
  }

  function confirm() {
    const kind = confirming
    setConfirming(null)
    if (kind === 'solution') {
      viewSolution(challenge.id)
      const solved = solutionFiles(challenge, files)
      saveCode(challenge.id, solved)
      restart('solution', solved)
    } else {
      restart(kind)
    }
  }

  async function check() {
    setCelebration(null)
    setCheckError(null)
    // Con la vista previa aún cargando, no se culpa al código del alumno.
    if (!previewLoaded && challenge.checks.some((c) => IFRAME_CHECK_TYPES.includes(c.type))) {
      setResults(null)
      setCheckError(PREVIEW_PREPARING_MESSAGE)
      return
    }
    const seq = ++checkSeqRef.current
    const latest = () => seq === checkSeqRef.current
    setChecking(true)
    try {
      const all = await runAllChecks(challenge.checks, files, run, manualDone)
      if (!latest()) return
      setResults(all)
      if (summarizeResults(all).passed) {
        const gained = completeChallenge(progress, challenge).xp - progress.xp
        complete(challenge)
        setCelebration({ xp: gained })
      }
    } catch {
      if (!latest()) return
      setResults(null)
      setCheckError('Algo salió mal al comprobar tu reto. Espera un momento y pulsa "Comprobar" otra vez.')
    } finally {
      if (latest()) setChecking(false)
    }
  }

  function createFile(path) {
    sandpack.addFile(path, '')
    sandpack.setActiveFile(path)
  }

  function deleteFile(path) {
    if (path === '/src/main.jsx') return
    if (sandpack.activeFile === path) sandpack.setActiveFile(paths.find((p) => p !== path) ?? '/src/main.jsx')
    sandpack.deleteFile(path)
  }

  const showSlowWarning = slow && !previewLoaded

  return (
    <>
      <section aria-label="Editor" className="flex min-w-0 flex-col gap-3">
        <FileTabsBar
          paths={paths}
          activeFile={sandpack.activeFile}
          onSelect={(p) => sandpack.setActiveFile(p)}
          onCreate={createFile}
          onDelete={deleteFile}
        />
        <div className="flex justify-end">
          <AutocompleteToggle enabled={autocomplete} onToggle={toggleAutocomplete} />
        </div>
        <div className="h-[55vh] min-h-72 overflow-hidden rounded-lg border border-slate-700 lg:h-[60vh]">
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers
            extensions={extensions}
            style={{ height: '100%' }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={check}
            disabled={checking}
            className={`${button} bg-emerald-500 text-slate-950 hover:bg-emerald-400`}
          >
            {checking ? 'Comprobando…' : 'Comprobar'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming('solution')}
            className={`${button} bg-slate-700 text-slate-100 hover:bg-slate-600`}
          >
            Ver solución
          </button>
          <button
            type="button"
            onClick={() => setConfirming('reset')}
            className={`${button} bg-slate-700 text-slate-100 hover:bg-slate-600`}
          >
            Reiniciar reto
          </button>
          {canCleanStart && (
            <button
              type="button"
              onClick={() => setConfirming('clean')}
              className={`${button} bg-slate-700 text-slate-100 hover:bg-slate-600`}
            >
              Empezar desde versión limpia
            </button>
          )}
        </div>
        {confirming && (
          <div role="alertdialog" aria-label="Confirmar" className="flex flex-col gap-3 rounded-lg border border-amber-500/60 bg-slate-800 p-4">
            <p>{CONFIRMS[confirming].text}</p>
            <div className="flex gap-2">
              <button type="button" onClick={confirm} className={`${button} bg-amber-500 text-slate-950 hover:bg-amber-400`}>
                {CONFIRMS[confirming].yes}
              </button>
              <button type="button" onClick={() => setConfirming(null)} className={`${button} text-slate-200 hover:bg-slate-700`}>
                Cancelar
              </button>
            </div>
          </div>
        )}
        <HintBox hints={challenge.hints ?? []} shown={hintsShown} onReveal={onRevealHint} />
      </section>

      <section aria-label="Vista previa" className="flex min-w-0 flex-col gap-3">
        <div
          ref={previewBoxRef}
          className="preview-surface relative h-[45vh] min-h-64 overflow-hidden rounded-lg border border-slate-700 bg-white lg:h-[50vh]"
        >
          <SandpackPreview
            ref={previewRef}
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{ height: '100%' }}
          />
          {!previewLoaded && (
            <p className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-300">
              Preparando la vista previa…
            </p>
          )}
        </div>
        {showSlowWarning && (
          <p role="status" className="rounded-lg border border-orange-500/60 bg-orange-950/50 p-3 text-orange-100">
            La vista previa está tardando en cargar. Necesitas internet para ver el resultado: revisa tu conexión y
            pulsa el botón de recargar de la vista previa.
          </p>
        )}
        {celebration && (
          <Celebration xp={celebration.xp}>
            {nextChallenge ? (
              <Link
                to={`/reto/${nextChallenge.id}`}
                className={`${button} self-start bg-emerald-500 text-slate-950 hover:bg-emerald-400`}
              >
                Siguiente reto
              </Link>
            ) : (
              <Link to="/" className={`${button} self-start bg-emerald-500 text-slate-950 hover:bg-emerald-400`}>
                Volver al mapa del curso
              </Link>
            )}
          </Celebration>
        )}
        {checkError && (
          <p role="alert" className="rounded-lg border border-orange-500/60 bg-orange-950/50 p-3 text-orange-100">
            {checkError}
          </p>
        )}
        <CheckPanel
          checks={challenge.checks}
          results={results}
          manualDone={manualDone}
          onToggleManual={(index, done) => setManualDone((m) => ({ ...m, [index]: done }))}
        />
      </section>
    </>
  )
}
