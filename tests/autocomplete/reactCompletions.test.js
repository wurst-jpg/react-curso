import { reactSource } from '../../src/autocomplete/reactCompletions.js'
import { complete, labels } from './helpers.js'

describe('reactSource', () => {
  it('useS sugiere useState con descripción en español', async () => {
    const result = await complete(reactSource, 'const x = useS|')
    expect(labels(result)).toContain('useState')
    const option = result.options.find((o) => o.label === 'useState' && o.type !== 'snippet')
    expect(option.detail).toBe('Guarda un valor que puede cambiar')
  })

  it('incluye las palabras de React pedidas', async () => {
    const result = await complete(reactSource, 'u|', true)
    const all = labels(await complete(reactSource, '|', true))
    for (const w of ['useState', 'useEffect', 'useRef', 'useContext', 'useMemo', 'useCallback', 'import', 'export default', 'return', 'className', 'onClick', 'onChange', 'onSubmit']) {
      expect(all).toContain(w)
    }
    expect(result).not.toBeNull()
  })

  it('comp ofrece la plantilla de componente', async () => {
    const result = await complete(reactSource, 'comp|')
    const option = result.options.find((o) => o.label === 'comp')
    expect(option).toBeTruthy()
    expect(typeof option.apply).toBe('function')
  })

  it('ofrece las plantillas imp, map, useState y useEffect', async () => {
    for (const label of ['imp', 'map']) {
      const result = await complete(reactSource, `${label}|`)
      expect(labels(result)).toContain(label)
    }
    const hooks = await complete(reactSource, 'useEff|')
    expect(hooks.options.some((o) => o.label === 'useEffect' && o.type === 'snippet')).toBe(true)
  })

  it('no sugiere nada si no se está escribiendo una palabra', async () => {
    expect(await complete(reactSource, 'const x = |')).toBeNull()
  })

  it('no sugiere dentro de className="..."', async () => {
    expect(await complete(reactSource, '<div className="useS|"')).toBeNull()
  })

  it('con el interruptor desactivado no sugiere nada', async () => {
    const off = (await import('../../src/autocomplete/reactCompletions.js')).createReactSource(() => false)
    expect(await complete(off, 'useS|')).toBeNull()
  })
})
