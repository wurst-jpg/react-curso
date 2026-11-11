const confetti = ['🎉', '⭐', '✨', '🎊', '⭐', '✨']

export default function Celebration({ xp, children }) {
  return (
    <section
      role="status"
      className="celebration relative flex flex-col gap-3 overflow-hidden rounded-xl border border-emerald-400 bg-gradient-to-br from-emerald-950 to-slate-900 p-5 text-emerald-100 shadow-lg shadow-emerald-500/20"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-around text-xl">
        {confetti.map((c, i) => (
          <span key={i} className="celebration-confetti" style={{ animationDelay: `${i * 120}ms` }}>
            {c}
          </span>
        ))}
      </div>
      <p className="text-2xl font-bold text-emerald-300">¡Reto superado!</p>
      <p>
        {xp > 0 ? (
          <>
            Ganaste <span className="celebration-xp inline-block rounded-full bg-amber-400 px-2 py-0.5 font-bold text-slate-950">{xp} XP</span>.
          </>
        ) : (
          'Ya habías superado este reto antes, así que no suma XP nueva.'
        )}
      </p>
      {children}
    </section>
  )
}
