// IMPORTANTE: este archivo se inyecta como texto (?raw) dentro del iframe.
// No puede tener imports; solo exporta `runDomChecks`.
// `normalizeText` es una copia privada de src/checks/normalize.js (un test las compara).

function normalizeText(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

const TEXT_TYPES = ['', 'text', 'email', 'number']
const BUTTON_TYPES = ['button', 'submit', 'reset']

const ROLES = {
  button: {
    noun: 'un botón',
    selector: 'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]',
  },
  heading: { noun: 'un título', selector: 'h1, h2, h3, h4, h5, h6, [role="heading"]' },
  textbox: { noun: 'un campo de texto', selector: 'input, textarea, [role="textbox"]' },
  list: { noun: 'una lista', selector: 'ul, ol, [role="list"]' },
  listitem: { noun: 'un elemento de lista', selector: 'li, [role="listitem"]' },
  link: { noun: 'un enlace', selector: 'a[href], [role="link"]' },
  img: { noun: 'una imagen', selector: 'img, [role="img"]' },
  form: { noun: 'un formulario', selector: 'form, [role="form"]' },
  checkbox: { noun: 'una casilla', selector: 'input[type="checkbox"], [role="checkbox"]' },
}

function matchesRole(el, role) {
  const tag = el.tagName.toLowerCase()
  const type = (el.getAttribute('type') || '').toLowerCase()
  if (el.getAttribute('role') === role) return true
  if (role === 'button') return tag === 'button' || (tag === 'input' && BUTTON_TYPES.includes(type))
  if (role === 'textbox') return tag === 'textarea' || (tag === 'input' && TEXT_TYPES.includes(type))
  if (role === 'checkbox') return tag === 'input' && type === 'checkbox'
  return true // el selector ya filtró por etiqueta
}

function nameCandidates(el) {
  return [el.textContent, el.getAttribute('aria-label'), el.value, el.getAttribute('alt')]
}

function findByRole(root, role, name) {
  const def = ROLES[role]
  if (!def) throw new Error(`rol desconocido: ${role}`)
  const wanted = name ? normalizeText(name) : ''
  return Array.from(root.querySelectorAll(def.selector)).filter(
    (el) =>
      matchesRole(el, role) &&
      (!wanted || nameCandidates(el).some((c) => c != null && normalizeText(c).includes(wanted))),
  )
}

function roleMissing(check) {
  const noun = ROLES[check.role].noun
  return check.name
    ? `No encontré ${noun} que diga "${check.name}".`
    : `No encontré ${noun} en tu página.`
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Evalúa un check simple (text, role, count, class). Devuelve { ok, message? }. */
function evaluate(check, root) {
  switch (check.type) {
    case 'text': {
      const ok = normalizeText(root.textContent).includes(normalizeText(check.match))
      return ok ? { ok } : { ok, message: `No encontré el texto "${check.match}" en tu página.` }
    }
    case 'role': {
      const found = findByRole(root, check.role, check.name).length
      const min = check.min ?? 1
      if (found >= min) return { ok: true }
      if (found > 0) {
        return { ok: false, message: `Encontré ${found} pero se piden al menos ${min}.` }
      }
      return { ok: false, message: roleMissing(check) }
    }
    case 'count': {
      const n = root.querySelectorAll(check.selector).length
      if (check.min != null && n < check.min) {
        return { ok: false, message: `Encontré ${n} elemento(s) y se piden al menos ${check.min}.` }
      }
      if (check.max != null && n > check.max) {
        return { ok: false, message: `Encontré ${n} elemento(s) y se piden como máximo ${check.max}.` }
      }
      return { ok: true }
    }
    case 'class': {
      const re = new RegExp(check.pattern)
      const ok = Array.from(root.querySelectorAll(check.selector)).some((el) =>
        Array.from(el.classList).some((c) => re.test(c)),
      )
      return ok ? { ok } : { ok, message: 'No encontré el estilo que se pide en tu página.' }
    }
    default:
      throw new Error(`tipo de comprobación desconocido: ${check.type}`)
  }
}

async function runInteraction(check, root) {
  for (const step of check.steps) {
    const el = findByRole(root, step.role, step.name)[0]
    if (!el) return { ok: false, message: roleMissing(step) }
    if (step.action === 'click') {
      el.click()
    } else if (step.action === 'type') {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, step.value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
      throw new Error(`acción desconocida: ${step.action}`)
    }
    await wait(50) // dejar que React vuelva a dibujar
  }
  const res = evaluate(check.expect, root)
  return res.ok ? res : { ok: false, message: `Hice lo que se pide, pero ${lowerFirst(res.message)}` }
}

function lowerFirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/**
 * Corre checks de iframe. `index` = posición en el arreglo recibido
 * (quien llama pasa solo los checks de iframe y reasigna los índices originales).
 */
export async function runDomChecks(checks, root = document.body) {
  const results = []
  for (let index = 0; index < checks.length; index++) {
    const check = checks[index]
    try {
      const res =
        check.type === 'interaction' ? await runInteraction(check, root) : evaluate(check, root)
      results.push(
        res.ok
          ? { index, label: check.label, status: 'pass' }
          : { index, label: check.label, status: 'fail', message: res.message },
      )
    } catch (e) {
      results.push({
        index,
        label: check.label,
        status: 'error',
        message: `No pude hacer esta comprobación: ${e.message}`,
      })
    }
  }
  return results
}
