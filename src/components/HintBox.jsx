export default function HintBox({ hints, shown, onReveal }) {
  const remaining = hints.length - shown
  return (
    <section aria-label="Pistas" className="flex flex-col gap-2">
      {shown > 0 && (
        <ol className="flex flex-col gap-2">
          {hints.slice(0, shown).map((hint, i) => (
            <li key={i} className="rounded-lg border border-amber-600/50 bg-amber-950/40 p-3 text-amber-100">
              <span className="font-semibold">Pista {i + 1}:</span> {hint}
            </li>
          ))}
        </ol>
      )}
      {hints.length > 0 && (
        <button
          type="button"
          onClick={onReveal}
          disabled={remaining === 0}
          className="self-start rounded-lg bg-amber-600 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {remaining === 0 ? 'No hay más pistas' : 'Pista'}
        </button>
      )}
    </section>
  )
}
