import { useState } from 'react'
import Markdown from 'react-markdown'

const markdownComponents = {
  p: (props) => <p className="my-3 leading-relaxed" {...props} />,
  ul: (props) => <ul className="my-3 list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />,
  strong: (props) => <strong className="font-semibold text-amber-200" {...props} />,
  code: (props) => (
    <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[0.9em] text-sky-200" {...props} />
  ),
  a: (props) => <a className="text-sky-300 underline" target="_blank" rel="noreferrer" {...props} />,
}

function Text({ children }) {
  return <Markdown components={markdownComponents}>{children}</Markdown>
}

const TABS = [
  { id: 'reto', label: 'Reto' },
  { id: 'leccion', label: 'Lección' },
]

function InstructionsTabs({ lesson, challenge }) {
  const [active, setActive] = useState('reto')

  function onKeyDown(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const step = event.key === 'ArrowRight' ? 1 : -1
    const index = TABS.findIndex((t) => t.id === active)
    const next = TABS[(index + step + TABS.length) % TABS.length]
    setActive(next.id)
    document.getElementById(`tab-${next.id}`)?.focus()
  }

  return (
    <section
      aria-label="Instrucciones"
      className="flex min-h-0 flex-col gap-3 rounded-xl bg-slate-800/60 p-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start"
    >
      <div role="tablist" aria-label="Instrucciones" onKeyDown={onKeyDown} className="flex gap-1 border-b border-slate-700">
        {TABS.map((tab) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`rounded-t-md border-b-2 px-4 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-400 ${
                selected
                  ? 'border-sky-400 bg-slate-800 text-white'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`panel-${active}`}
        aria-labelledby={`tab-${active}`}
        className="min-h-0 flex-1 overflow-y-auto pr-1"
      >
        {active === 'reto' ? (
          <div className="rounded-lg border border-sky-700/60 bg-sky-950/40 p-4">
            <h2 className="text-sm font-semibold tracking-wide text-sky-300 uppercase">Tu reto</h2>
            <div className="text-slate-100">
              <Text>{challenge.instructions}</Text>
            </div>
            <button
              type="button"
              onClick={() => setActive('leccion')}
              className="mt-2 text-sm text-sky-300 underline hover:text-sky-200 focus-visible:outline-2 focus-visible:outline-sky-400"
            >
              ¿Necesitas repasar? Abre la pestaña Lección
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">Lo que vas a aprender</h2>
            <h3 className="mt-1 text-lg font-semibold text-slate-100">{lesson.title}</h3>
            <div className="text-slate-300">
              <Text>{lesson.explanation}</Text>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Instructions({ lesson, challenge }) {
  // `key`: al cambiar de reto se vuelve a la pestaña "Reto".
  return <InstructionsTabs key={challenge.id} lesson={lesson} challenge={challenge} />
}
