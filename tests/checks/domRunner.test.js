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

const run = (checks) => runDomChecks(checks, root)

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
