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

// Texto visible: ignora <script>, <style>, <template> y <noscript>.
function visibleText(el) {
  const clone = el.cloneNode(true)
  clone.querySelectorAll('script, style, template, noscript').forEach((n) => n.remove())
  return clone.textContent
}

function nameCandidates(el) {
  return [visibleText(el), el.getAttribute('aria-label'), el.value, el.getAttribute('alt')]
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

// Lo que el alumno pinta puede tardar (datos que se cargan al montar): se reintenta
// cada POLL_MS hasta que la comprobación pasa o se agota el plazo compartido.
const SETTLE_MS = 2000
const POLL_MS = 100
// Tope de toda la tanda: pasado, lo que quede se evalúa una sola vez. Debe quedar holgado
// bajo el plazo de resultados de la página (useCheckRunner.js).
const TOTAL_MS = 10000

/** Repite `attempt` hasta que devuelva `{ ok: true }` o pase `deadline`. Si lanza, no reintenta. */
async function settle(attempt, deadline) {
  for (;;) {
    const res = attempt()
    if (res.ok || Date.now() >= deadline) return res
    await wait(Math.min(POLL_MS, Math.max(0, deadline - Date.now())))
  }
}

/** Evalúa un check simple (text, role, count, class). Devuelve { ok, message? }. */
function evaluate(check, root) {
  switch (check.type) {
    case 'text': {
      const ok = normalizeText(visibleText(root)).includes(normalizeText(check.match))
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

// Cada interacción tiene su propio plazo (un clic puede disparar una carga nueva), compartido
// por la búsqueda de sus pasos y su `expect`, y nunca más allá del tope de la tanda.
async function runInteraction(check, root, deadline) {
  for (const step of check.steps) {
    const found = await settle(() => {
      const el = findByRole(root, step.role, step.name)[0]
      return el ? { ok: true, el } : { ok: false, message: roleMissing(step) }
    }, deadline)
    if (!found.ok) return found
    const el = found.el
    if (step.action === 'click') {
      el.click()
    } else if (step.action === 'type') {
      if (!['INPUT', 'TEXTAREA'].includes(el.tagName)) {
        return { ok: false, message: 'Solo puedo escribir en un campo de texto, y ese elemento no lo es.' }
      }
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, step.value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
      throw new Error(`acción desconocida: ${step.action}`)
    }
    await wait(50) // dejar que React vuelva a dibujar
  }
  const res = await settle(() => evaluate(check.expect, root), deadline)
  return res.ok ? res : { ok: false, message: `Hice lo que se pide, pero ${lowerFirst(res.message)}` }
}

function lowerFirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/**
 * Corre checks de iframe. `index` = posición en el arreglo recibido
 * (quien llama pasa solo los checks de iframe y reasigna los índices originales).
 * Si el autor puso `message` en el check, al fallar se muestra ese en vez del genérico.
 * `settleMs`: cuánto esperar a contenido que tarda en aparecer. Las comprobaciones
 * simples comparten un solo plazo desde el inicio; cada interacción tiene el suyo
 * (pasos + expect). `totalMs` acota toda la tanda.
 */
export async function runDomChecks(
  checks,
  root = document.body,
  { settleMs = SETTLE_MS, totalMs = TOTAL_MS } = {},
) {
  const start = Date.now()
  const hardDeadline = start + totalMs
  const capped = (ms) => Math.min(Date.now() + ms, hardDeadline)
  const simpleDeadline = capped(settleMs)
  const results = []
  for (let index = 0; index < checks.length; index++) {
    const check = checks[index]
    try {
      const res =
        check.type === 'interaction'
          ? await runInteraction(check, root, capped(settleMs))
          : await settle(() => evaluate(check, root), simpleDeadline)
      results.push(
        res.ok
          ? { index, label: check.label, status: 'pass' }
          : { index, label: check.label, status: 'fail', message: check.message || res.message },
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
