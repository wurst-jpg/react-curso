import { useState } from 'react'
import { normalizeNewPath } from '../sandbox/editorFiles.js'

const PROTECTED = '/src/main.jsx'
const shortName = (path) => path.replace(/^\/src\//, '')

const smallButton =
  'rounded-md px-3 py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-400'

export default function FileTabsBar({ paths, activeFile, onSelect, onCreate, onDelete }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  function closeForm() {
    setCreating(false)
    setName('')
    setError(null)
  }

  function submit(event) {
    event.preventDefault()
    const result = normalizeNewPath(name, paths)
    if (result.error) {
      setError(result.error)
      return
    }
    onCreate(result.path)
    closeForm()
  }

  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="Archivos" className="flex flex-wrap items-center gap-1">
        {paths.map((path) => {
          const active = path === activeFile
          return (
            <span
              key={path}
              className={`flex items-center rounded-t-md border-b-2 ${
                active ? 'border-sky-400 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(path)}
                className="px-3 py-1.5 font-mono text-sm"
              >
                {shortName(path)}
              </button>
              {path !== PROTECTED && (
                <button
                  type="button"
                  aria-label={`Borrar ${shortName(path)}`}
                  title={`Borrar ${shortName(path)}`}
                  onClick={() => setToDelete(path)}
                  className="mr-1 rounded px-1.5 text-slate-500 hover:bg-rose-900/60 hover:text-rose-100"
                >
                  ×
                </button>
              )}
            </span>
          )
        })}
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={`${smallButton} ml-1 border border-dashed border-slate-500 text-slate-300 hover:border-sky-400 hover:text-sky-200`}
          >
            Nuevo archivo
          </button>
        )}
      </nav>

      {creating && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800 p-3">
          <label htmlFor="nuevo-archivo" className="text-sm text-slate-300">
            Nombre del archivo
          </label>
          <input
            id="nuevo-archivo"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Saludo.jsx"
            className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 font-mono text-sm text-slate-100"
          />
          <button type="submit" className={`${smallButton} bg-sky-600 text-white hover:bg-sky-500`}>
            Crear
          </button>
          <button type="button" onClick={closeForm} className={`${smallButton} text-slate-300 hover:bg-slate-700`}>
            Cancelar
          </button>
          {error && (
            <p role="alert" className="w-full text-sm text-rose-300">
              {error}
            </p>
          )}
        </form>
      )}

      {toDelete && (
        <div role="alertdialog" aria-label="Confirmar borrado" className="flex flex-wrap items-center gap-2 rounded-lg bg-rose-950/60 p-3">
          <p className="text-sm text-rose-100">
            ¿Borrar <span className="font-mono">{shortName(toDelete)}</span>? Lo que escribiste en él se perderá.
          </p>
          <button
            type="button"
            onClick={() => {
              onDelete(toDelete)
              setToDelete(null)
            }}
            className={`${smallButton} bg-rose-600 text-white hover:bg-rose-500`}
          >
            Sí, borrar
          </button>
          <button type="button" onClick={() => setToDelete(null)} className={`${smallButton} text-slate-300 hover:bg-slate-700`}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
