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

export default function Instructions({ lesson, challenge }) {
  return (
    <section aria-label="Instrucciones" className="flex flex-col gap-6 overflow-y-auto rounded-xl bg-slate-800/60 p-5">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Lo que vas a aprender</h2>
        <h3 className="mt-1 text-lg font-semibold text-slate-100">{lesson.title}</h3>
        <div className="text-slate-300">
          <Text>{lesson.explanation}</Text>
        </div>
      </div>
      <div className="rounded-lg border border-sky-700/60 bg-sky-950/40 p-4">
        <h2 className="text-sm font-semibold tracking-wide text-sky-300 uppercase">Tu reto</h2>
        <div className="text-slate-100">
          <Text>{challenge.instructions}</Text>
        </div>
      </div>
    </section>
  )
}
