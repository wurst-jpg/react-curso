import { createElement as h, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { runDomChecks } from '../../src/checks/domRunner.js'
import { normalizeText } from '../../src/checks/normalize.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let root
beforeEach(() => {
  root = document.createElement('div')
  document.body.appendChild(root)
})
afterEach(() => {
  root.remove()
})

// Sin espera por contenido que tarda en aparecer: aquí el DOM ya está listo.
const run = (checks) => runDomChecks(checks, root, { settleMs: 0 })

describe('text', () => {
  it('pasa ignorando mayúsculas, acentos y espacios', async () => {
    root.innerHTML = '<p>¡hola,   REACT!</p>'
    const [r] = await run([{ type: 'text', label: 'Saludo', match: '¡Hola, React!' }])
    expect(r).toMatchObject({ index: 0, label: 'Saludo', status: 'pass' })
  })
  it('falla con mensaje amable', async () => {
    root.innerHTML = '<p>adiós</p>'
    const [r] = await run([{ type: 'text', label: 'x', match: '¡Hola, React!' }])
    expect(r.status).toBe('fail')
    expect(r.message).toBe('No encontré el texto "¡Hola, React!" en tu página.')
  })
})

describe('text ignora código', () => {
  it('un texto solo dentro de script/style no cuenta', async () => {
    root.innerHTML = '<p>hola</p><script>var secreto = "xyzscript"</script><style>.xyzstyle{}</style>'
    const res = await run([
      { type: 'text', label: 'a', match: 'xyzscript' },
      { type: 'text', label: 'b', match: 'xyzstyle' },
      { type: 'text', label: 'c', match: 'hola' },
    ])
    expect(res.map((r) => r.status)).toEqual(['fail', 'fail', 'pass'])
  })
})

describe('role', () => {
  it('button por <button> y por [role=button], con name', async () => {
    root.innerHTML = '<button>Sumar</button><div role="button" aria-label="Restar"></div>'
    const res = await run([
      { type: 'role', label: 'a', role: 'button', name: 'sumar' },
      { type: 'role', label: 'b', role: 'button', name: 'RESTAR' },
      { type: 'role', label: 'c', role: 'button', min: 2 },
      { type: 'role', label: 'd', role: 'button', name: 'Borrar' },
    ])
    expect(res.map((r) => r.status)).toEqual(['pass', 'pass', 'pass', 'fail'])
    expect(res[3].message).toBe('No encontré un botón que diga "Borrar".')
  })
  it('name contra value', async () => {
    root.innerHTML = '<input type="submit" value="Enviar">'
    const [r] = await run([{ type: 'role', label: 'a', role: 'button', name: 'enviar' }])
    expect(r.status).toBe('pass')
  })
  it('min no alcanzado falla', async () => {
    root.innerHTML = '<button>a</button>'
    const [r] = await run([{ type: 'role', label: 'a', role: 'button', min: 2 }])
    expect(r.status).toBe('fail')
  })
  it('heading = h1-h6', async () => {
    root.innerHTML = '<h1>a</h1><h4>b</h4>'
    const [r] = await run([{ type: 'role', label: 'a', role: 'heading', min: 2 }])
    expect(r.status).toBe('pass')
  })
  it('textbox = input text/email/number/sin type y textarea', async () => {
    root.innerHTML =
      '<input><input type="email"><input type="number"><input type="text"><textarea></textarea><input type="checkbox">'
    const [r, r2] = await run([
      { type: 'role', label: 'a', role: 'textbox', min: 5 },
      { type: 'role', label: 'b', role: 'textbox', min: 6 },
    ])
    expect(r.status).toBe('pass')
    expect(r2.status).toBe('fail')
  })
  it('list, listitem, link, img, form, checkbox', async () => {
    root.innerHTML =
      '<ul><li>a</li></ul><a href="#">l</a><img alt="f" src="x"><form></form><input type="checkbox">'
    const res = await run(
      ['list', 'listitem', 'link', 'img', 'form', 'checkbox'].map((role) => ({
        type: 'role',
        label: role,
        role,
      })),
    )
    expect(res.map((r) => r.status)).toEqual(Array(6).fill('pass'))
  })
})

describe('count y class', () => {
  it('count con min/max', async () => {
    root.innerHTML = '<li></li><li></li><li></li>'
    const res = await run([
      { type: 'count', label: 'a', selector: 'li', min: 3 },
      { type: 'count', label: 'b', selector: 'li', max: 2 },
      { type: 'count', label: 'c', selector: 'li', min: 1, max: 3 },
    ])
    expect(res.map((r) => r.status)).toEqual(['pass', 'fail', 'pass'])
  })
  it('class con pattern', async () => {
    root.innerHTML = '<button class="px-2 bg-blue-500">x</button><p class="foo"></p>'
    const res = await run([
      { type: 'class', label: 'a', selector: 'button', pattern: 'bg-blue-\\d+' },
      { type: 'class', label: 'b', selector: 'p', pattern: 'bg-blue-\\d+' },
    ])
    expect(res.map((r) => r.status)).toEqual(['pass', 'fail'])
  })
})

describe('interaction', () => {
  function Counter() {
    const [n, setN] = useState(0)
    const [t, setT] = useState('')
    return h(
      'div',
      null,
      h('p', null, `Cuenta: ${n}`),
      h('button', { onClick: () => setN(n + 1) }, 'Sumar'),
      h('input', { value: t, onChange: (e) => setT(e.target.value) }),
      h('span', null, `Hola ${t}`),
    )
  }
  async function mount() {
    const r = createRoot(root)
    await act(async () => r.render(h(Counter)))
    return r
  }

  it('click en Sumar y expect text', async () => {
    const r = await mount()
    const [res] = await act(() =>
      run([
        {
          type: 'interaction',
          label: 'sumar',
          steps: [{ action: 'click', role: 'button', name: 'Sumar' }],
          expect: { type: 'text', match: 'Cuenta: 1' },
        },
      ]),
    )
    expect(res.status).toBe('pass')
    await act(async () => r.unmount())
  })

  it('type en input controlado', async () => {
    const r = await mount()
    const [res] = await act(() =>
      run([
        {
          type: 'interaction',
          label: 'escribir',
          steps: [{ action: 'type', role: 'textbox', value: 'Ana' }],
          expect: { type: 'text', match: 'Hola Ana' },
        },
      ]),
    )
    expect(res.status).toBe('pass')
    await act(async () => r.unmount())
  })

  it('falla si el expect no se cumple y si falta el elemento', async () => {
    const r = await mount()
    const res = await act(() =>
      run([
        {
          type: 'interaction',
          label: 'a',
          steps: [{ action: 'click', role: 'button', name: 'Sumar' }],
          expect: { type: 'text', match: 'Cuenta: 9' },
        },
        {
          type: 'interaction',
          label: 'b',
          steps: [{ action: 'click', role: 'button', name: 'Nada' }],
          expect: { type: 'text', match: 'x' },
        },
      ]),
    )
    expect(res.map((x) => x.status)).toEqual(['fail', 'fail'])
    expect(res[1].message).toBe('No encontré un botón que diga "Nada".')
    await act(async () => r.unmount())
  })
})

describe('contenido que tarda en aparecer (datos cargados al montar)', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const later = (ms, html) => setTimeout(() => (root.innerHTML = html), ms)
  const settle = (checks, options) => {
    const promise = runDomChecks(checks, root, options)
    return { promise, after: (ms) => vi.advanceTimersByTimeAsync(ms) }
  }

  it('text/role/count/class pasan si el contenido aparece a los 600 ms', async () => {
    root.innerHTML = '<p>Cargando…</p>'
    later(600, '<h1>Lista</h1><ul><li>a</li><li>b</li></ul><button class="bg-blue-500">Más</button>')
    const { promise, after } = settle([
      { type: 'text', label: 't', match: 'Lista' },
      { type: 'role', label: 'r', role: 'listitem', min: 2 },
      { type: 'count', label: 'c', selector: 'li', min: 2 },
      { type: 'class', label: 'k', selector: 'button', pattern: 'bg-blue-\\d+' },
    ])
    await after(2500)
    expect((await promise).map((r) => r.status)).toEqual(['pass', 'pass', 'pass', 'pass'])
  })

  it('si nunca aparece, falla tras ~2 s con el mensaje normal', async () => {
    root.innerHTML = '<p>Cargando…</p>'
    let settled = null
    const { promise, after } = settle([{ type: 'text', label: 't', match: 'Lista' }])
    promise.then((r) => (settled = r))
    await after(1900)
    expect(settled).toBeNull()
    await after(300)
    expect(settled).toEqual([
      { index: 0, label: 't', status: 'fail', message: 'No encontré el texto "Lista" en tu página.' },
    ])
  })

  it('la espera es compartida: varias comprobaciones fallidas no suman 2 s cada una', async () => {
    root.innerHTML = ''
    let settled = null
    const { promise, after } = settle([
      { type: 'text', label: 'a', match: 'uno' },
      { type: 'text', label: 'b', match: 'dos' },
      { type: 'role', label: 'c', role: 'button' },
    ])
    promise.then((r) => (settled = r))
    await after(2300)
    expect(settled.map((r) => r.status)).toEqual(['fail', 'fail', 'fail'])
  })

  it('una comprobación que lanza error no se reintenta', async () => {
    root.innerHTML = ''
    let settled = null
    const { promise, after } = settle([{ type: 'count', label: 'mal', selector: '###[[' }])
    promise.then((r) => (settled = r))
    await after(150)
    expect(settled?.[0].status).toBe('error')
  })

  it('el expect de una interacción espera a que el resultado del clic aparezca', async () => {
    root.innerHTML = '<button>Cargar</button><p>Nada</p>'
    root.querySelector('button').addEventListener('click', () => later(500, '<button>Cargar</button><p>Listo</p>'))
    const { promise, after } = settle([
      {
        type: 'interaction',
        label: 'i',
        steps: [{ action: 'click', role: 'button', name: 'Cargar' }],
        expect: { type: 'text', match: 'Listo' },
      },
    ])
    await after(3000)
    expect((await promise)[0].status).toBe('pass')
  })

  it('el botón de una interacción también puede tardar en aparecer', async () => {
    root.innerHTML = '<p>Cargando…</p>'
    later(400, '<button>Ok</button><p>Ok pulsado</p>')
    const { promise, after } = settle([
      {
        type: 'interaction',
        label: 'i',
        steps: [{ action: 'click', role: 'button', name: 'Ok' }],
        expect: { type: 'text', match: 'Ok pulsado' },
      },
    ])
    await after(3000)
    expect((await promise)[0].status).toBe('pass')
  })
})

describe('presupuesto de tiempo acotado', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())
  const later = (ms, html) => setTimeout(() => (root.innerHTML = html), ms)
  const start = (checks, options) => {
    let settled = null
    runDomChecks(checks, root, options).then((r) => (settled = r))
    return () => settled
  }
  const click = { action: 'click', role: 'button', name: 'Ok' }

  it('los pasos y el expect de una interacción comparten UN plazo (no uno por paso)', async () => {
    root.innerHTML = '<p>Cargando…</p>'
    later(1500, '<button>Ok</button><p>nada</p>')
    const result = start([{ type: 'interaction', label: 'i', steps: [click, click, click], expect: { type: 'text', match: 'Listo' } }])
    await vi.advanceTimersByTimeAsync(2400)
    expect(result()).not.toBeNull()
    expect(result()[0]).toMatchObject({ status: 'fail', message: 'Hice lo que se pide, pero no encontré el texto "Listo" en tu página.' })
  })

  it('toda la tanda se corta a `totalMs`: lo que queda se evalúa una vez sin reintentos', async () => {
    root.innerHTML = ''
    const many = Array.from({ length: 6 }, (_, i) => ({
      type: 'interaction',
      label: `i${i}`,
      steps: [click],
      expect: { type: 'text', match: 'x' },
    }))
    const result = start([...many, { type: 'text', label: 't', match: 'y' }], { settleMs: 2000, totalMs: 3000 })
    await vi.advanceTimersByTimeAsync(3300)
    expect(result()).not.toBeNull()
    expect(result().map((r) => r.status)).toEqual(['fail', 'fail', 'fail', 'fail', 'fail', 'fail', 'fail'])
  })

  it('con los valores por defecto, 5 interacciones con 13 pasos fallidos terminan en menos de 11 s', async () => {
    root.innerHTML = ''
    const inter = (n) => ({ type: 'interaction', label: 'i', steps: Array(n).fill(click), expect: { type: 'text', match: 'x' } })
    const result = start([inter(3), inter(3), inter(3), inter(2), inter(2)])
    await vi.advanceTimersByTimeAsync(11000)
    expect(result()).not.toBeNull()
    expect(result()).toHaveLength(5)
  })

  it('reintentar el expect de una interacción nunca vuelve a hacer clic', async () => {
    root.innerHTML = '<button>Ok</button><p>nada</p>'
    const onClick = vi.fn()
    root.querySelector('button').addEventListener('click', onClick)
    const result = start([{ type: 'interaction', label: 'i', steps: [click], expect: { type: 'text', match: 'Listo' } }])
    await vi.advanceTimersByTimeAsync(3000)
    expect(result()[0].status).toBe('fail')
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('message del autor', () => {
  it('al fallar se muestra el mensaje del autor en vez del genérico (text, role, count, class, interaction)', async () => {
    root.innerHTML = '<p>adiós</p>'
    const res = await run([
      { type: 'text', label: 'a', match: 'hola', message: 'Pon un saludo.' },
      { type: 'role', label: 'b', role: 'button', name: 'Sumar', message: 'Falta el botón Sumar.' },
      { type: 'count', label: 'c', selector: 'li', min: 3, message: 'Pon tres elementos.' },
      { type: 'class', label: 'd', selector: 'p', pattern: 'text-red', message: 'Píntalo de rojo.' },
      {
        type: 'interaction',
        label: 'e',
        steps: [{ action: 'click', role: 'button', name: 'Sumar' }],
        expect: { type: 'text', match: 'x' },
        message: 'El botón debe sumar.',
      },
    ])
    expect(res.map((r) => r.status)).toEqual(['fail', 'fail', 'fail', 'fail', 'fail'])
    expect(res.map((r) => r.message)).toEqual([
      'Pon un saludo.',
      'Falta el botón Sumar.',
      'Pon tres elementos.',
      'Píntalo de rojo.',
      'El botón debe sumar.',
    ])
  })
  it('sin message se mantiene el genérico; al pasar no hay mensaje; un error no usa el del autor', async () => {
    root.innerHTML = '<p>hola</p>'
    const res = await run([
      { type: 'text', label: 'a', match: 'adiós' },
      { type: 'text', label: 'b', match: 'hola', message: 'Pon un saludo.' },
      { type: 'count', label: 'c', selector: '###[[', message: 'Pon tres elementos.' },
    ])
    expect(res[0]).toMatchObject({ status: 'fail', message: 'No encontré el texto "adiós" en tu página.' })
    expect(res[1]).toEqual({ index: 1, label: 'b', status: 'pass' })
    expect(res[2].status).toBe('error')
    expect(res[2].message).not.toBe('Pon tres elementos.')
  })
})

describe('robustez', () => {
  it('una excepción da status error sin cortar los demás', async () => {
    root.innerHTML = '<p>hola</p>'
    const res = await run([
      { type: 'count', label: 'mal', selector: '###[[' },
      { type: 'text', label: 'bien', match: 'hola' },
      { type: 'desconocido', label: 'raro' },
    ])
    expect(res[0].status).toBe('error')
    expect(res[0].index).toBe(0)
    expect(res[1]).toMatchObject({ index: 1, status: 'pass' })
    expect(res[2].status).toBe('error')
  })
})

describe('normalizeText duplicado', () => {
  it('domRunner y normalize.js se comportan igual', async () => {
    const samples = ['  ¡Hóla,   MUNDO! ', 'Ñandú\tÁÉÍÓÚ', '', 'a\n\nb', 'Crème Brûlée']
    for (const s of samples) {
      root.innerHTML = ''
      const p = document.createElement('p')
      p.textContent = s
      root.appendChild(p)
      // el texto normalizado de la página debe contener la muestra normalizada
      const [r] = await run([{ type: 'text', label: 'n', match: normalizeText(s) }])
      expect(r.status).toBe('pass')
      const [r2] = await run([{ type: 'text', label: 'n', match: s.toUpperCase() }])
      expect(r2.status).toBe('pass')
    }
  })
  it('normalizeText canónico', () => {
    expect(normalizeText('  ¡Hóla,   MUNDO! ')).toBe('¡hola, mundo!')
    expect(normalizeText('Ñandú')).toBe('nandu')
  })
})
