// Clases de Tailwind 4 que se sugieren solo dentro de className="...". La lista se genera
// por código una única vez (la primera vez que se necesita).

const PALETTE = [
  'slate', 'gray', 'red', 'orange', 'amber', 'yellow', 'green', 'emerald',
  'teal', 'sky', 'blue', 'indigo', 'violet', 'purple', 'pink', 'rose',
]
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
const COLOR_PREFIXES = [
  ['bg', 'color de fondo'],
  ['text', 'color del texto'],
  ['border', 'color del borde'],
]
const SCALE = [...Array.from({ length: 13 }, (_, i) => String(i)), '16', '20', '24', '32', '48', '64']
const SPACING = [
  ['p', 'espacio por dentro', []],
  ['px', 'espacio por dentro (a los lados)', []],
  ['py', 'espacio por dentro (arriba y abajo)', []],
  ['pt', 'espacio por dentro (arriba)', []],
  ['pr', 'espacio por dentro (derecha)', []],
  ['pb', 'espacio por dentro (abajo)', []],
  ['pl', 'espacio por dentro (izquierda)', []],
  ['m', 'espacio por fuera', ['auto']],
  ['mx', 'espacio por fuera (a los lados)', ['auto']],
  ['my', 'espacio por fuera (arriba y abajo)', ['auto']],
  ['mt', 'espacio por fuera (arriba)', ['auto']],
  ['mr', 'espacio por fuera (derecha)', ['auto']],
  ['mb', 'espacio por fuera (abajo)', ['auto']],
  ['ml', 'espacio por fuera (izquierda)', ['auto']],
  ['gap', 'separación entre elementos', []],
  ['w', 'ancho', ['full', 'screen', 'auto']],
  ['h', 'alto', ['full', 'screen', 'auto']],
]

function generate() {
  const list = []
  const add = (label, detail) => list.push({ label, detail, type: 'class' })

  for (const [prefix, detail] of COLOR_PREFIXES) {
    add(`${prefix}-white`, detail)
    add(`${prefix}-black`, detail)
    for (const color of PALETTE) for (const shade of SHADES) add(`${prefix}-${color}-${shade}`, detail)
  }
  for (const [prefix, detail, extras] of SPACING) {
    for (const value of [...SCALE, ...extras]) add(`${prefix}-${value}`, detail)
  }
  for (const size of ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']) add(`text-${size}`, 'tamaño del texto')
  for (const weight of ['light', 'normal', 'medium', 'semibold', 'bold']) add(`font-${weight}`, 'grosor de la letra')
  for (const align of ['left', 'center', 'right']) add(`text-${align}`, 'alineación del texto')

  for (const [name, detail] of [
    ['flex', 'ordena en fila o columna'],
    ['grid', 'ordena en cuadrícula'],
    ['block', 'ocupa todo el ancho'],
    ['hidden', 'oculta el elemento'],
    ['flex-col', 'elementos en columna'],
    ['flex-row', 'elementos en fila'],
    ['flex-wrap', 'pasa a otra línea si no caben'],
  ]) add(name, detail)
  for (const v of ['start', 'center', 'end', 'stretch', 'baseline']) add(`items-${v}`, 'alineación en el eje cruzado')
  for (const v of ['start', 'center', 'end', 'between', 'around', 'evenly']) add(`justify-${v}`, 'reparto en el eje principal')
  for (let n = 1; n <= 12; n++) add(`grid-cols-${n}`, 'columnas de la cuadrícula')

  add('rounded', 'esquinas redondeadas')
  for (const v of ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']) add(`rounded-${v}`, 'esquinas redondeadas')
  add('border', 'borde')
  for (const v of ['0', '2', '4', '8']) add(`border-${v}`, 'grosor del borde')

  add('shadow', 'sombra')
  for (const v of ['sm', 'md', 'lg', 'xl']) add(`shadow-${v}`, 'sombra')

  // `hover:` solo con los colores: se aplican al pasar el ratón por encima.
  for (const [prefix, detail] of COLOR_PREFIXES) {
    add(`hover:${prefix}-white`, `${detail} al pasar el ratón`)
    add(`hover:${prefix}-black`, `${detail} al pasar el ratón`)
    for (const color of PALETTE) for (const shade of SHADES) add(`hover:${prefix}-${color}-${shade}`, `${detail} al pasar el ratón`)
  }
  return list
}

let cache = null
/** Lista de clases (se genera la primera vez y se reutiliza). */
export function getTailwindClasses() {
  cache ??= generate()
  return cache
}

const CLASSNAME_OPEN = /className\s*=\s*(?:"[^"]*|'[^']*|\{\s*(?:'[^']*|"[^"]*|`[^`$]*))$/

/** ¿El cursor está dentro del texto de className="..." (o {'...'} / {`...`})? */
export function isInsideClassName(state, pos) {
  const before = state.doc.sliceString(Math.max(0, pos - 600), pos)
  return CLASSNAME_OPEN.test(before)
}

export function createTailwindSource(isEnabled = () => true) {
  return (context) => {
    if (!isEnabled()) return null
    if (!isInsideClassName(context.state, context.pos)) return null
    const word = context.matchBefore(/[\w:\-./]*/)
    if (!word || (word.from === word.to && !context.explicit)) return null
    return { from: word.from, options: getTailwindClasses(), validFor: /^[\w:\-./]*$/ }
  }
}

export const tailwindSource = createTailwindSource()
