const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

const TARJETA = `export default function Tarjeta({ nombre, monto }) {
  return (
    <article className="bg-white p-4 border rounded-xl shadow">
      <h2 className="font-semibold">{nombre}</h2>
      <p className="text-red-600">$ {monto}</p>
    </article>
  )
}
`

const modulo = {
  id: 'm06',
  title: 'Tailwind avanzado',
  summary: 'Acomoda piezas con flex y grid, adapta la página al celular y crea modo oscuro.',
  lessons: [
    {
      id: 'm06-l1',
      title: 'Flex: acomodar en fila o columna',
      explanation: `Imagina un estante: \`flex\` convierte una caja en un estante donde sus hijos se colocan **uno al lado del otro** en fila.

\`\`\`jsx
<div className="flex items-center justify-between gap-4">
  <h1>Mis gastos</h1>
  <button>Nuevo</button>
</div>
\`\`\`

- \`flex\`: activa el estante (fila por defecto).
- \`flex-col\`: en vez de fila, una columna (uno debajo de otro).
- \`justify-between\`: reparte el espacio horizontal; el primero a la izquierda y el último a la derecha. Otras: \`justify-center\`, \`justify-end\`.
- \`items-center\`: centra las piezas en vertical.
- \`gap-4\`: espacio entre las piezas.`,
      challenges: [
        {
          id: 'm06-l1-c1',
          title: 'Una fila con extremos',
          instructions:
            'Haz que el título **Mis gastos** quede a la izquierda y el botón **Nuevo** a la derecha, en la misma fila y centrados en vertical. Al `div` ponle `flex`, `items-center` y `justify-between`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Mis gastos</h1>
      <button className="px-4 py-2 rounded bg-blue-600 text-white">Nuevo</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Las clases de flex se ponen en el contenedor (el div), no en los hijos.',
            'Necesitas tres: flex, items-center y justify-between.',
            'Usa <div className="flex items-center justify-between">.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Mis gastos</h1>
      <button className="px-4 py-2 rounded bg-blue-600 text-white">Nuevo</button>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Mis gastos', label: 'Se ve el título "Mis gastos"' },
            { type: 'role', role: 'button', name: 'Nuevo', label: 'Se ve el botón "Nuevo"' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^flex$',
              label: 'El contenedor usa flex',
              message: 'Añade la clase flex al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^items-center$',
              label: 'Las piezas están centradas en vertical (items-center)',
              message: 'Añade items-center al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^justify-between$',
              label: 'Una pieza a cada extremo (justify-between)',
              message: 'Añade justify-between al className del div.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm06-l1-c2',
          title: 'Una lista en columna',
          instructions:
            'Ordena los tres gastos en una columna con espacio entre ellos. Al `div` de afuera ponle `flex`, `flex-col` y `gap-2` (o el número de espacio que prefieras).',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <p className="p-2 bg-gray-100 rounded">Café</p>
      <p className="p-2 bg-gray-100 rounded">Bus</p>
      <p className="p-2 bg-gray-100 rounded">Almuerzo</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Los párrafos ya tienen estilo. Solo falta el contenedor.',
            'flex-col pone todo en columna; gap-2 deja un hueco entre cada pieza.',
            'Usa <div className="flex flex-col gap-2">.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <div className="flex flex-col gap-2">
      <p className="p-2 bg-gray-100 rounded">Café</p>
      <p className="p-2 bg-gray-100 rounded">Bus</p>
      <p className="p-2 bg-gray-100 rounded">Almuerzo</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'text', match: 'Café', label: 'Se ve "Café"' },
            { type: 'text', match: 'Bus', label: 'Se ve "Bus"' },
            { type: 'text', match: 'Almuerzo', label: 'Se ve "Almuerzo"' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^flex$',
              label: 'El contenedor usa flex',
              message: 'Añade la clase flex al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^flex-col$',
              label: 'Las piezas van en columna (flex-col)',
              message: 'Añade flex-col al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^gap-\\d+$',
              label: 'Hay espacio entre las piezas (gap-)',
              message: 'Añade gap-2 al className del div.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm06-l2',
      title: 'Grid: una cuadrícula',
      explanation: `Si flex es un estante, **grid** es una caja de huevos: filas y columnas. Perfecto para una galería de tarjetas.

\`\`\`jsx
<div className="grid grid-cols-3 gap-4">
  <Tarjeta />
  <Tarjeta />
  <Tarjeta />
</div>
\`\`\`

- \`grid\`: activa la cuadrícula.
- \`grid-cols-3\`: 3 columnas del mismo ancho (\`grid-cols-2\`, \`grid-cols-4\`...). Si hay más tarjetas que columnas, bajan a la fila siguiente solas.
- \`gap-4\`: espacio entre las celdas.

Regla fácil: **una sola línea de cosas, usa flex; filas y columnas, usa grid.**`,
      challenges: [
        {
          id: 'm06-l2-c1',
          title: 'Tres tarjetas en cuadrícula',
          instructions:
            'En `App.jsx` las tarjetas salen una debajo de otra. Ponlas en una cuadrícula de 3 columnas con espacio entre ellas: al `div` añade `grid`, `grid-cols-3` y `gap-4`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

export default function App() {
  return (
    <div className="p-6 bg-gray-100">
      <Tarjeta nombre="Café" monto={3500} />
      <Tarjeta nombre="Bus" monto={2800} />
      <Tarjeta nombre="Almuerzo" monto={12000} />
    </div>
  )
}
`,
            '/src/components/Tarjeta.jsx': TARJETA,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'La cuadrícula se activa en el contenedor, el div que envuelve las tarjetas.',
            'Necesitas grid, grid-cols-3 y gap-4. Conserva las clases que ya tiene (p-6 bg-gray-100).',
            'Queda: <div className="grid grid-cols-3 gap-4 p-6 bg-gray-100">.',
          ],
          solution: {
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

export default function App() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6 bg-gray-100">
      <Tarjeta nombre="Café" monto={3500} />
      <Tarjeta nombre="Bus" monto={2800} />
      <Tarjeta nombre="Almuerzo" monto={12000} />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'count', selector: 'article', min: 3, label: 'Se ven las tres tarjetas' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^grid$',
              label: 'El contenedor usa grid',
              message: 'Añade la clase grid al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^grid-cols-[2-6]$',
              label: 'Hay varias columnas (grid-cols-3)',
              message: 'Añade grid-cols-3 al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^gap-\\d+$',
              label: 'Hay espacio entre tarjetas (gap-)',
              message: 'Añade gap-4 al className del div.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm06-l2-c2',
          title: 'Cuadrícula con una lista',
          instructions:
            'Ahora los gastos vienen de una lista. Con `map` pinta una `Tarjeta` por cada gasto (con su `key`) dentro de una cuadrícula de 2 columnas (`grid grid-cols-2 gap-4`). Verás cuatro tarjetas, incluida **Cine**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

const gastos = [
  { id: 1, nombre: 'Café', monto: 3500 },
  { id: 2, nombre: 'Bus', monto: 2800 },
  { id: 3, nombre: 'Almuerzo', monto: 12000 },
  { id: 4, nombre: 'Cine', monto: 18000 },
]

export default function App() {
  return (
    <div className="p-6 bg-gray-100">
      {/* aquí va el map */}
    </div>
  )
}
`,
            '/src/components/Tarjeta.jsx': TARJETA,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Dentro de las llaves usa gastos.map((gasto) => ( ... )) y devuelve una Tarjeta.',
            'No olvides key={gasto.id} en la Tarjeta, y pasa nombre={gasto.nombre} y monto={gasto.monto}.',
            'El div lleva className="grid grid-cols-2 gap-4 p-6 bg-gray-100". Dentro: {gastos.map((g) => <Tarjeta key={g.id} nombre={g.nombre} monto={g.monto} />)}',
          ],
          solution: {
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

const gastos = [
  { id: 1, nombre: 'Café', monto: 3500 },
  { id: 2, nombre: 'Bus', monto: 2800 },
  { id: 3, nombre: 'Almuerzo', monto: 12000 },
  { id: 4, nombre: 'Cine', monto: 18000 },
]

export default function App() {
  return (
    <div className="grid grid-cols-2 gap-4 p-6 bg-gray-100">
      {gastos.map((gasto) => (
        <Tarjeta key={gasto.id} nombre={gasto.nombre} monto={gasto.monto} />
      ))}
    </div>
  )
}
`,
          },
          checks: [
            { type: 'count', selector: 'article', min: 4, label: 'Se ven las cuatro tarjetas' },
            { type: 'role', role: 'heading', name: 'Cine', label: 'Se ve la tarjeta "Cine"' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^grid$',
              label: 'El contenedor usa grid',
              message: 'Añade la clase grid al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^grid-cols-[2-6]$',
              label: 'Hay varias columnas (grid-cols-2)',
              message: 'Añade grid-cols-2 al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^gap-\\d+$',
              label: 'Hay espacio entre tarjetas (gap-)',
              message: 'Añade gap-4 al className del div.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm06-l3',
      title: 'Responsive: celular y computador',
      explanation: `Tu página la verán pantallas pequeñas (celular) y grandes (computador). **Responsive** significa que se adapta, como una camisa elástica.

Tailwind piensa primero en el celular: las clases normales valen siempre, y con un prefijo valen **solo desde cierto ancho en adelante**:

- \`sm:\` desde 640px, \`md:\` desde 768px (tablet), \`lg:\` desde 1024px (computador).

\`\`\`jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
\`\`\`

Se lee así: "una columna; pero cuando la pantalla sea mediana o más, tres columnas".

Para probarlo, cambia el ancho de la vista previa o de tu ventana. Aquí solo comprobamos que escribiste las clases.`,
      challenges: [
        {
          id: 'm06-l3-c1',
          title: 'Columnas que se adaptan',
          instructions:
            'Haz la cuadrícula responsive: en celular, 1 columna (`grid-cols-1`) y desde pantallas medianas, 3 columnas (`md:grid-cols-3`). Conserva `grid` y `gap-4`. Si la vista previa es angosta verás 1 columna; es lo esperado (las clases `md:` se activan en pantallas anchas).',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

export default function App() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <Tarjeta nombre="Café" monto={3500} />
      <Tarjeta nombre="Bus" monto={2800} />
      <Tarjeta nombre="Almuerzo" monto={12000} />
    </div>
  )
}
`,
            '/src/components/Tarjeta.jsx': TARJETA,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Ahora mismo siempre hay 3 columnas, incluso en el celular.',
            'Cambia grid-cols-3 por grid-cols-1 y añade al lado md:grid-cols-3.',
            'Queda: <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">.',
          ],
          solution: {
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

export default function App() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      <Tarjeta nombre="Café" monto={3500} />
      <Tarjeta nombre="Bus" monto={2800} />
      <Tarjeta nombre="Almuerzo" monto={12000} />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'count', selector: 'article', min: 3, label: 'Se ven las tres tarjetas' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^grid-cols-1$',
              label: 'En celular hay 1 columna (grid-cols-1)',
              message: 'Cambia grid-cols-3 por grid-cols-1.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^md:grid-cols-[2-6]$',
              label: 'Desde pantalla mediana hay más columnas (md:grid-cols-3)',
              message: 'Añade md:grid-cols-3 al className del div.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm06-l3-c2',
          title: 'Cabecera responsive',
          instructions:
            'Arma la cabecera: en celular, el título y el botón van uno debajo del otro (`flex flex-col gap-2`); desde pantallas medianas, en una fila con extremos (`md:flex-row` y `md:justify-between`). El botón debe decir **Nuevo gasto**. Si la vista previa es angosta verás la versión de celular; es lo esperado (las clases `md:` se activan en pantallas anchas).',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <header className="p-4 bg-white shadow">
      <h1 className="text-2xl font-bold">Mis gastos</h1>
      <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-800">Nuevo gasto</button>
    </header>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El contenedor es el header; ahí van todas las clases de flex.',
            'Sin prefijo: flex flex-col gap-2. Con prefijo md: cambian a fila y se separan.',
            'Añade al header: flex flex-col gap-2 md:flex-row md:justify-between md:items-center.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <header className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center p-4 bg-white shadow">
      <h1 className="text-2xl font-bold">Mis gastos</h1>
      <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-800">Nuevo gasto</button>
    </header>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Mis gastos', label: 'Se ve el título "Mis gastos"' },
            { type: 'role', role: 'button', name: 'Nuevo gasto', label: 'Se ve el botón "Nuevo gasto"' },
            {
              type: 'class',
              selector: 'header',
              pattern: '^flex$',
              label: 'La cabecera usa flex',
              message: 'Añade flex al className del header.',
            },
            {
              type: 'class',
              selector: 'header',
              pattern: '^flex-col$',
              label: 'En celular va en columna (flex-col)',
              message: 'Añade flex-col al className del header.',
            },
            {
              type: 'class',
              selector: 'header',
              pattern: '^md:flex-row$',
              label: 'En pantalla mediana pasa a fila (md:flex-row)',
              message: 'Añade md:flex-row al className del header.',
            },
            {
              type: 'class',
              selector: 'header',
              pattern: '^md:justify-between$',
              label: 'En pantalla mediana separa los extremos (md:justify-between)',
              message: 'Añade md:justify-between al className del header.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm06-l4',
      title: 'Modo oscuro',
      explanation: `Muchas personas usan el modo oscuro de su celular o computador, como bajar la luz de la sala por la noche. Tailwind lo soporta con el prefijo **\`dark:\`**: esas clases solo valen cuando el sistema del usuario está en modo oscuro.

\`\`\`jsx
<div className="bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
\`\`\`

Se lee: "fondo blanco con letras oscuras; **pero** en modo oscuro, fondo gris oscuro con letras blancas".

Truco: para ver el resultado, cambia el tema de tu sistema (claro/oscuro). La plataforma solo comprobará que escribiste las clases \`dark:\`.

Regla útil: cada vez que pongas un color de fondo, piensa también cómo se vería de noche.`,
      challenges: [
        {
          id: 'm06-l4-c1',
          title: 'Una tarjeta que se oscurece',
          instructions:
            'Esta tarjeta es siempre blanca. Haz que en modo oscuro tenga fondo oscuro y letras claras: añade `dark:bg-slate-800` al fondo y `dark:text-white` al texto. Deja las clases normales. En la vista previa no verás ningún cambio a menos que tu computador (o tu navegador) esté en modo oscuro; es normal, no está roto.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div className="p-6 rounded-xl bg-white text-slate-900">
      <h1 className="text-xl font-bold">Resumen del mes</h1>
      <p>Llevas gastado $ 120000</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'dark: se escribe delante de la clase, igual que hover: o md:.',
            'Necesitas dos clases nuevas: una dark:bg-... y una dark:text-....',
            'Queda: className="p-6 rounded-xl bg-white text-slate-900 dark:bg-slate-800 dark:text-white".',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <div className="p-6 rounded-xl bg-white text-slate-900 dark:bg-slate-800 dark:text-white">
      <h1 className="text-xl font-bold">Resumen del mes</h1>
      <p>Llevas gastado $ 120000</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Resumen del mes', label: 'Se ve el título "Resumen del mes"' },
            {
              type: 'class',
              selector: 'div',
              pattern: '^bg-[a-z]+(-\\d+)?$',
              label: 'La tarjeta conserva su fondo normal',
              message: 'No borres la clase bg-white; solo añade la de dark:.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^dark:bg-',
              label: 'En modo oscuro cambia el fondo (dark:bg-)',
              message: 'Añade dark:bg-slate-800 al className del div.',
            },
            {
              type: 'class',
              selector: 'div',
              pattern: '^dark:text-',
              label: 'En modo oscuro cambia el color de letra (dark:text-)',
              message: 'Añade dark:text-white al className del div.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm06-l4-c2',
          title: 'Panel de resumen completo',
          instructions:
            'Junta todo en `/src/components/Resumen.jsx`. Ya muestra tres datos. Déjalo así:\n\n- El contenedor (`section`): `grid`, `grid-cols-1` y `md:grid-cols-3`, `gap-4`.\n- Cada dato (`div`): `p-4`, `rounded-xl`, `bg-white` con `dark:bg-slate-800`, y `hover:shadow-lg`.\n- Dentro de cada dato, una fila `flex` con `justify-between` (nombre a la izquierda, monto a la derecha).\n\nEl texto debe seguir mostrando **Comida**, **Transporte** y **Ocio**. En la vista previa no verás el modo oscuro a menos que tu computador (o tu navegador) esté en modo oscuro; es normal, no está roto.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Resumen from './components/Resumen.jsx'

export default function App() {
  return (
    <main className="p-6 bg-gray-100 dark:bg-slate-900 dark:text-white min-h-screen">
      <Resumen />
    </main>
  )
}
`,
            '/src/components/Resumen.jsx': `export default function Resumen() {
  return (
    <section>
      <div>
        <p>Comida</p>
        <p>$ 80000</p>
      </div>
      <div>
        <p>Transporte</p>
        <p>$ 30000</p>
      </div>
      <div>
        <p>Ocio</p>
        <p>$ 45000</p>
      </div>
    </section>
  )
}
`,
          },
          activeFile: '/src/components/Resumen.jsx',
          hints: [
            'El section lleva la cuadrícula; cada div de afuera lleva la tarjeta; y la fila flex va en un div nuevo (o en el propio div) con los dos párrafos.',
            'Más simple: pon flex justify-between directamente en cada div junto a p-4 rounded-xl bg-white dark:bg-slate-800 hover:shadow-lg. Así los dos párrafos quedan a los extremos.',
            'section: "grid grid-cols-1 md:grid-cols-3 gap-4". Cada div: "flex justify-between p-4 rounded-xl bg-white dark:bg-slate-800 hover:shadow-lg".',
          ],
          solution: {
            '/src/components/Resumen.jsx': `export default function Resumen() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex justify-between p-4 rounded-xl bg-white dark:bg-slate-800 hover:shadow-lg">
        <p>Comida</p>
        <p>$ 80000</p>
      </div>
      <div className="flex justify-between p-4 rounded-xl bg-white dark:bg-slate-800 hover:shadow-lg">
        <p>Transporte</p>
        <p>$ 30000</p>
      </div>
      <div className="flex justify-between p-4 rounded-xl bg-white dark:bg-slate-800 hover:shadow-lg">
        <p>Ocio</p>
        <p>$ 45000</p>
      </div>
    </section>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'text', match: 'Comida', label: 'Se ve "Comida"' },
            { type: 'text', match: 'Transporte', label: 'Se ve "Transporte"' },
            { type: 'text', match: 'Ocio', label: 'Se ve "Ocio"' },
            {
              type: 'class',
              selector: 'section',
              pattern: '^grid$',
              label: 'El panel usa grid',
              message: 'Añade grid al className del <section>.',
            },
            {
              type: 'class',
              selector: 'section',
              pattern: '^grid-cols-1$',
              label: 'En celular, 1 columna (grid-cols-1)',
              message: 'Añade grid-cols-1 al className del <section>.',
            },
            {
              type: 'class',
              selector: 'section',
              pattern: '^md:grid-cols-[2-6]$',
              label: 'En pantalla mediana, 3 columnas (md:grid-cols-3)',
              message: 'Añade md:grid-cols-3 al className del <section>.',
            },
            {
              type: 'class',
              selector: 'section div',
              pattern: '^flex$',
              label: 'Los datos usan flex',
              message: 'Añade flex a cada div dentro del <section>.',
            },
            {
              type: 'class',
              selector: 'section div',
              pattern: '^justify-between$',
              label: 'Los datos separan nombre y monto (justify-between)',
              message: 'Añade justify-between a cada div dentro del <section>.',
            },
            {
              type: 'class',
              selector: 'section div',
              pattern: '^p-\\d+$',
              label: 'Los datos tienen espacio interno (p-)',
              message: 'Añade p-4 a cada div dentro del <section>.',
            },
            {
              type: 'class',
              selector: 'section div',
              pattern: '^dark:bg-[a-z]+-\\d+$',
              label: 'Los datos tienen fondo para modo oscuro (dark:bg-)',
              message: 'Añade dark:bg-slate-800 a cada div dentro del <section>.',
            },
            {
              type: 'class',
              selector: 'section div',
              pattern: '^hover:shadow',
              label: 'Los datos reaccionan al ratón (hover:shadow-)',
              message: 'Añade hover:shadow-lg a cada div dentro del <section>.',
            },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
