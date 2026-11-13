const STATUS = {
  pass: { icon: '✓', text: 'Bien', className: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-100' },
  fail: { icon: '✗', text: 'Todavía no', className: 'border-rose-600/60 bg-rose-950/40 text-rose-100' },
  error: { icon: '!', text: 'No se pudo comprobar', className: 'border-orange-600/60 bg-orange-950/40 text-orange-100' },
  'manual-pending': { icon: '○', text: 'Márcalo cuando lo hayas hecho', className: 'border-slate-600 bg-slate-800 text-slate-200' },
  'manual-done': { icon: '✓', text: 'Hecho', className: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-100' },
}

export default function CheckPanel({ checks, results, manualDone, onToggleManual }) {
  const manual = checks.map((check, index) => ({ check, index })).filter(({ check }) => check.type === 'manual')
  return (
    <section aria-label="Comprobaciones" className="flex flex-col gap-3">
      {manual.length > 0 && (
        <fieldset className="flex flex-col gap-2 rounded-lg border border-slate-700 p-3">
          <legend className="px-1 text-sm text-slate-400">Esto lo compruebas tú</legend>
          {manual.map(({ check, index }) => (
            <label key={index} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(manualDone[index])}
                onChange={(e) => onToggleManual(index, e.target.checked)}
              />
              {check.label}
            </label>
          ))}
        </fieldset>
      )}
      {results && (
        <ul data-results className="flex flex-col gap-2">
          {results.map((r) => {
            const s = STATUS[r.status] ?? STATUS.error
            return (
              <li key={r.index} className={`rounded-lg border p-3 ${s.className}`}>
                <p className="font-semibold">
                  <span aria-hidden="true">{s.icon} </span>
                  {r.label}
                  <span className="sr-only"> — {s.text}</span>
                </p>
                {r.message && <p className="mt-1 text-sm opacity-90">{r.message}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
