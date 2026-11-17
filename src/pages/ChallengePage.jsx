import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { SandpackProvider } from '@codesandbox/sandpack-react'
import course, { findChallenge, flattenChallenges } from '../content/course.js'
import { useProgress } from '../progress/ProgressContext.jsx'
import { cleanStartFiles, clearCode, initialFiles } from '../progress/code.js'
import { buildSandboxSetup } from '../sandbox/buildSandbox.js'
import Instructions from '../components/Instructions.jsx'
import Workspace from '../components/Workspace.jsx'

const linkClass = 'text-sky-300 underline hover:text-sky-200'

function Notice({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-8 text-slate-100">
      <div className="flex max-w-md flex-col gap-4 rounded-xl bg-slate-800 p-6 text-center">{children}</div>
    </main>
  )
}

function ChallengeView({ entry, nextChallenge }) {
  const { challenge, lesson, module } = entry
  const { recordHint } = useProgress()
  const [startFiles, setStartFiles] = useState(() => initialFiles(course, challenge.id))
  const [session, setSession] = useState(0)
  const [hintsShown, setHintsShown] = useState(0)

  const setup = useMemo(
    () => buildSandboxSetup(startFiles, challenge.dependencies),
    [startFiles, challenge.dependencies],
  )
  const activeFile = startFiles[challenge.activeFile] !== undefined ? challenge.activeFile : '/src/main.jsx'

  function revealHint() {
    if (hintsShown >= (challenge.hints?.length ?? 0)) return
    setHintsShown((n) => n + 1)
    recordHint(challenge.id)
  }

  function restart(kind, files) {
    if (kind === 'solution') {
      setStartFiles(files)
    } else {
      clearCode(challenge.id)
      setStartFiles(kind === 'clean' ? cleanStartFiles(course, challenge.id) : initialFiles(course, challenge.id))
    }
    setSession((s) => s + 1)
  }

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-slate-900 p-4 text-slate-100 lg:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm text-slate-400">
            {module.title} · {lesson.title}
          </p>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
        </div>
        <Link to="/" className={linkClass}>
          Mapa del curso
        </Link>
      </header>
      <SandpackProvider
        key={session}
        template="react"
        theme="dark"
        files={setup.files}
        customSetup={setup.customSetup}
        options={{ ...setup.options, activeFile }}
      >
        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.2fr)]">
          <Instructions lesson={lesson} challenge={challenge} />
          <Workspace
            challenge={challenge}
            nextChallenge={nextChallenge}
            hintsShown={hintsShown}
            onRevealHint={revealHint}
            onRestart={restart}
            canCleanStart={challenge.startFrom === 'previous'}
            getCleanStart={() => cleanStartFiles(course, challenge.id)}
          />
        </div>
      </SandpackProvider>
    </main>
  )
}

export default function ChallengePage() {
  const { challengeId } = useParams()
  const entry = findChallenge(course, challengeId)

  if (!entry) {
    return (
      <Notice>
        <p>No encontré ese reto.</p>
        <Link to="/" className={linkClass}>
          Volver al mapa del curso
        </Link>
      </Notice>
    )
  }

  const nextChallenge = flattenChallenges(course)[entry.index + 1]?.challenge ?? null
  // `key`: al cambiar de reto se empieza con estado nuevo (pistas, archivos, resultados).
  return <ChallengeView key={challengeId} entry={entry} nextChallenge={nextChallenge} />
}
