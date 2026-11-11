import { Link } from 'react-router'
import { useProgress } from '../progress/ProgressContext.jsx'

export const XP_PER_LEVEL = 100

export default function XpBar() {
  const { progress } = useProgress()
  const xp = progress.xp
  const level = 1 + Math.floor(xp / XP_PER_LEVEL)
  const inLevel = xp % XP_PER_LEVEL

  return (
    <header className="sticky top-0 z-10 border-b border-slate-700 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link to="/" className="shrink-0 font-bold text-slate-100 hover:text-amber-300">
          Curso de React
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3">
          <span className="rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-slate-950">
            Nivel {level}
          </span>
          <div className="flex w-full max-w-60 flex-col gap-1">
            <div
              role="progressbar"
              aria-label="Avance hacia el siguiente nivel"
              aria-valuemin={0}
              aria-valuemax={XP_PER_LEVEL}
              aria-valuenow={inLevel}
              className="h-2.5 overflow-hidden rounded-full bg-slate-700"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${inLevel}%` }}
              />
            </div>
            <p className="flex justify-between gap-2 text-xs text-slate-300">
              <span className="font-bold text-amber-300">{`${xp} XP`}</span>
              <span>{`Faltan ${XP_PER_LEVEL - inLevel} para el nivel ${level + 1}`}</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
