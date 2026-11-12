import { snippetCompletion } from '@codemirror/autocomplete'
import { isInsideClassName } from './tailwindCompletions.js'

// Palabras de React con una descripción corta en español.
const WORDS = [
  ['useState', 'Guarda un valor que puede cambiar'],
  ['useEffect', 'Hace algo cuando la pantalla aparece o cambia'],
  ['useRef', 'Recuerda algo sin volver a dibujar la pantalla'],
  ['useContext', 'Lee un dato compartido por toda la aplicación'],
  ['useMemo', 'Recuerda el resultado de un cálculo'],
  ['useCallback', 'Recuerda una función para no crearla de nuevo'],
  ['import', 'Trae algo de otro archivo'],
  ['export default', 'Deja este componente disponible para otros archivos'],
  ['return', 'Devuelve lo que se va a mostrar'],
  ['className', 'Clases de estilo (Tailwind) del elemento'],
  ['onClick', 'Qué hacer cuando se hace clic'],
  ['onChange', 'Qué hacer cuando cambia el valor'],
  ['onSubmit', 'Qué hacer al enviar un formulario'],
]

// Plantillas: los huecos ${...} se recorren con Tab.
const SNIPPETS = [
  [
    'function ${Nombre}() {\n  return (\n    <div>\n      ${}\n    </div>\n  )\n}\n\nexport default ${Nombre}',
    { label: 'comp', detail: 'Plantilla: un componente nuevo' },
  ],
  [
    'const [${valor}, set${Valor}] = useState(${inicial})',
    { label: 'useState', detail: 'Plantilla: un valor que puede cambiar' },
  ],
  [
    'useEffect(() => {\n  ${}\n}, [])',
    { label: 'useEffect', detail: 'Plantilla: hacer algo al aparecer' },
  ],
  ["import ${Nombre} from './${Nombre}.jsx'", { label: 'imp', detail: 'Plantilla: traer un componente de otro archivo' }],
  [
    '{${lista}.map((${item}) => (\n  <li key={${item}.id}>{${item}.${nombre}}</li>\n))}',
    { label: 'map', detail: 'Plantilla: repetir algo por cada elemento de una lista' },
  ],
]

let cache = null
function options() {
  cache ??= [
    ...WORDS.map(([label, detail]) => ({ label, detail, type: 'keyword' })),
    ...SNIPPETS.map(([template, spec]) => snippetCompletion(template, { ...spec, type: 'snippet' })),
  ]
  return cache
}

export function createReactSource(isEnabled = () => true) {
  return (context) => {
    if (!isEnabled()) return null
    if (isInsideClassName(context.state, context.pos)) return null
    const word = context.matchBefore(/[\w$]*/)
    if (!word || (word.from === word.to && !context.explicit)) return null
    return { from: word.from, options: options(), validFor: /^[\w$]*$/ }
  }
}

export const reactSource = createReactSource()
