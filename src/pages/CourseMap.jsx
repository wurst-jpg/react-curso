import { useState } from 'react'
import { Link } from 'react-router'
import course from '../content/course.js'
import { achievements, moduleStats } from '../progress/progress.js'
import { useProgress } from '../progress/ProgressContext.jsx'

const card = 'flex flex-col gap-3 rounded-2xl border p-5'

function ModuleCard({ module, index, stats }) {
  const { done, total, unlocked } = stats
  const pct = total ? Math.round((done / total) * 100) : 0
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Módulo {index}</p>
          <h3 className="text-xl font-bold text-slate-50">{module.title}</h3>
        </div>
        <span aria-hidden="true" className="text-2xl">
          {unlocked ? (done === total ? '🏆' : '▶') : '🔒'}
        </span>
      </div>
      <p className="text-sm text-slate-300">{module.summary}</p>
      <div
        role="progressbar"
        aria-label={`Avance de ${module.title}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="h-2.5 overflow-hidden rounded-full bg-slate-700"
      >
        <div
          className="h-full rounded-full bg-emerald-400 transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm font-semibold text-slate-200">{`${done} de ${total} retos`}</p>
      {!unlocked && <p className="text-sm text-slate-300">Bloqueado: termina el módulo anterior para abrirlo.</p>}
    </>
  )
  if (!unlocked) {
    return <li className={`${card} border-slate-700 bg-slate-800/50 opacity-70`}>{body}</li>
  }
  return (
    <li>
      <Link
        to={`/modulo/${module.id}`}
        className={`${card} h-full border-amber-400/60 bg-slate-800 transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-slate-700 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
      >
        {body}
      </Link>
    </li>
  )
}

function ResetBox() {
  const { resetAll } = useProgress()
  const [asking, setAsking] = useState(false)

  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="self-start rounded-lg border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-950"
      >
        Reiniciar todo mi progreso
      </button>
    )
  }
  return (
    <div role="alertdialog" aria-label="Confirmar reinicio" className="flex flex-col gap-3 rounded-xl border border-rose-400 bg-rose-950/60 p-4">
      <p className="text-rose-100">
        Se borrarán tus XP, tus logros y el código que guardaste en cada reto. No se puede deshacer. ¿Seguro?
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            resetAll()
            setAsking(false)
          }}
          className="rounded-lg bg-rose-500 px-4 py-2 font-semibold text-white hover:bg-rose-400"
        >
          Sí, borrar todo
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="rounded-lg border border-slate-400 px-4 py-2 font-semibold text-slate-100 hover:bg-slate-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function CourseMap() {
  const { progress } = useProgress()
  const unlockedBadges = achievements(progress, course)

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 text-slate-100">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Curso de React</h1>
        <p className="text-slate-300">
          Elige un módulo y resuelve sus retos. Cada reto superado te da XP; los módulos se abren de uno en uno.
        </p>
      </div>

      <section aria-labelledby="mapa-titulo" className="flex flex-col gap-4">
        <h2 id="mapa-titulo" className="text-2xl font-bold">
          Mapa del curso
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {course.map((module, i) => (
            <ModuleCard key={module.id} module={module} index={i} stats={moduleStats(progress, module, course)} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="logros-titulo" className="flex flex-col gap-4">
        <h2 id="logros-titulo" className="text-2xl font-bold">
          Tus logros
        </h2>
        {unlockedBadges.length === 0 ? (
          <p className="text-slate-300">Aún no tienes logros. Supera tu primer reto para ganar el primero.</p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {unlockedBadges.map((a) => (
              <li
                key={a.id}
                className="rounded-full border border-amber-300 bg-amber-400/15 px-4 py-2 font-semibold text-amber-200"
              >
                <span aria-hidden="true">🏅 </span>
                {a.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="reinicio-titulo" className="flex flex-col gap-3 border-t border-slate-700 pt-6">
        <h2 id="reinicio-titulo" className="text-lg font-bold">
          Empezar de cero
        </h2>
        <ResetBox />
      </section>
    </main>
  )
}
