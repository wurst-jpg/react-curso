import { Link, useParams } from 'react-router'
import course from '../content/course.js'
import { moduleStats } from '../progress/progress.js'
import { useProgress } from '../progress/ProgressContext.jsx'

const linkClass = 'font-semibold text-amber-300 underline hover:text-amber-200'

function ChallengeRow({ challenge, state }) {
  const icon = state === 'done' ? '✅' : '▶'
  const label = state === 'done' ? 'Hecho' : 'Disponible'
  const inner = (
    <>
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1 font-semibold">{challenge.title}</span>
      <span className="text-sm">{label}</span>
    </>
  )
  const base = 'flex items-center gap-3 rounded-xl border px-4 py-3'
  return (
    <li>
      <Link
        to={`/reto/${challenge.id}`}
        className={`${base} transition hover:bg-slate-700 motion-reduce:transition-none ${
          state === 'done' ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-100' : 'border-amber-400/70 bg-slate-800 text-slate-50'
        }`}
      >
        {inner}
      </Link>
    </li>
  )
}

export default function ModulePage() {
  const { moduleId } = useParams()
  const { progress } = useProgress()
  const module = course.find((m) => m.id === moduleId)

  if (!module) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8 text-slate-100">
        <p>No encontramos ese módulo.</p>
        <Link to="/" className={linkClass}>
          Volver al mapa del curso
        </Link>
      </main>
    )
  }

  const { done, total } = moduleStats(progress, module)
  const stateOf = (c) => (progress.completed[c.id] ? 'done' : 'open')

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 text-slate-100">
      <Link to="/" className={linkClass}>
        ← Volver al mapa del curso
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{module.title}</h1>
        <p className="text-slate-300">{module.summary}</p>
        <p className="font-semibold text-slate-200">{`${done} de ${total} retos`}</p>
      </div>
      {module.lessons.map((lesson) => (
        <section key={lesson.id} className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-bold">{lesson.title}</h2>
          <ul className="flex flex-col gap-2">
            {lesson.challenges.map((c) => (
              <ChallengeRow key={c.id} challenge={c} state={stateOf(c)} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
