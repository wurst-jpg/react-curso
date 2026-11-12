import { getTailwindClasses, tailwindSource } from '../../src/autocomplete/tailwindCompletions.js'
import { complete, labels } from './helpers.js'

describe('tailwindSource', () => {
  it('dentro de className="bg-bl sugiere bg-blue-500', async () => {
    const result = await complete(tailwindSource, '<div className="bg-bl|"></div>')
    expect(labels(result)).toContain('bg-blue-500')
  })

  it('funciona con className={\'...\'} y con plantillas', async () => {
    expect(labels(await complete(tailwindSource, "<div className={'bg-bl|'}>"))).toContain('bg-blue-500')
    expect(labels(await complete(tailwindSource, '<div className={`bg-bl|`}>'))).toContain('bg-blue-500')
  })

  it('sugiere la clase de la palabra actual aunque haya otras antes', async () => {
    const result = await complete(tailwindSource, '<div className="flex p-4 bg-re|">')
    expect(labels(result)).toContain('bg-red-500')
    expect(result.from).toBe('<div className="flex p-4 '.length)
  })

  it('fuera de className no sugiere clases', async () => {
    expect(await complete(tailwindSource, 'const bg-bl|')).toBeNull()
    expect(await complete(tailwindSource, '<div id="bg-bl|">')).toBeNull()
    expect(await complete(tailwindSource, '<div className="flex">bg-bl|</div>')).toBeNull()
  })

  it('el valor de className ya cerrado no cuenta', async () => {
    expect(await complete(tailwindSource, '<div className="flex" bg-bl|>')).toBeNull()
  })

  it('con el interruptor desactivado no sugiere nada', async () => {
    const { createTailwindSource } = await import('../../src/autocomplete/tailwindCompletions.js')
    expect(await complete(createTailwindSource(() => false), '<div className="bg-bl|">')).toBeNull()
  })

  it('la lista generada cubre todas las categorías pedidas', () => {
    const all = getTailwindClasses()
    const set = new Set(all.map((c) => c.label))
    for (const c of [
      'bg-slate-50', 'text-rose-950', 'border-emerald-600', 'bg-white', 'text-black', 'hover:bg-blue-500',
      'p-0', 'px-12', 'py-64', 'mt-24', 'gap-48', 'w-full', 'h-screen', 'w-auto', 'ml-auto',
      'text-xs', 'text-6xl', 'font-light', 'font-semibold', 'text-center',
      'flex', 'grid', 'block', 'hidden', 'flex-col', 'flex-row', 'items-center', 'justify-between', 'grid-cols-1', 'grid-cols-12',
      'rounded', 'rounded-sm', 'rounded-3xl', 'rounded-full', 'border', 'border-2', 'border-4',
      'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl',
    ]) {
      expect(set.has(c), c).toBe(true)
    }
    expect(set.size).toBe(all.length)
    expect(getTailwindClasses()).toBe(all)
  })
})
