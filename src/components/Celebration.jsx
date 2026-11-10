// Versión mínima: la Tarea 9 la pule.
export default function Celebration({ xp, children }) {
  return (
    <section
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-emerald-500 bg-emerald-950/60 p-5 text-emerald-100"
    >
      <p className="text-2xl font-bold">¡Reto superado!</p>
      <p>{xp > 0 ? `Ganaste ${xp} XP.` : 'Ya habías superado este reto antes, así que no suma XP nueva.'}</p>
      {children}
    </section>
  )
}
