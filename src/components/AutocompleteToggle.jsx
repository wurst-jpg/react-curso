export default function AutocompleteToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onToggle}
      className={`rounded-md border px-3 py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
        enabled
          ? 'border-sky-500 bg-sky-950 text-sky-100 hover:bg-sky-900'
          : 'border-slate-600 text-slate-300 hover:bg-slate-700'
      }`}
    >
      Autocompletar: {enabled ? 'activado' : 'desactivado'}
    </button>
  )
}
