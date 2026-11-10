export const CHECK_TYPES = [
  'text',
  'role',
  'count',
  'class',
  'interaction',
  'file-exists',
  'file-includes',
  'file-count',
  'lint-clean',
  'manual',
]

export const IFRAME_CHECK_TYPES = ['text', 'role', 'count', 'class', 'interaction']

const MAIN = '/src/main.jsx'

/** Devuelve una lista de errores en español; vacía significa que el curso es válido. */
export function validateCourse(modules) {
  const errors = []
  const seen = new Set()
  const checkId = (id, donde) => {
    if (!id) errors.push(`Falta el id en ${donde}.`)
    else if (seen.has(id)) errors.push(`El id '${id}' está repetido.`)
    else seen.add(id)
  }

  let first = true
  for (const mod of modules) {
    checkId(mod.id, 'un módulo')
    for (const lesson of mod.lessons ?? []) {
      checkId(lesson.id, `una lección de '${mod.id}'`)
      for (const ch of lesson.challenges ?? []) {
        checkId(ch.id, `un reto de '${lesson.id}'`)
        validateChallenge(ch, first, errors)
        first = false
      }
    }
  }
  return errors
}

function validateChallenge(ch, isFirst, errors) {
  const previous = ch.startFrom === 'previous'
  if (previous && isFirst) {
    errors.push(`El reto '${ch.id}' usa startFrom 'previous' pero es el primero del curso.`)
  }
  if (!previous && !(ch.files && MAIN in ch.files)) {
    errors.push(`El reto '${ch.id}' no tiene ${MAIN} en files.`)
  }
  if (ch.activeFile && !(ch.files && ch.activeFile in ch.files) && !previous) {
    errors.push(`El archivo activo '${ch.activeFile}' del reto '${ch.id}' no está en files.`)
  }
  if (!Array.isArray(ch.checks) || ch.checks.length === 0) {
    errors.push(`El reto '${ch.id}' no tiene checks.`)
    return
  }
  ch.checks.forEach((check, i) => {
    if (!CHECK_TYPES.includes(check.type)) {
      errors.push(`El check ${i + 1} del reto '${ch.id}' tiene un tipo desconocido: '${check.type}'.`)
    }
    if (!check.label) errors.push(`El check ${i + 1} del reto '${ch.id}' no tiene label.`)
  })
}
