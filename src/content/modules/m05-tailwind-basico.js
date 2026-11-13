const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

const modulo = {
  id: 'm05',
  title: 'Tailwind básico',
  summary: 'Dale color, espacio, letras y bordes a tus componentes con clases de Tailwind.',
  lessons: [
    {
      id: 'm05-l1',
      title: 'Colores',
      explanation: `Tailwind es como una caja de pegatinas: en lugar de escribir reglas de diseño aparte, pegas "etiquetas" cortas (clases) directamente en cada elemento. En React las pones en \`className\`:

\`\`\`jsx
<h1 className="text-blue-600">Mis gastos</h1>
\`\`\`

Los colores siguen un patrón: **prefijo + color + intensidad**.

- \`text-\` pinta las letras, \`bg-\` pinta el fondo.
- El color: \`red\`, \`green\`, \`blue\`, \`yellow\`, \`gray\`...
- La intensidad va de \`50\` (muy claro) a \`950\` (muy oscuro). Ejemplo: \`bg-green-100\` es un verde suavecito y \`text-green-800\` un verde oscuro.

Puedes poner varias clases separadas por un espacio: \`className="bg-yellow-100 text-yellow-800"\`.`,
      challenges: [
        {
          id: 'm05-l1-c1',
          title: 'Pinta el título',
          instructions:
            'El título **Mis gastos** se ve negro. Ponle un color a las letras con una clase `text-` (por ejemplo `text-green-600`).',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return <h1>Mis gastos</h1>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'En React las clases se escriben en el atributo className, dentro de la etiqueta de apertura.',
            'El color de las letras empieza con text- y sigue con un color y un número, como text-green-600.',
            'Deja así: <h1 className="text-green-600">Mis gastos</h1>',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return <h1 className="text-green-600">Mis gastos</h1>
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Mis gastos', label: 'Se ve el título "Mis gastos"' },
            {
              type: 'class',
              selector: 'h1',
              pattern: '^text-([a-z]+-\\d+|white|black)$',
              label: 'El título tiene un color de letra (text-color-número)',
              message: 'Añade className="text-green-600" (o otro color) a la etiqueta <h1>.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm05-l1-c2',
          title: 'Un aviso con fondo',
          instructions:
            'Convierte este recordatorio en un aviso: dale un fondo de color suave al `div` (por ejemplo `bg-yellow-100`) y letras de un color más oscuro al párrafo (por ejemplo `text-yellow-800`). El texto debe seguir diciendo **Anota el gasto del café**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <p>Anota el gasto del café</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El fondo se pone con bg- y las letras con text-. Cada uno va en su etiqueta: bg en el div, text en el p.',
            'Un fondo claro (100) con letras oscuras (800) casi siempre se lee bien.',
            'Usa <div className="bg-yellow-100"> y <p className="text-yellow-800">.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <div className="bg-yellow-100">
      <p className="text-yellow-800">Anota el gasto del café</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'text', match: 'Anota el gasto del café', label: 'El aviso dice "Anota el gasto del café"' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^bg-[a-z]+-\\d+$',
              label: 'El div tiene un color de fondo (bg-color-número)',
              message: 'Añade className="bg-yellow-100" (o similar) a la etiqueta <div>.',
            },
            {
              type: 'class',
              selector: 'p',
              pattern: '^text-[a-z]+-\\d+$',
              label: 'El párrafo tiene un color de letra (text-color-número)',
              message: 'Añade className="text-yellow-800" (o similar) a la etiqueta <p>.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm05-l2',
      title: 'Espaciado',
      explanation: `Piensa en una caja de regalo: el **padding** es el papel de burbujas dentro de la caja (espacio entre el borde y el contenido) y el **margin** es el espacio libre que dejas fuera, entre una caja y la de al lado.

- \`p-4\` = padding por todos lados. \`px-4\` = solo a los lados (izquierda y derecha). \`py-2\` = solo arriba y abajo.
- \`m-4\` = margen por todos lados. \`mt-4\` = solo arriba (top), \`mb-4\` = solo abajo (bottom).

El número es la cantidad: \`1\` es poquito, \`4\` es normal, \`8\` es bastante.

\`\`\`jsx
<button className="px-4 py-2">Guardar</button>
\`\`\``,
      challenges: [
        {
          id: 'm05-l2-c1',
          title: 'Un botón con aire',
          instructions:
            'El botón **Guardar gasto** está apretadito. Dale espacio interno con `px-` y `py-` (por ejemplo `px-4 py-2`), un fondo `bg-blue-600` y letras `text-white`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return <button>Guardar gasto</button>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Todas las clases van juntas dentro del mismo className, separadas por espacios.',
            'px-4 da espacio a los lados, py-2 arriba y abajo. Además necesitas un bg- y un text-.',
            'Escribe: <button className="px-4 py-2 bg-blue-600 text-white">Guardar gasto</button>',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return <button className="px-4 py-2 bg-blue-600 text-white">Guardar gasto</button>
}
`,
          },
          checks: [
            { type: 'role', role: 'button', name: 'Guardar gasto', label: 'Se ve el botón "Guardar gasto"' },
            {
              type: 'class',
              selector: 'button',
              pattern: '^px-\\d+(\\.5)?$',
              label: 'El botón tiene espacio a los lados (px-)',
              message: 'Añade una clase como px-4 al className del botón.',
            },
            {
              type: 'class',
              selector: 'button',
              pattern: '^py-\\d+(\\.5)?$',
              label: 'El botón tiene espacio arriba y abajo (py-)',
              message: 'Añade una clase como py-2 al className del botón.',
            },
            {
              type: 'class',
              selector: 'button',
              pattern: '^bg-[a-z]+-\\d+$',
              label: 'El botón tiene color de fondo',
              message: 'Añade bg-blue-600 al className del botón.',
            },
            {
              type: 'class',
              selector: 'button',
              pattern: '^text-white$',
              label: 'El botón tiene letras blancas',
              message: 'Añade text-white al className del botón.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm05-l2-c2',
          title: 'Separa las piezas',
          instructions:
            'Esta tarjeta tiene todo pegado. Dale `p-4` al `div` de afuera (espacio interno) y un margen de abajo al título con `mb-2`. Además pinta el fondo del `div` con un `bg-` para que se note el espacio.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h2>Café</h2>
      <p>Gastaste $ 3500 esta mañana</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El espacio interno de la tarjeta (padding) va en el div, no en el título.',
            'mb-2 significa "margin bottom": separa el título de lo que viene debajo.',
            'Usa <div className="p-4 bg-gray-100"> y <h2 className="mb-2">.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <div className="p-4 bg-gray-100">
      <h2 className="mb-2">Café</h2>
      <p>Gastaste $ 3500 esta mañana</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Café', label: 'Se ve el título "Café"' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^p-\\d+(\\.5)?$',
              label: 'La tarjeta tiene espacio interno (p-)',
              message: 'Añade p-4 al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^bg-[a-z]+-\\d+$',
              label: 'La tarjeta tiene color de fondo',
              message: 'Añade un fondo como bg-gray-100 al div.',
            },
            {
              type: 'class',
              selector: 'h2',
              pattern: '^m[tb]-\\d+$',
              label: 'El título tiene margen (mb- o mt-)',
              message: 'Añade mb-2 al className del <h2>.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm05-l3',
      title: 'Letras y bordes',
      explanation: `Ahora el aspecto de las letras y de las "cajas".

**Tipografía**
- Tamaño: \`text-sm\` (pequeño), \`text-base\` (normal), \`text-xl\`, \`text-2xl\`, \`text-3xl\`... (cada vez más grande).
- Grosor: \`font-medium\`, \`font-semibold\`, \`font-bold\` (negrita).

**Bordes y sombra**
- \`border\` dibuja una línea alrededor; \`border-gray-300\` le da color.
- \`rounded-lg\` redondea las esquinas (\`rounded-full\` las deja como círculo).
- \`shadow-md\` pone una sombra, como si la caja flotara sobre la mesa.

\`\`\`jsx
<div className="border border-gray-300 rounded-lg shadow-md">...</div>
\`\`\``,
      challenges: [
        {
          id: 'm05-l3-c1',
          title: 'Jerarquía de letras',
          instructions:
            'Que se note qué es importante: el título **Resumen del mes** debe ser grande y en negrita (por ejemplo `text-2xl font-bold`) y el párrafo pequeño y gris (por ejemplo `text-sm text-gray-500`).',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1>Resumen del mes</h1>
      <p>Actualizado hoy</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El tamaño de letra empieza con text- (text-2xl) y la negrita es font-bold. Van en el h1.',
            'Para el párrafo usa un tamaño pequeño (text-sm) y un color gris (text-gray-500).',
            'Usa <h1 className="text-2xl font-bold"> y <p className="text-sm text-gray-500">.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Resumen del mes</h1>
      <p className="text-sm text-gray-500">Actualizado hoy</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Resumen del mes', label: 'Se ve el título "Resumen del mes"' },
            {
              type: 'class',
              selector: 'h1',
              pattern: '^text-(lg|xl|[2-9]xl)$',
              label: 'El título tiene letra grande (text-xl, text-2xl...)',
              message: 'Añade text-2xl al className del <h1>.',
            },
            {
              type: 'class',
              selector: 'h1',
              pattern: '^font-(semibold|bold|extrabold)$',
              label: 'El título está en negrita (font-bold)',
              message: 'Añade font-bold al className del <h1>.',
            },
            {
              type: 'class',
              selector: 'p',
              pattern: '^text-(xs|sm)$',
              label: 'El párrafo tiene letra pequeña (text-sm)',
              message: 'Añade text-sm al className del <p>.',
            },
            {
              type: 'class',
              selector: 'p',
              pattern: '^text-(gray|slate|zinc|neutral|stone)-\\d+$',
              label: 'El párrafo es gris (text-gray-...)',
              message: 'Añade text-gray-500 al className del <p>.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm05-l3-c2',
          title: 'Una tarjeta con borde',
          instructions:
            'Convierte el `div` en una tarjeta bonita: con borde (`border` y un `border-gray-200`), esquinas redondeadas (`rounded-lg`), sombra (`shadow-md`) y espacio interno (`p-4`).',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h2>Supermercado</h2>
      <p>$ 24000</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Todo va en el className del div de afuera.',
            'Necesitas cuatro ideas: border, rounded-..., shadow-... y p-....',
            'Usa <div className="border border-gray-200 rounded-lg shadow-md p-4">.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <div className="border border-gray-200 rounded-lg shadow-md p-4">
      <h2>Supermercado</h2>
      <p>$ 24000</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Supermercado', label: 'Se ve el título "Supermercado"' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^border(-\\d+)?$',
              label: 'La tarjeta tiene borde (border)',
              message: 'Añade la clase border al div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^rounded(-[a-z0-9]+)?$',
              label: 'La tarjeta tiene esquinas redondeadas (rounded-lg)',
              message: 'Añade rounded-lg al div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^shadow(-[a-z0-9]+)?$',
              label: 'La tarjeta tiene sombra (shadow-md)',
              message: 'Añade shadow-md al div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^p-\\d+$',
              label: 'La tarjeta tiene espacio interno (p-4)',
              message: 'Añade p-4 al div.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm05-l4',
      title: 'Hover: reaccionar al ratón',
      explanation: `Una buena interfaz "responde": cuando pasas el ratón por encima de un botón, cambia un poco, como una luz que se enciende al acercarte.

En Tailwind le pones **\`hover:\`** delante de cualquier clase y solo se aplica mientras el ratón está encima:

\`\`\`jsx
<button className="bg-blue-600 hover:bg-blue-800 transition">
  Guardar
</button>
\`\`\`

- \`hover:bg-blue-800\`: al pasar el ratón, el fondo se oscurece.
- \`transition\`: hace que el cambio sea suave en vez de brusco.
- \`cursor-pointer\`: muestra la manito del ratón.

Ahora ya puedes armar una pieza completa. Si el elemento está dentro de un componente, abres el archivo del componente y le pones el \`className\` ahí.`,
      challenges: [
        {
          id: 'm05-l4-c1',
          title: 'Un botón que reacciona',
          instructions:
            'El botón **Agregar** ya tiene color. Haz que al pasar el ratón se oscurezca: añade `hover:bg-blue-800` (puede ser otro color con `hover:bg-`) y una `transition` para que el cambio sea suave.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
      Agregar
    </button>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'hover: se escribe pegado a otra clase, sin espacio: hover:bg-...',
            'Añádelo dentro del mismo className, al lado de bg-blue-600.',
            'Agrega al className: hover:bg-blue-800 transition',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-800 transition">
      Agregar
    </button>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'button', name: 'Agregar', label: 'Se ve el botón "Agregar"' },
            {
              type: 'class',
              selector: 'button',
              pattern: '^hover:bg-[a-z]+-\\d+$',
              label: 'El botón cambia de fondo al pasar el ratón (hover:bg-)',
              message: 'Añade hover:bg-blue-800 al className del botón.',
            },
            {
              type: 'class',
              selector: 'button',
              pattern: '^transition',
              label: 'El cambio es suave (transition)',
              message: 'Añade la clase transition al className del botón.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm05-l4-c2',
          title: 'Tarjeta de gasto completa',
          instructions:
            'Junta todo en el componente `GastoCard` (archivo `/src/components/GastoCard.jsx`). Ya muestra el nombre y el monto, pero sin estilo. Déjala así:\n\n- La tarjeta (`article`): fondo `bg-white`, `p-4`, `border`, `rounded-xl` y `shadow` (o `shadow-md`), y `hover:shadow-lg`.\n- El nombre en negrita (`font-semibold`) y el monto en color (`text-red-600`) y `font-bold`.\n- El botón **Borrar** con `bg-red-600`, `text-white`, `px-3 py-1`, `rounded` y `hover:bg-red-800`.\n\n`App.jsx` ya la usa; el texto debe seguir diciendo **Café**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import GastoCard from './components/GastoCard.jsx'

export default function App() {
  return (
    <div className="p-6 bg-gray-100">
      <GastoCard nombre="Café" monto={3500} />
    </div>
  )
}
`,
            '/src/components/GastoCard.jsx': `export default function GastoCard({ nombre, monto }) {
  return (
    <article>
      <h2>{nombre}</h2>
      <p>$ {monto}</p>
      <button>Borrar</button>
    </article>
  )
}
`,
          },
          activeFile: '/src/components/GastoCard.jsx',
          hints: [
            'Todo el trabajo está en GastoCard.jsx: agrega className a article, h2, p y button.',
            'Tarjeta: bg-white p-4 border rounded-xl shadow hover:shadow-lg. Botón: bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800.',
            'Pon font-semibold en el h2 y text-red-600 font-bold en el p. Recuerda: en React es className, no class.',
          ],
          solution: {
            '/src/components/GastoCard.jsx': `export default function GastoCard({ nombre, monto }) {
  return (
    <article className="bg-white p-4 border rounded-xl shadow hover:shadow-lg">
      <h2 className="font-semibold">{nombre}</h2>
      <p className="text-red-600 font-bold">$ {monto}</p>
      <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-800">Borrar</button>
    </article>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'role', role: 'heading', name: 'Café', label: 'Se ve el gasto "Café"' },
            { type: 'role', role: 'button', name: 'Borrar', label: 'Se ve el botón "Borrar"' },
            {
              type: 'class',
              selector: 'article',
              pattern: '^bg-white$',
              label: 'La tarjeta tiene fondo blanco',
              message: 'Añade bg-white al className del <article>.',
            },
            {
              type: 'class',
              selector: 'article',
              pattern: '^p-\\d+$',
              label: 'La tarjeta tiene espacio interno (p-)',
              message: 'Añade p-4 al className del <article>.',
            },
            {
              type: 'class',
              selector: 'article',
              pattern: '^border(-\\d+)?$',
              label: 'La tarjeta tiene borde',
              message: 'Añade border al className del <article>.',
            },
            {
              type: 'class',
              selector: 'article',
              pattern: '^rounded(-[a-z0-9]+)?$',
              label: 'La tarjeta tiene esquinas redondeadas',
              message: 'Añade rounded-xl al className del <article>.',
            },
            {
              type: 'class',
              selector: 'article',
              pattern: '^shadow(-[a-z0-9]+)?$',
              label: 'La tarjeta tiene sombra',
              message: 'Añade shadow al className del <article>.',
            },
            {
              type: 'class',
              selector: 'article',
              pattern: '^hover:shadow',
              label: 'La sombra crece al pasar el ratón (hover:shadow-)',
              message: 'Añade hover:shadow-lg al className del <article>.',
            },
            {
              type: 'class',
              selector: 'h2',
              pattern: '^font-(medium|semibold|bold)$',
              label: 'El nombre va en negrita',
              message: 'Añade font-semibold al className del <h2>.',
            },
            {
              type: 'class',
              selector: 'p',
              pattern: '^text-red-\\d+$',
              label: 'El monto es rojo',
              message: 'Añade text-red-600 al className del <p>.',
            },
            {
              type: 'class',
              selector: 'button',
              pattern: '^bg-red-\\d+$',
              label: 'El botón Borrar tiene fondo rojo',
              message: 'Añade bg-red-600 al className del botón.',
            },
            {
              type: 'class',
              selector: 'button',
              pattern: '^hover:bg-red-\\d+$',
              label: 'El botón Borrar cambia al pasar el ratón',
              message: 'Añade hover:bg-red-800 al className del botón.',
            },
          ],
          xp: 25,
        },
      ],
    },
  ],
}

export default modulo
