// Tipo de Router de los ejemplos. MemoryRouter lleva la cuenta de la página en la memoria de la app
// y no depende de la dirección real del navegador, que dentro de la vista previa (un iframe) no es la nuestra.
const ROUTER = 'MemoryRouter'

const DEPS = { 'react-router': '^7' }

const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

const MAIN_ROUTER = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ${ROUTER} } from 'react-router'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <${ROUTER}>
      <App />
    </${ROUTER}>
  </StrictMode>,
)
`

// ---- Páginas y datos de partida compartidos ----

const INICIO = `export default function Inicio() {
  return <h1>Bienvenido a Gastos</h1>
}
`

const GASTOS_PAGE = `export default function Gastos() {
  return <h1>Lista de gastos</h1>
}
`

const ACERCA = `export default function Acerca() {
  return <h1>Acerca de la app</h1>
}
`

const DATOS = `export const GASTOS = [
  { id: 1, nombre: 'Taxi', monto: 80 },
  { id: 2, nombre: 'Cena', monto: 40 },
  { id: 3, nombre: 'Cine', monto: 120 },
]
`

const DETALLE = `import { useParams } from 'react-router'
import { GASTOS } from '../datos.js'

export default function Detalle() {
  const { id } = useParams()
  const gasto = GASTOS.find((g) => g.id === Number(id))

  if (!gasto) {
    return <p>Ese gasto no existe</p>
  }

  return (
    <section>
      <h1>Detalle: {gasto.nombre}</h1>
      <p>Monto: {gasto.monto}</p>
    </section>
  )
}
`

const NO_ENCONTRADA = `import { Link } from 'react-router'

export default function NoEncontrada() {
  return (
    <section>
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </section>
  )
}
`

const modulo = {
  id: 'm10',
  title: 'Navegación',
  summary: 'Crea una app con varias páginas usando React Router: rutas, enlaces, parámetros y página de error.',
  lessons: [
    {
      id: 'm10-l1',
      title: 'Rutas y enlaces',
      explanation: `Hasta ahora tus apps tenían una sola pantalla. Una app de verdad tiene varias "páginas": inicio, lista, detalle... **React Router** es la librería (una caja de herramientas ya hecha por otros) que las maneja.

Aquí "ruta" significa una página de tu app (por ejemplo \`/gastos\`), no la ruta de un archivo que escribías en los \`import\`.

Piensa en la recepción de un edificio: te preguntan a dónde vas y te mandan a la oficina correcta. Aquí:

- **Router** (\`${ROUTER}\`) es la recepción. Se coloca una sola vez, envolviendo la app (normalmente en \`main.jsx\`).
- **Routes** es la lista de oficinas, y cada **Route** dice "si la dirección es esta (\`path\`), muestra este componente (\`element\`)".
- **Link** es el letrero que te lleva a otra oficina sin recargar la página.

\`\`\`jsx
import { Routes, Route, Link } from 'react-router'

<Link to="/gastos">Ver gastos</Link>

<Routes>
  <Route path="/" element={<Inicio />} />
  <Route path="/gastos" element={<Gastos />} />
</Routes>
\`\`\`

\`"/"\` es la página principal. Importa todo desde \`'react-router'\`.

Una nota: normalmente se usa \`BrowserRouter\`, que lee y cambia la dirección de la barra del navegador. Aquí usamos \`MemoryRouter\`, que recuerda en qué página vas dentro de la propia app, como un marcador de libro. Para ti funciona igual y no depende de la dirección de esta vista previa. Todo lo demás (\`Routes\`, \`Route\`, \`Link\`) es idéntico.

Cada página suele ser un componente en \`/src/pages\`.`,
      challenges: [
        {
          id: 'm10-l1-c1',
          title: 'Prepara el Router',
          instructions:
            'La app ya tiene sus rutas, pero la vista previa muestra un error porque falta la "recepción". En `main.jsx` importa `' +
            ROUTER +
            "` desde `'react-router'` y envuelve `<App />` con él. Debe verse el título **Bienvenido a Gastos**.",
          files: {
            '/src/main.jsx': MAIN,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/App.jsx': `import { Routes, Route } from 'react-router'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
    </Routes>
  )
}
`,
          },
          activeFile: '/src/main.jsx',
          dependencies: DEPS,
          hints: [
            'El error dice que las rutas necesitan estar dentro de un Router. Ese Router se pone en main.jsx, alrededor de <App />.',
            `Arriba de main.jsx añade: import { ${ROUTER} } from 'react-router'. Luego escribe <${ROUTER}> antes de <App /> y </${ROUTER}> después.`,
            `Debe quedar: <${ROUTER}> <App /> </${ROUTER}> dentro de <StrictMode>. Revisa que el import use 'react-router' y las llaves { }.`,
          ],
          solution: { '/src/main.jsx': MAIN_ROUTER },
          checks: [
            {
              type: 'file-includes',
              path: '/src/main.jsx',
              pattern: "import\\s*\\{[^}]*(Browser|Hash|Memory)Router[^}]*\\}\\s*from\\s*['\"]react-router['\"]",
              label: "main.jsx importa el Router desde 'react-router'",
              message: `Falta en main.jsx: import { ${ROUTER} } from 'react-router'.`,
            },
            {
              type: 'file-includes',
              path: '/src/main.jsx',
              pattern: '<(Browser|Hash|Memory)Router',
              label: 'main.jsx envuelve <App /> con el Router',
              message: `Falta envolver <App /> con <${ROUTER}> ... </${ROUTER}>.`,
            },
            { type: 'role', role: 'heading', name: 'Bienvenido a Gastos', label: 'Se ve el título "Bienvenido a Gastos"' },
          ],
          xp: 10,
        },
        {
          id: 'm10-l1-c2',
          title: 'Dos páginas con Link',
          instructions:
            'Ya existe la página `Gastos.jsx`, pero nadie llega a ella. En `App.jsx` agrega una ruta con `path="/gastos"` que muestre `<Gastos />`, y un `Link` con el texto **Ver gastos** que lleve a `/gastos`. Al hacer clic en el enlace debe aparecer **Lista de gastos**.',
          files: {
            '/src/main.jsx': MAIN_ROUTER,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/pages/Gastos.jsx': GASTOS_PAGE,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
      </Routes>
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          dependencies: DEPS,
          hints: [
            'Hay que hacer dos cosas en App.jsx: un Link nuevo dentro de <nav> y una Route nueva dentro de <Routes>.',
            "Importa la página: import Gastos from './pages/Gastos.jsx'. El enlace es <Link to=\"/gastos\">Ver gastos</Link>.",
            'La ruta es <Route path="/gastos" element={<Gastos />} />. Va dentro de <Routes>, debajo de la ruta del inicio.',
          ],
          solution: {
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Gastos from './pages/Gastos.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gastos">Ver gastos</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/gastos" element={<Gastos />} />
      </Routes>
    </main>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'path\\s*=\\s*[\'"]/gastos[\'"]',
              label: 'Existe una ruta con path="/gastos"',
              message: 'Falta en App.jsx: <Route path="/gastos" element={<Gastos />} />.',
            },
            { type: 'role', role: 'link', name: 'Ver gastos', label: 'Hay un enlace "Ver gastos"' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Ver gastos' }],
              expect: { type: 'text', match: 'Lista de gastos' },
              label: 'Al hacer clic en "Ver gastos" aparece "Lista de gastos"',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm10-l2',
      title: 'Menú y página no encontrada',
      explanation: `Un menú de navegación es solo un grupo de \`Link\` que se queda arriba mientras las páginas cambian debajo. Lo que pongas **fuera** de \`<Routes>\` se ve siempre; lo que está **dentro** cambia según la dirección.

¿Y si alguien escribe una dirección que no existe? Es como llegar a un edificio y pedir una oficina que no hay. Para eso se usa una ruta comodín con \`path="*"\`: significa "cualquier otra dirección" y se pone al final.

\`\`\`jsx
<nav>
  <Link to="/">Inicio</Link>
  <Link to="/acerca">Acerca</Link>
</nav>

<Routes>
  <Route path="/" element={<Inicio />} />
  <Route path="/acerca" element={<Acerca />} />
  <Route path="*" element={<NoEncontrada />} />
</Routes>
\`\`\``,
      challenges: [
        {
          id: 'm10-l2-c1',
          title: 'Un menú con tres enlaces',
          instructions:
            'Las tres rutas ya existen pero no hay cómo moverse. Agrega dentro de `<nav>` tres enlaces con los textos **Inicio**, **Gastos** y **Acerca** que lleven a `/`, `/gastos` y `/acerca`. Al hacer clic en **Acerca** debe aparecer **Acerca de la app**.',
          files: {
            '/src/main.jsx': MAIN_ROUTER,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/pages/Gastos.jsx': GASTOS_PAGE,
            '/src/pages/Acerca.jsx': ACERCA,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Gastos from './pages/Gastos.jsx'
import Acerca from './pages/Acerca.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/acerca" element={<Acerca />} />
      </Routes>
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          dependencies: DEPS,
          hints: [
            'Dentro de <nav> y </nav> van tres etiquetas <Link>. Cada una lleva to="..." con la dirección y el texto visible entre las etiquetas.',
            'El primero es <Link to="/">Inicio</Link>. Los otros dos siguen el mismo patrón con "/gastos" y "/acerca".',
            'Debe quedar: <Link to="/">Inicio</Link> <Link to="/gastos">Gastos</Link> <Link to="/acerca">Acerca</Link>, uno debajo del otro dentro de <nav>.',
          ],
          solution: {
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Gastos from './pages/Gastos.jsx'
import Acerca from './pages/Acerca.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gastos">Gastos</Link>
        <Link to="/acerca">Acerca</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/acerca" element={<Acerca />} />
      </Routes>
    </main>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'link', min: 3, label: 'Hay al menos tres enlaces en el menú' },
            { type: 'role', role: 'link', name: 'Inicio', label: 'Hay un enlace "Inicio"' },
            { type: 'role', role: 'link', name: 'Gastos', label: 'Hay un enlace "Gastos"' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Gastos' }],
              expect: { type: 'text', match: 'Lista de gastos' },
              label: 'El enlace "Gastos" lleva a "Lista de gastos"',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Acerca' }],
              expect: { type: 'text', match: 'Acerca de la app' },
              label: 'El enlace "Acerca" lleva a "Acerca de la app"',
            },
          ],
          xp: 10,
        },
        {
          id: 'm10-l2-c2',
          title: 'Página no encontrada',
          instructions:
            'El menú tiene un **Enlace roto** que va a `/nada`, una dirección que no existe. Crea el archivo `/src/pages/NoEncontrada.jsx` (pulsa **Nuevo archivo** y en **Nombre del archivo** escribe `pages/NoEncontrada.jsx`) con un título **Página no encontrada** y un `Link` **Volver al inicio** hacia `/`. Después agrega en `App.jsx` la ruta comodín `path="*"` (al final de `<Routes>`).',
          files: {
            '/src/main.jsx': MAIN_ROUTER,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/nada">Enlace roto</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
      </Routes>
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          dependencies: DEPS,
          hints: [
            'Crea primero el archivo /src/pages/NoEncontrada.jsx: un componente con un <h1> y un <Link>. Recuerda importar Link desde react-router y usar export default.',
            "En App.jsx importa NoEncontrada desde './pages/NoEncontrada.jsx'. La ruta comodín es <Route path=\"*\" element={<NoEncontrada />} />.",
            'El título lleva el texto Página no encontrada y el enlace es <Link to="/">Volver al inicio</Link>. La ruta con * va después de las demás dentro de <Routes>.',
          ],
          solution: {
            '/src/pages/NoEncontrada.jsx': NO_ENCONTRADA,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/nada">Enlace roto</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </main>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/pages/NoEncontrada\\.jsx?$',
              label: 'Existe /src/pages/NoEncontrada.jsx',
              message: 'Falta crear el archivo /src/pages/NoEncontrada.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'path\\s*=\\s*[\'"]\\*[\'"]',
              label: 'Existe una ruta comodín path="*"',
              message: 'Falta en App.jsx: <Route path="*" element={<NoEncontrada />} />.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Enlace roto' }],
              expect: { type: 'role', role: 'heading', name: 'Página no encontrada' },
              label: 'Al seguir el enlace roto aparece "Página no encontrada"',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Volver al inicio' }],
              expect: { type: 'text', match: 'Bienvenido a Gastos' },
              label: '"Volver al inicio" te regresa a "Bienvenido a Gastos"',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm10-l3',
      title: 'Parámetros en la dirección',
      explanation: `Imagina un edificio con cien departamentos idénticos: no vas a escribir cien rutas. Escribes una sola con un **hueco**: "departamento número ___". En React Router el hueco se escribe con dos puntos:

\`\`\`jsx
<Route path="/gasto/:id" element={<Detalle />} />
\`\`\`

Esa ruta atiende \`/gasto/1\`, \`/gasto/2\`, \`/gasto/77\`... Dentro de \`Detalle\` lees el número con el hook \`useParams\`:

\`\`\`jsx
import { useParams } from 'react-router'

const { id } = useParams()
\`\`\`

Ojo: \`id\` llega siempre como **texto** (\`"2"\`). Si lo vas a comparar con un número, conviértelo con \`Number(id)\`.

Y para buscar un elemento de una lista por su id: \`GASTOS.find((g) => g.id === Number(id))\` devuelve el primero que cumpla, o \`undefined\` si no hay ninguno.`,
      challenges: [
        {
          id: 'm10-l3-c1',
          title: 'Una ruta con hueco',
          instructions:
            'Los enlaces **Gasto 1** y **Gasto 2** llevan a `/gasto/1` y `/gasto/2`, pero no hay ruta para ellos. Agrega en `App.jsx` una sola ruta `/gasto/:id` que muestre `<Detalle />`. Al hacer clic en **Gasto 2** debe verse **Detalle del gasto 2**.',
          files: {
            '/src/main.jsx': MAIN_ROUTER,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/pages/Detalle.jsx': `import { useParams } from 'react-router'

export default function Detalle() {
  const { id } = useParams()
  return <h1>Detalle del gasto {id}</h1>
}
`,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gasto/1">Gasto 1</Link>
        <Link to="/gasto/2">Gasto 2</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
      </Routes>
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          dependencies: DEPS,
          hints: [
            "Falta importar Detalle (import Detalle from './pages/Detalle.jsx') y añadir una Route dentro de <Routes>.",
            'El hueco de la dirección se escribe con dos puntos y un nombre: path="/gasto/:id". El nombre debe coincidir con el que usa Detalle.jsx en useParams.',
            'Escribe <Route path="/gasto/:id" element={<Detalle />} /> debajo de la ruta del inicio.',
          ],
          solution: {
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Detalle from './pages/Detalle.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gasto/1">Gasto 1</Link>
        <Link to="/gasto/2">Gasto 2</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/gasto/:id" element={<Detalle />} />
      </Routes>
    </main>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'path\\s*=\\s*[\'"]/gasto/:id[\'"]',
              label: 'Existe una ruta con path="/gasto/:id"',
              message: 'Falta en App.jsx: <Route path="/gasto/:id" element={<Detalle />} />.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Gasto 2' }],
              expect: { type: 'text', match: 'Detalle del gasto 2' },
              label: '"Gasto 2" muestra "Detalle del gasto 2"',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Gasto 1' }],
              expect: { type: 'text', match: 'Detalle del gasto 1' },
              label: '"Gasto 1" muestra "Detalle del gasto 1"',
            },
          ],
          xp: 10,
        },
        {
          id: 'm10-l3-c2',
          title: 'Lee el parámetro y busca el gasto',
          instructions:
            'Ahora `Detalle.jsx` es una página fija. Haz que lea el `id` de la dirección con `useParams`, busque ese gasto en la lista `GASTOS` (archivo `datos.js`) y muestre su monto con el formato **Monto: 40** (para Cena; para Taxi sería **Monto: 80**). Si el gasto no existe, debe decir **Ese gasto no existe**.',
          files: {
            '/src/main.jsx': MAIN_ROUTER,
            '/src/datos.js': DATOS,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/pages/Detalle.jsx': `export default function Detalle() {
  return <h1>Detalle</h1>
}
`,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Detalle from './pages/Detalle.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gasto/1">Taxi</Link>
        <Link to="/gasto/2">Cena</Link>
        <Link to="/gasto/99">Gasto fantasma</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/gasto/:id" element={<Detalle />} />
      </Routes>
    </main>
  )
}
`,
          },
          activeFile: '/src/pages/Detalle.jsx',
          dependencies: DEPS,
          hints: [
            'Importa useParams y GASTOS (el archivo datos.js está en /src, así que desde pages se sube una carpeta con ../). Dentro de la función saca el id: const { id } = useParams().',
            'Busca el gasto: const gasto = GASTOS.find((g) => g.id === Number(id)). Si no hay ninguno, gasto vale undefined.',
            'Antes del return principal: if (!gasto) { return <p>Ese gasto no existe</p> }. Después muestra <h1>Detalle: {gasto.nombre}</h1> y <p>Monto: {gasto.monto}</p>.',
          ],
          solution: { '/src/pages/Detalle.jsx': DETALLE },
          checks: [
            {
              type: 'file-includes',
              path: '/src/pages/Detalle.jsx',
              pattern: 'useParams\\s*\\(',
              label: 'Detalle usa useParams',
              message: 'Falta leer el parámetro: const { id } = useParams().',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Cena' }],
              expect: { type: 'text', match: 'Monto: 40' },
              label: 'El gasto "Cena" muestra "Monto: 40"',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Taxi' }],
              expect: { type: 'text', match: 'Monto: 80' },
              label: 'El gasto "Taxi" muestra "Monto: 80"',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Gasto fantasma' }],
              expect: { type: 'text', match: 'Ese gasto no existe' },
              label: 'Un gasto inexistente muestra "Ese gasto no existe"',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm10-l4',
      title: 'Todo junto',
      explanation: `Ya tienes todas las piezas de una app con varias páginas:

1. \`${ROUTER}\` en \`main.jsx\`.
2. Un menú de \`Link\` fuera de \`<Routes>\`.
3. Rutas normales, una ruta con parámetro (\`/gasto/:id\`) y una ruta comodín \`*\`.
4. Páginas en \`/src/pages\` y datos en su propio archivo.

Un truco muy común: una lista donde cada elemento es un enlace a su página de detalle. El destino se arma uniendo texto y el id:

\`\`\`jsx
<li key={g.id}>
  <Link to={'/gasto/' + g.id}>{g.nombre}</Link>
</li>
\`\`\`

Con eso, tu app de gastos de práctica queda lista para el proyecto final.`,
      challenges: [
        {
          id: 'm10-l4-c1',
          title: 'Una lista que lleva al detalle',
          instructions:
            'La página `Gastos.jsx` solo tiene un título. Haz que muestre una lista (`ul`) con un elemento por cada gasto de `GASTOS`, y que cada nombre sea un `Link` a `/gasto/` + su id. Al hacer clic en el menú **Gastos** debe verse **Lista de gastos** con tres elementos, y al hacer clic en **Cena** debe verse **Monto: 40**.',
          files: {
            '/src/main.jsx': MAIN_ROUTER,
            '/src/datos.js': DATOS,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/pages/Detalle.jsx': DETALLE,
            '/src/pages/Gastos.jsx': GASTOS_PAGE,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Gastos from './pages/Gastos.jsx'
import Detalle from './pages/Detalle.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gastos">Gastos</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/gasto/:id" element={<Detalle />} />
      </Routes>
    </main>
  )
}
`,
          },
          activeFile: '/src/pages/Gastos.jsx',
          dependencies: DEPS,
          hints: [
            "Importa Link desde 'react-router' y GASTOS desde '../datos.js'. Recorre la lista con map, igual que en el módulo de listas.",
            'Cada elemento es <li key={g.id}> con un <Link> dentro. No olvides la key en el <li>.',
            "El enlace es <Link to={'/gasto/' + g.id}>{g.nombre}</Link>. Se ve en un <ul>{GASTOS.map((g) => ( ... ))}</ul> debajo del <h1>.",
          ],
          solution: {
            '/src/pages/Gastos.jsx': `import { Link } from 'react-router'
import { GASTOS } from '../datos.js'

export default function Gastos() {
  return (
    <section>
      <h1>Lista de gastos</h1>
      <ul>
        {GASTOS.map((g) => (
          <li key={g.id}>
            <Link to={'/gasto/' + g.id}>{g.nombre}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
`,
          },
          checks: [
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Gastos' }],
              expect: { type: 'role', role: 'listitem', min: 3 },
              label: 'La lista tiene un elemento por gasto (3)',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'link', name: 'Gastos' },
                { action: 'click', role: 'link', name: 'Cena' },
              ],
              expect: { type: 'text', match: 'Monto: 40' },
              label: 'Desde la lista, hacer clic en "Cena" muestra "Monto: 40"',
            },
          ],
          xp: 15,
        },
        {
          id: 'm10-l4-c2',
          title: 'Mini app de gastos con páginas',
          instructions:
            'Arma la app completa. Ya tienes `Inicio.jsx`, `datos.js` y un menú con **Inicio**, **Gastos** y **Enlace roto** (hacia `/nada`). Crea tres páginas en `/src/pages` (pulsa **Nuevo archivo** y en **Nombre del archivo** escribe algo como `pages/Gastos.jsx`):\n\n- `Gastos.jsx`: título **Lista de gastos** y la lista de gastos, cada nombre es un enlace a su detalle.\n- `Detalle.jsx`: lee el `id` con `useParams`, muestra el monto con el formato **Monto: 120** (para Cine) y un enlace **Volver a la lista** hacia `/gastos`.\n- `NoEncontrada.jsx`: título **Página no encontrada**.\n\nLuego registra las 4 rutas en `App.jsx`: `/`, `/gastos`, `/gasto/:id` y la comodín `*`.',
          files: {
            '/src/main.jsx': MAIN_ROUTER,
            '/src/datos.js': DATOS,
            '/src/pages/Inicio.jsx': INICIO,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gastos">Gastos</Link>
        <Link to="/nada">Enlace roto</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
      </Routes>
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          dependencies: DEPS,
          hints: [
            'Hazlo por partes: primero crea Gastos.jsx y su ruta, prueba el menú; luego Detalle.jsx con su ruta; al final NoEncontrada.jsx con la ruta *.',
            'Gastos.jsx usa GASTOS.map con <Link to={\'/gasto/\' + g.id}>. Detalle.jsx usa const { id } = useParams() y GASTOS.find((g) => g.id === Number(id)).',
            'Rutas: path="/" Inicio, path="/gastos" Gastos, path="/gasto/:id" Detalle, path="*" NoEncontrada (la última). Detalle lleva <Link to="/gastos">Volver a la lista</Link>.',
          ],
          solution: {
            '/src/pages/Gastos.jsx': `import { Link } from 'react-router'
import { GASTOS } from '../datos.js'

export default function Gastos() {
  return (
    <section>
      <h1>Lista de gastos</h1>
      <ul>
        {GASTOS.map((g) => (
          <li key={g.id}>
            <Link to={'/gasto/' + g.id}>{g.nombre}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
`,
            '/src/pages/Detalle.jsx': `import { Link, useParams } from 'react-router'
import { GASTOS } from '../datos.js'

export default function Detalle() {
  const { id } = useParams()
  const gasto = GASTOS.find((g) => g.id === Number(id))

  if (!gasto) {
    return <p>Ese gasto no existe</p>
  }

  return (
    <section>
      <h1>Detalle: {gasto.nombre}</h1>
      <p>Monto: {gasto.monto}</p>
      <Link to="/gastos">Volver a la lista</Link>
    </section>
  )
}
`,
            '/src/pages/NoEncontrada.jsx': `export default function NoEncontrada() {
  return <h1>Página no encontrada</h1>
}
`,
            '/src/App.jsx': `import { Routes, Route, Link } from 'react-router'
import Inicio from './pages/Inicio.jsx'
import Gastos from './pages/Gastos.jsx'
import Detalle from './pages/Detalle.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

export default function App() {
  return (
    <main className="p-4">
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/gastos">Gastos</Link>
        <Link to="/nada">Enlace roto</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/gasto/:id" element={<Detalle />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </main>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/pages/Gastos\\.jsx?$',
              label: 'Existe /src/pages/Gastos.jsx',
              message: 'Falta crear /src/pages/Gastos.jsx.',
            },
            {
              type: 'file-exists',
              pattern: '^/src/pages/Detalle\\.jsx?$',
              label: 'Existe /src/pages/Detalle.jsx',
              message: 'Falta crear /src/pages/Detalle.jsx.',
            },
            {
              type: 'file-exists',
              pattern: '^/src/pages/NoEncontrada\\.jsx?$',
              label: 'Existe /src/pages/NoEncontrada.jsx',
              message: 'Falta crear /src/pages/NoEncontrada.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'path\\s*=\\s*[\'"]/gasto/:id[\'"]',
              label: 'Hay una ruta con parámetro /gasto/:id',
              message: 'Falta en App.jsx la ruta <Route path="/gasto/:id" element={<Detalle />} />.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'path\\s*=\\s*[\'"]\\*[\'"]',
              label: 'Hay una ruta comodín path="*"',
              message: 'Falta en App.jsx la ruta <Route path="*" element={<NoEncontrada />} />.',
            },
            {
              type: 'file-includes',
              path: '/src/pages/Detalle.jsx',
              pattern: 'useParams\\s*\\(',
              label: 'Detalle usa useParams',
              message: 'Falta en Detalle.jsx: const { id } = useParams().',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Gastos' }],
              expect: { type: 'text', match: 'Lista de gastos' },
              label: 'El menú "Gastos" muestra "Lista de gastos"',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Cine' }],
              expect: { type: 'text', match: 'Monto: 120' },
              label: 'Hacer clic en "Cine" muestra "Monto: 120"',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Volver a la lista' }],
              expect: { type: 'text', match: 'Lista de gastos' },
              label: '"Volver a la lista" regresa a la lista',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'link', name: 'Enlace roto' }],
              expect: { type: 'role', role: 'heading', name: 'Página no encontrada' },
              label: 'El enlace roto muestra "Página no encontrada"',
            },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
