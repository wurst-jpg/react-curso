import { IFRAME_CHECK_TYPES } from '../content/schema.js'

const isCode = (path) => /\.jsx?$/.test(path)

function runOne(check, index, files, { lint, manualDone }) {
  const base = { index, label: check.label }
  const paths = Object.keys(files)
  const failMessage = (fallback) => (check.message ? check.message : fallback)
  switch (check.type) {
    case 'file-exists': {
      const re = new RegExp(check.pattern)
      return paths.some((p) => re.test(p))
        ? { ...base, status: 'pass' }
        : { ...base, status: 'fail', message: failMessage('Todavía no existe el archivo que se pide. Créalo desde el panel de archivos.') }
    }
    case 'file-includes': {
      const re = new RegExp(check.pattern)
      if (check.path) {
        if (typeof files[check.path] !== 'string') {
          return { ...base, status: 'fail', message: failMessage(`No encontré el archivo ${check.path}.`) }
        }
        return re.test(files[check.path])
          ? { ...base, status: 'pass' }
          : { ...base, status: 'fail', message: failMessage(`Todavía falta algo en ${check.path}.`) }
      }
      return paths.some((p) => re.test(files[p]))
        ? { ...base, status: 'pass' }
        : { ...base, status: 'fail', message: failMessage('Todavía falta algo en tu código.') }
    }
    case 'file-count': {
      const n = paths.filter(isCode).length
      return n >= check.min
        ? { ...base, status: 'pass' }
        : { ...base, status: 'fail', message: `Tienes ${n} archivo(s) de código y se piden al menos ${check.min}.` }
    }
    case 'lint-clean': {
      const bad = paths.filter(isCode).filter((p) => lint(files[p]).some((d) => d.severity === 2))
      return bad.length === 0
        ? { ...base, status: 'pass' }
        : { ...base, status: 'fail', message: `Hay errores en tu código (${bad.join(', ')}). Revisa los avisos del editor.` }
    }
    case 'manual':
      return { ...base, status: manualDone[index] ? 'manual-done' : 'manual-pending' }
    default:
      throw new Error(`Tipo de comprobación desconocido: ${check.type}`)
  }
}

/**
 * Comprobaciones que corren en la página. Se saltan las del iframe;
 * `index` es la posición en la lista original `checks`.
 */
export function runFileChecks(checks, files, { lint, manualDone = {} } = {}) {
  const results = []
  checks.forEach((check, index) => {
    if (IFRAME_CHECK_TYPES.includes(check.type)) return
    try {
      results.push(runOne(check, index, files, { lint, manualDone }))
    } catch (e) {
      results.push({
        index,
        label: check.label,
        status: 'error',
        message: `No pude hacer esta comprobación: ${e.message}`,
      })
    }
  })
  return results
}
