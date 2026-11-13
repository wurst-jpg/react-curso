const CODE_EXT = /\.(jsx?|tsx?)$/
const NAME_LINE = /^(\s*)import\s+([\w$]*)$/
const PATH_BEFORE = /(?:\bfrom\s*|^\s*import\s*)(['"])([^'"\n]*)$/

/** Ruta para escribir en un import, relativa al archivo que se edita: './Saludo.jsx' o '../components/Saludo.jsx'. */
export function relativeImportPath(fromFile, toFile) {
  const from = fromFile.split('/').filter(Boolean).slice(0, -1)
  const to = toFile.split('/').filter(Boolean)
  let common = 0
  while (common < from.length && common < to.length - 1 && from[common] === to[common]) common++
  const ups = from.length - common
  const rest = to.slice(common).join('/')
  return (ups === 0 ? './' : '../'.repeat(ups)) + rest
}

const isHidden = (path) => path.includes('__') || path.startsWith('/public/')

function visibleFiles(getFiles, activePath) {
  let files
  try {
    files = getFiles()
  } catch {
    return null
  }
  if (!files || typeof files !== 'object') return null
  return Object.entries(files).filter(([p, c]) => typeof c === 'string' && !isHidden(p) && p !== activePath)
}

function exportsOf(code, base) {
  if (/export\s+default\b/.test(code)) return { kind: 'default', names: [base] }
  const names = [...code.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([\w$]+)/g)].map((m) => m[1])
  return names.length ? { kind: 'named', names } : null
}

function nameOptions(files, activePath) {
  const options = []
  for (const [path, code] of files) {
    if (!CODE_EXT.test(path) || /\/main\.[jt]sx?$/.test(path)) continue
    const base = path.split('/').pop().replace(CODE_EXT, '')
    const found = exportsOf(code, base)
    if (!found) continue
    const rel = relativeImportPath(activePath, path)
    for (const name of found.names) {
      const spec = found.kind === 'default' ? name : `{ ${name} }`
      options.push({ label: name, type: 'class', detail: `Traer ${name} desde ${rel}`, apply: `${spec} from '${rel}'` })
    }
  }
  return options
}

function pathOptions(files, activePath) {
  const out = new Map()
  for (const [path] of files) {
    out.set(relativeImportPath(activePath, path), 'file')
    const parts = path.split('/').filter(Boolean).slice(0, -1)
    for (let i = 1; i <= parts.length; i++) {
      const dir = '/' + parts.slice(0, i).join('/')
      if (activePath.startsWith(dir + '/')) continue // carpeta que contiene al archivo actual
      out.set(relativeImportPath(activePath, dir + '/x').replace(/x$/, ''), 'folder')
    }
  }
  return [...out].map(([label, kind]) => ({ label, type: kind === 'folder' ? 'namespace' : 'text', detail: kind === 'folder' ? 'carpeta' : 'archivo de tu proyecto' }))
}

/** Autocompleta `import Nombre` (con su from) y las rutas dentro de `from '...'`. */
export function createImportSource(getFiles, getActivePath, isEnabled = () => true) {
  return (context) => {
    if (!isEnabled()) return null
    const activePath = getActivePath?.()
    if (typeof activePath !== 'string' || !activePath) return null
    const line = context.state.doc.lineAt(context.pos)
    const before = line.text.slice(0, context.pos - line.from)

    const pathMatch = PATH_BEFORE.exec(before)
    const nameMatch = pathMatch ? null : NAME_LINE.exec(before)
    if (!pathMatch && !nameMatch) return null
    if (!context.explicit && !pathMatch && nameMatch[2] === '') return null

    const files = visibleFiles(getFiles, activePath)
    if (!files) return null

    if (pathMatch) {
      const typed = pathMatch[2]
      const quote = pathMatch[1]
      const rest = line.text.slice(context.pos - line.from)
      const closing = rest.indexOf(quote)
      const options = pathOptions(files, activePath)
      return options.length ? { from: context.pos - typed.length, to: closing === -1 ? context.pos : context.pos + closing, options } : null
    }
    const options = nameOptions(files, activePath)
    if (!options.length) return null
    return { from: context.pos - nameMatch[2].length, to: line.to, options }
  }
}
