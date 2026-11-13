const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

// ---- Textos de partida compartidos ----

const USE_CONTADOR_FIJO = `import { useState } from 'react'

export default function useContador() {
  const [cuenta, setCuenta] = useState(0)

  function sumar() {
    setCuenta(cuenta + 1)
  }

  function restar() {
    setCuenta(cuenta - 1)
  }

  return { cuenta, sumar, restar }
}
`

const USE_CONTADOR_INICIAL = `import { useState } from 'react'

export default function useContador(inicial = 0) {
  const [cuenta, setCuenta] = useState(inicial)

  function sumar() {
    setCuenta(cuenta + 1)
  }

  function restar() {
    setCuenta(cuenta - 1)
  }

  function reiniciar() {
    setCuenta(inicial)
  }

  return { cuenta, sumar, restar, reiniciar }
}
`

const TEMA_CONTEXT_SIMPLE = `import { createContext } from 'react'

export const TemaContext = createContext('claro')
`

const modulo = {
  id: 'm09',
  title: 'Organización pro',
  summary: 'Guarda tu lógica en hooks propios, comparte datos con Context y ordena tu proyecto en carpetas.',
  lessons: [
    {
      id: 'm09-l1',
      title: 'Tu propio hook',
      explanation: `Un **hook** es una función especial de React que empieza con \`use\` (como \`useState\`). Puedes crear los tuyos.

Imagina una receta de cocina escrita en una tarjeta: en vez de explicar los pasos cada vez, guardas la tarjeta y la usas en cualquier cocina. Un hook propio es esa tarjeta: guardas la lógica (el estado y las funciones) en un archivo y la reutilizas en varios componentes.

Reglas sencillas:

- El nombre empieza con \`use\` (por ejemplo \`useContador\`).
- Dentro puedes usar \`useState\` y otros hooks.
- Devuelve lo que los demás necesitan, normalmente un objeto.

\`\`\`jsx
// src/hooks/useContador.js
import { useState } from 'react'

export default function useContador() {
  const [cuenta, setCuenta] = useState(0)
  return { cuenta, setCuenta }
}

// en un componente
const { cuenta, setCuenta } = useContador()
\`\`\`

Los archivos de hooks van en una carpeta \`/src/hooks\`. Para crear un archivo dentro de una carpeta, en "Nombre del archivo" escribe la carpeta y el nombre, por ejemplo \`hooks/useContador.js\` (la carpeta se crea sola). No tienen JSX, así que pueden terminar en \`.js\`.`,
      challenges: [
        {
          id: 'm09-l1-c1',
          title: 'Saca la cuenta a un hook',
          instructions:
            'Ahora `App.jsx` lleva la cuenta él solo. Crea el archivo `/src/hooks/useContador.js` (en "Nombre del archivo" escribe `hooks/useContador.js`) con un hook `useContador` que tenga el estado y las funciones `sumar` y `restar`, y devuélvelos en un objeto. Después úsalo en `App.jsx` (importa el hook y llámalo). Al pulsar **Sumar** la página debe mostrar **Cuenta: 1**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [cuenta, setCuenta] = useState(0)

  function sumar() {
    setCuenta(cuenta + 1)
  }

  function restar() {
    setCuenta(cuenta - 1)
  }

  return (
    <main className="p-4">
      <p>Cuenta: {cuenta}</p>
      <button onClick={sumar}>Sumar</button>
      <button onClick={restar}>Restar</button>
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Crea el archivo /src/hooks/useContador.js. Mueve allá el useState y las dos funciones, dentro de una función llamada useContador.',
            'El hook termina con return { cuenta, sumar, restar } y se ofrece con export default. No olvides importar useState arriba del archivo del hook.',
            "En App.jsx borra el estado y las funciones, añade import useContador from './hooks/useContador.js' y escribe const { cuenta, sumar, restar } = useContador() dentro de App.",
          ],
          solution: {
            '/src/hooks/useContador.js': USE_CONTADOR_FIJO,
            '/src/App.jsx': `import useContador from './hooks/useContador.js'

export default function App() {
  const { cuenta, sumar, restar } = useContador()

  return (
    <main className="p-4">
      <p>Cuenta: {cuenta}</p>
      <button onClick={sumar}>Sumar</button>
      <button onClick={restar}>Restar</button>
    </main>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/hooks/useContador\\.jsx?$',
              label: 'Existe /src/hooks/useContador.js',
              message: 'Falta crear el archivo /src/hooks/useContador.js (dentro de la carpeta hooks).',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+.+?\\s+from\\s+[\'"]\\./hooks/useContador(\\.jsx?)?[\'"]',
              label: 'App.jsx importa el hook',
              message: "Falta en App.jsx la línea import useContador from './hooks/useContador.js'.",
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'useContador\\s*\\(',
              label: 'App.jsx usa el hook',
              message: 'Falta llamar al hook dentro de App: const { cuenta, sumar, restar } = useContador().',
            },
            { type: 'text', match: 'Cuenta: 0', label: 'Al empezar la página dice "Cuenta: 0"' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Sumar' }],
              expect: { type: 'text', match: 'Cuenta: 1' },
              label: 'Al pulsar "Sumar" la cuenta sube a 1',
            },
          ],
          xp: 15,
        },
        {
          id: 'm09-l1-c2',
          title: 'Un hook con valor inicial',
          instructions:
            'Hay dos contadores: deben verse **Manzanas: 3** y **Naranjas: 0** al empezar. Cambia `useContador` para que reciba un valor inicial (por defecto 0) y agrega una función `reiniciar` que regrese la cuenta a ese valor. En `Contador.jsx` pásale el valor inicial al hook y añade un botón **Reiniciar**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/hooks/useContador.js': USE_CONTADOR_FIJO,
            '/src/components/Contador.jsx': `import useContador from '../hooks/useContador.js'

export default function Contador({ nombre, inicial }) {
  const { cuenta, sumar, restar } = useContador()

  return (
    <section className="p-2">
      <p>{nombre}: {cuenta}</p>
      <button onClick={sumar}>Sumar</button>
      <button onClick={restar}>Restar</button>
    </section>
  )
}
`,
            '/src/App.jsx': `import Contador from './components/Contador.jsx'

export default function App() {
  return (
    <main className="p-4">
      <Contador nombre="Manzanas" inicial={3} />
      <Contador nombre="Naranjas" />
    </main>
  )
}
`,
          },
          activeFile: '/src/hooks/useContador.js',
          hints: [
            'En el hook, la función puede recibir un dato entre paréntesis: useContador(inicial). Úsalo dentro de useState en lugar del 0 fijo.',
            'Para que "Naranjas" siga en 0 sin pasar nada, pon un valor por defecto: useContador(inicial = 0). Luego crea reiniciar con setCuenta(inicial) y agrégala al return.',
            'En Contador.jsx escribe useContador(inicial), saca también reiniciar del objeto y agrega <button onClick={reiniciar}>Reiniciar</button>.',
          ],
          solution: {
            '/src/hooks/useContador.js': USE_CONTADOR_INICIAL,
            '/src/components/Contador.jsx': `import useContador from '../hooks/useContador.js'

export default function Contador({ nombre, inicial }) {
  const { cuenta, sumar, restar, reiniciar } = useContador(inicial)

  return (
    <section className="p-2">
      <p>{nombre}: {cuenta}</p>
      <button onClick={sumar}>Sumar</button>
      <button onClick={restar}>Restar</button>
      <button onClick={reiniciar}>Reiniciar</button>
    </section>
  )
}
`,
          },
          checks: [
            { type: 'text', match: 'Manzanas: 3', label: 'Manzanas empieza en 3' },
            { type: 'text', match: 'Naranjas: 0', label: 'Naranjas empieza en 0' },
            { type: 'role', role: 'button', name: 'Reiniciar', min: 2, label: 'Cada contador tiene su botón "Reiniciar"' },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Sumar' },
                { action: 'click', role: 'button', name: 'Reiniciar' },
              ],
              expect: { type: 'text', match: 'Manzanas: 3' },
              label: 'Sumar y luego Reiniciar deja Manzanas otra vez en 3',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm09-l2',
      title: 'Carpetas con orden',
      explanation: `Cuando una casa crece, no guardas todo en un solo cajón: la ropa va en el clóset y las herramientas en el garaje. Con el proyecto pasa igual. Una organización muy usada:

- \`/src/components\`: las piezas de pantalla (botones, tarjetas, formularios).
- \`/src/hooks\`: tus hooks propios.
- \`/src/context\`: los "tablones compartidos" (los verás en la siguiente lección).

Al mover un archivo a una carpeta, cambia la **ruta** con la que lo importas:

- \`./\` significa "en esta misma carpeta".
- \`../\` significa "sube una carpeta".

\`\`\`jsx
// App.jsx está en /src
import Tarjeta from './components/Tarjeta.jsx'

// Contador.jsx está en /src/components y quiere algo de /src/hooks
import useContador from '../hooks/useContador.js'
\`\`\``,
      challenges: [
        {
          id: 'm09-l2-c1',
          title: 'Mueve una pieza a components',
          instructions:
            'En `App.jsx` la tarjeta está escrita junto con todo lo demás. Crea `/src/components/Tarjeta.jsx` (en "Nombre del archivo" escribe `components/Tarjeta.jsx`) con ese componente (con `export default`), bórralo de `App.jsx` e impórtalo desde la nueva carpeta. La página debe seguir mostrando los títulos **Café** y **Pan**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `function Tarjeta({ titulo, precio }) {
  return (
    <div className="border rounded p-3 mb-2">
      <h2>{titulo}</h2>
      <p>Precio: {precio} pesos</p>
    </div>
  )
}

export default function App() {
  return (
    <main className="p-4">
      <Tarjeta titulo="Café" precio={30} />
      <Tarjeta titulo="Pan" precio={15} />
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Crea el archivo /src/components/Tarjeta.jsx y copia allí la función Tarjeta completa.',
            'En el archivo nuevo pon export default delante de function Tarjeta. En App.jsx borra la función Tarjeta.',
            "En App.jsx añade arriba: import Tarjeta from './components/Tarjeta.jsx'. Desde /src la carpeta se escribe ./components/.",
          ],
          solution: {
            '/src/components/Tarjeta.jsx': `export default function Tarjeta({ titulo, precio }) {
  return (
    <div className="border rounded p-3 mb-2">
      <h2>{titulo}</h2>
      <p>Precio: {precio} pesos</p>
    </div>
  )
}
`,
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

export default function App() {
  return (
    <main className="p-4">
      <Tarjeta titulo="Café" precio={30} />
      <Tarjeta titulo="Pan" precio={15} />
    </main>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/Tarjeta\\.jsx$',
              label: 'Existe /src/components/Tarjeta.jsx',
              message: 'Falta crear el archivo /src/components/Tarjeta.jsx (dentro de la carpeta components).',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+.+?\\s+from\\s+[\'"]\\./components/Tarjeta(\\.jsx)?[\'"]',
              label: 'App.jsx importa Tarjeta desde components',
              message: "Falta en App.jsx la línea import Tarjeta from './components/Tarjeta.jsx'.",
            },
            { type: 'role', role: 'heading', name: 'Café', label: 'Se ve el título "Café"' },
            { type: 'role', role: 'heading', name: 'Pan', label: 'Se ve el título "Pan"' },
          ],
          xp: 10,
        },
        {
          id: 'm09-l2-c2',
          title: 'Arregla las rutas',
          instructions:
            'Alguien movió los archivos a sus carpetas pero las rutas de `import` quedaron mal y la vista previa muestra un error. Corrige los dos `import` para que aparezca **Vasos: 0** y, al pulsar **Sumar**, **Vasos: 1**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/hooks/useContador.js': USE_CONTADOR_FIJO,
            '/src/components/Contador.jsx': `import useContador from './useContador.js'

export default function Contador() {
  const { cuenta, sumar } = useContador()

  return (
    <section>
      <p>Vasos: {cuenta}</p>
      <button onClick={sumar}>Sumar</button>
    </section>
  )
}
`,
            '/src/App.jsx': `import Contador from './Contador.jsx'

export default function App() {
  return (
    <main className="p-4">
      <Contador />
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            "App.jsx está en /src y Contador.jsx está dentro de la carpeta components: la ruta debe pasar por esa carpeta.",
            "Para App.jsx la ruta correcta empieza con './components/'. Para Contador.jsx, el hook está en otra carpeta hermana: hay que subir una carpeta con '../' y entrar a hooks.",
            "Deben quedar: import Contador from './components/Contador.jsx' en App.jsx, e import useContador from '../hooks/useContador.js' en Contador.jsx.",
          ],
          solution: {
            '/src/components/Contador.jsx': `import useContador from '../hooks/useContador.js'

export default function Contador() {
  const { cuenta, sumar } = useContador()

  return (
    <section>
      <p>Vasos: {cuenta}</p>
      <button onClick={sumar}>Sumar</button>
    </section>
  )
}
`,
            '/src/App.jsx': `import Contador from './components/Contador.jsx'

export default function App() {
  return (
    <main className="p-4">
      <Contador />
    </main>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'from\\s+[\'"]\\./components/Contador(\\.jsx)?[\'"]',
              label: 'App.jsx importa Contador desde ./components/',
              message: "En App.jsx la ruta debe ser './components/Contador.jsx'.",
            },
            {
              type: 'file-includes',
              path: '/src/components/Contador.jsx',
              pattern: 'from\\s+[\'"]\\.\\./hooks/useContador(\\.js)?[\'"]',
              label: 'Contador.jsx importa el hook subiendo una carpeta',
              message: "En Contador.jsx la ruta debe ser '../hooks/useContador.js' (el ../ sube una carpeta).",
            },
            { type: 'text', match: 'Vasos: 0', label: 'La página muestra "Vasos: 0"' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Sumar' }],
              expect: { type: 'text', match: 'Vasos: 1' },
              label: 'Al pulsar "Sumar" aparece "Vasos: 1"',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm09-l3',
      title: 'Context: un tablón para todos',
      explanation: `Pasar datos por props es como entregar una nota de mano en mano: si la nota debe llegar al nieto, pasa por el padre y el abuelo aunque no la usen. **Context** es un tablón de anuncios en el pasillo: se cuelga el dato una vez y cualquier componente, por profundo que esté, lo puede leer.

Tres pasos:

1. **Crear** el tablón con \`createContext\` (en \`/src/context\`).
2. **Colgar** el dato envolviendo los componentes con \`<MiContext.Provider value={...}>\`.
3. **Leer** el dato en cualquier componente de adentro con \`useContext(MiContext)\`.

\`\`\`jsx
// src/context/TemaContext.jsx
import { createContext } from 'react'
export const TemaContext = createContext('claro')

// App.jsx
<TemaContext.Provider value="oscuro">
  <Panel />
</TemaContext.Provider>

// Panel.jsx
import { useContext } from 'react'
const tema = useContext(TemaContext)
\`\`\`

Fíjate en \`export const\` (sin \`default\`): se importa con llaves, \`import { TemaContext } from ...\`.`,
      challenges: [
        {
          id: 'm09-l3-c1',
          title: 'Lee del tablón',
          instructions:
            'El tablón `TemaContext` ya existe y `App.jsx` ya cuelga el valor `"oscuro"`. Haz que `Etiqueta.jsx` lo lea con `useContext` y muestre **Tema actual: oscuro**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/context/TemaContext.jsx': TEMA_CONTEXT_SIMPLE,
            '/src/components/Etiqueta.jsx': `export default function Etiqueta() {
  return <p>Tema actual: (no sé)</p>
}
`,
            '/src/App.jsx': `import { TemaContext } from './context/TemaContext.jsx'
import Etiqueta from './components/Etiqueta.jsx'

export default function App() {
  return (
    <TemaContext.Provider value="oscuro">
      <main className="p-4">
        <Etiqueta />
      </main>
    </TemaContext.Provider>
  )
}
`,
          },
          activeFile: '/src/components/Etiqueta.jsx',
          hints: [
            'En Etiqueta.jsx necesitas dos imports: useContext de react y TemaContext desde la carpeta context.',
            "TemaContext está en /src/context y Etiqueta en /src/components, así que la ruta es '../context/TemaContext.jsx'. Se importa con llaves: { TemaContext }.",
            'Dentro de la función escribe const tema = useContext(TemaContext) y muestra <p>Tema actual: {tema}</p>. Ojo: return ( en la misma línea si el JSX ocupa varias líneas.',
          ],
          solution: {
            '/src/components/Etiqueta.jsx': `import { useContext } from 'react'
import { TemaContext } from '../context/TemaContext.jsx'

export default function Etiqueta() {
  const tema = useContext(TemaContext)
  return <p>Tema actual: {tema}</p>
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/components/Etiqueta.jsx',
              pattern: 'useContext\\s*\\(\\s*TemaContext\\s*\\)',
              label: 'Etiqueta usa useContext(TemaContext)',
              message: 'Falta leer el tablón: const tema = useContext(TemaContext).',
            },
            { type: 'text', match: 'Tema actual: oscuro', label: 'La página dice "Tema actual: oscuro"' },
          ],
          xp: 10,
        },
        {
          id: 'm09-l3-c2',
          title: 'Crea tu propio Context',
          instructions:
            'Crea el tablón tú mismo: el archivo `/src/context/MonedaContext.jsx` (en "Nombre del archivo" escribe `context/MonedaContext.jsx`) con `export const MonedaContext = createContext(...)` (valor por defecto `"pesos"`). En `App.jsx` cuelga el valor `"euros"` con `MonedaContext.Provider`, y en `Precio.jsx` léelo con `useContext` para mostrar **50 euros**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Precio.jsx': `export default function Precio({ valor }) {
  return <p>{valor} pesos</p>
}
`,
            '/src/App.jsx': `import Precio from './components/Precio.jsx'

export default function App() {
  return (
    <main className="p-4">
      <Precio valor={50} />
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            "Crea /src/context/MonedaContext.jsx con: import { createContext } from 'react' y export const MonedaContext = createContext('pesos').",
            'En App.jsx importa { MonedaContext } y envuelve <Precio /> con <MonedaContext.Provider value="euros"> ... </MonedaContext.Provider>.',
            'En Precio.jsx importa useContext y MonedaContext (ruta ../context/MonedaContext.jsx), escribe const moneda = useContext(MonedaContext) y muestra <p>{valor} {moneda}</p>.',
          ],
          solution: {
            '/src/context/MonedaContext.jsx': `import { createContext } from 'react'

export const MonedaContext = createContext('pesos')
`,
            '/src/components/Precio.jsx': `import { useContext } from 'react'
import { MonedaContext } from '../context/MonedaContext.jsx'

export default function Precio({ valor }) {
  const moneda = useContext(MonedaContext)
  return <p>{valor} {moneda}</p>
}
`,
            '/src/App.jsx': `import { MonedaContext } from './context/MonedaContext.jsx'
import Precio from './components/Precio.jsx'

export default function App() {
  return (
    <MonedaContext.Provider value="euros">
      <main className="p-4">
        <Precio valor={50} />
      </main>
    </MonedaContext.Provider>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/context/MonedaContext\\.jsx?$',
              label: 'Existe /src/context/MonedaContext.jsx',
              message: 'Falta crear el archivo /src/context/MonedaContext.jsx.',
            },
            {
              type: 'file-includes',
              pattern: 'export\\s+const\\s+MonedaContext\\s*=\\s*createContext\\s*\\(',
              label: 'El archivo crea el contexto con createContext',
              message: "Falta export const MonedaContext = createContext('pesos').",
            },
            {
              type: 'file-includes',
              path: '/src/components/Precio.jsx',
              pattern: 'useContext\\s*\\(\\s*MonedaContext\\s*\\)',
              label: 'Precio lee el contexto con useContext',
              message: 'Falta en Precio.jsx: const moneda = useContext(MonedaContext).',
            },
            { type: 'text', match: '50 euros', label: 'La página dice "50 euros"' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm09-l4',
      title: 'Todo junto',
      explanation: `Lo más útil de Context llega cuando el tablón guarda un **estado** que cualquiera puede cambiar. Para eso se crea un componente **Provider** propio: guarda el estado y lo cuelga en el tablón junto con las funciones para cambiarlo.

\`\`\`jsx
export function TemaProvider({ children }) {
  const [tema, setTema] = useState('claro')

  function alternar() {
    setTema(tema === 'claro' ? 'oscuro' : 'claro')
  }

  return (
    <TemaContext.Provider value={{ tema, alternar }}>
      {children}
    </TemaContext.Provider>
  )
}
\`\`\`

\`children\` es lo que va dentro de las etiquetas del Provider. En \`App.jsx\` envuelves todo con \`<TemaProvider>\` y los componentes de adentro leen \`{ tema, alternar }\`.

Y si la lógica del estado es larga, puedes guardarla en un hook propio (como \`useGastos\`) y que el Provider solo lo use. Hooks, carpetas y Context trabajando juntos.`,
      challenges: [
        {
          id: 'm09-l4-c1',
          title: 'Un botón que cambia el tema',
          instructions:
            'El Provider `TemaProvider` solo cuelga el tema. Agrega la función `alternar` (cambia entre `"claro"` y `"oscuro"`) y cuélgala también en el `value`. Después envuelve la app con `<TemaProvider>` en `App.jsx`. Al principio la vista previa muestra un error; es normal hasta que envuelvas con `TemaProvider`. Al pulsar **Cambiar tema** la página debe pasar de **Tema: claro** a **Tema: oscuro**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/context/TemaContext.jsx': `import { createContext, useState } from 'react'

export const TemaContext = createContext(null)

export function TemaProvider({ children }) {
  const [tema] = useState('claro')

  return (
    <TemaContext.Provider value={{ tema }}>
      {children}
    </TemaContext.Provider>
  )
}
`,
            '/src/components/PanelTema.jsx': `import { useContext } from 'react'
import { TemaContext } from '../context/TemaContext.jsx'

export default function PanelTema() {
  const { tema, alternar } = useContext(TemaContext)

  return (
    <section className="p-2">
      <p>Tema: {tema}</p>
      <button onClick={alternar}>Cambiar tema</button>
    </section>
  )
}
`,
            '/src/App.jsx': `import PanelTema from './components/PanelTema.jsx'

export default function App() {
  return (
    <main className="p-4">
      <PanelTema />
    </main>
  )
}
`,
          },
          activeFile: '/src/context/TemaContext.jsx',
          hints: [
            'En el Provider, el useState devuelve dos cosas: el valor y la función para cambiarlo. Ahora solo tomas la primera.',
            "Toma también setTema, crea function alternar() { setTema(tema === 'claro' ? 'oscuro' : 'claro') } y cambia el value a { tema, alternar }.",
            "En App.jsx importa { TemaProvider } desde './context/TemaContext.jsx' y envuelve <PanelTema /> con <TemaProvider> ... </TemaProvider>.",
          ],
          solution: {
            '/src/context/TemaContext.jsx': `import { createContext, useState } from 'react'

export const TemaContext = createContext(null)

export function TemaProvider({ children }) {
  const [tema, setTema] = useState('claro')

  function alternar() {
    setTema(tema === 'claro' ? 'oscuro' : 'claro')
  }

  return (
    <TemaContext.Provider value={{ tema, alternar }}>
      {children}
    </TemaContext.Provider>
  )
}
`,
            '/src/App.jsx': `import { TemaProvider } from './context/TemaContext.jsx'
import PanelTema from './components/PanelTema.jsx'

export default function App() {
  return (
    <TemaProvider>
      <main className="p-4">
        <PanelTema />
      </main>
    </TemaProvider>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '<TemaProvider',
              label: 'App.jsx envuelve la app con <TemaProvider>',
              message: 'Falta envolver el contenido de App con <TemaProvider> ... </TemaProvider>.',
            },
            { type: 'text', match: 'Tema: claro', label: 'Al empezar dice "Tema: claro"' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Cambiar tema' }],
              expect: { type: 'text', match: 'Tema: oscuro' },
              label: 'Al pulsar "Cambiar tema" dice "Tema: oscuro"',
            },
          ],
          xp: 15,
        },
        {
          id: 'm09-l4-c2',
          title: 'Mini app de gastos, bien ordenada',
          instructions:
            'Los componentes `FormGasto` y `ListaGastos` ya están hechos y esperan encontrar un tablón `GastosContext` con `{ gastos, total, agregar }`. Tú construyes el resto (al crear cada archivo, escribe en "Nombre del archivo" la carpeta y el nombre, por ejemplo `hooks/useGastos.js`):\n\n1. `/src/hooks/useGastos.js`: hook con el estado `gastos` (lista vacía al inicio), una función `agregar(nombre, monto)` que añade un gasto `{ id, nombre, monto }` (con el monto convertido a número) y el `total` sumado. Devuelve `{ gastos, total, agregar }`.\n2. `/src/context/GastosContext.jsx`: exporta `GastosContext` y un `GastosProvider` que use tu hook y cuelgue su resultado.\n3. En `App.jsx`, envuelve todo con `<GastosProvider>`.\n\nLa vista previa mostrará un error hasta que crees el archivo del Context; es normal. Al agregar un gasto Taxi de 80 debe aparecer **Taxi: 80** en la lista, y al agregar después Cena de 40 el total debe decir **Total: 120**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/FormGasto.jsx': `import { useContext, useState } from 'react'
import { GastosContext } from '../context/GastosContext.jsx'

export default function FormGasto() {
  const { agregar } = useContext(GastosContext)
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')

  function enviar(e) {
    e.preventDefault()
    agregar(nombre, monto)
    setNombre('')
    setMonto('')
  }

  return (
    <form onSubmit={enviar} className="mb-4">
      <input aria-label="Nombre" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input aria-label="Monto" type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
      <button type="submit">Agregar</button>
    </form>
  )
}
`,
            '/src/components/ListaGastos.jsx': `import { useContext } from 'react'
import { GastosContext } from '../context/GastosContext.jsx'

export default function ListaGastos() {
  const { gastos, total } = useContext(GastosContext)

  return (
    <section>
      <ul>
        {gastos.map((g) => (
          <li key={g.id}>{g.nombre}: {g.monto}</li>
        ))}
      </ul>
      <p>Total: {total}</p>
    </section>
  )
}
`,
            '/src/App.jsx': `import FormGasto from './components/FormGasto.jsx'
import ListaGastos from './components/ListaGastos.jsx'

export default function App() {
  return (
    <main className="p-4">
      <h1>Mis gastos</h1>
      <FormGasto />
      <ListaGastos />
    </main>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Empieza por el hook: en /src/hooks/useGastos.js usa const [gastos, setGastos] = useState([]). Para agregar crea un gasto nuevo y haz setGastos([...gastos, nuevo]).',
            'El total se puede calcular con un ciclo: let total = 0, luego for (const g of gastos) { total = total + g.monto }. Devuelve return { gastos, total, agregar }. El Context: createContext(null) y GastosProvider que hace const valor = useGastos() y cuelga value={valor}.',
            "El nuevo gasto es { id: gastos.length + 1, nombre, monto: Number(monto) }. El Provider recibe { children } y devuelve <GastosContext.Provider value={valor}>{children}</GastosContext.Provider>. En App.jsx importa { GastosProvider } y envuelve <main> con él.",
          ],
          solution: {
            '/src/hooks/useGastos.js': `import { useState } from 'react'

export default function useGastos() {
  const [gastos, setGastos] = useState([])

  function agregar(nombre, monto) {
    const nuevo = { id: gastos.length + 1, nombre, monto: Number(monto) }
    setGastos([...gastos, nuevo])
  }

  let total = 0
  for (const g of gastos) {
    total = total + g.monto
  }

  return { gastos, total, agregar }
}
`,
            '/src/context/GastosContext.jsx': `import { createContext } from 'react'
import useGastos from '../hooks/useGastos.js'

export const GastosContext = createContext(null)

export function GastosProvider({ children }) {
  const valor = useGastos()

  return (
    <GastosContext.Provider value={valor}>
      {children}
    </GastosContext.Provider>
  )
}
`,
            '/src/App.jsx': `import { GastosProvider } from './context/GastosContext.jsx'
import FormGasto from './components/FormGasto.jsx'
import ListaGastos from './components/ListaGastos.jsx'

export default function App() {
  return (
    <GastosProvider>
      <main className="p-4">
        <h1>Mis gastos</h1>
        <FormGasto />
        <ListaGastos />
      </main>
    </GastosProvider>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/hooks/useGastos\\.jsx?$',
              label: 'Existe /src/hooks/useGastos.js',
              message: 'Falta crear el archivo /src/hooks/useGastos.js.',
            },
            {
              type: 'file-exists',
              pattern: '^/src/context/GastosContext\\.jsx$',
              label: 'Existe /src/context/GastosContext.jsx',
              message: 'Falta crear el archivo /src/context/GastosContext.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/context/GastosContext.jsx',
              pattern: 'useGastos\\s*\\(',
              label: 'El Provider usa tu hook useGastos',
              message: 'Dentro de GastosProvider falta llamar al hook: const valor = useGastos().',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '<GastosProvider',
              label: 'App.jsx envuelve la app con <GastosProvider>',
              message: 'Falta envolver el contenido de App con <GastosProvider> ... </GastosProvider>.',
            },
            { type: 'text', match: 'Total: 0', label: 'Al empezar dice "Total: 0"' },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Nombre', value: 'Taxi' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '80' },
                { action: 'click', role: 'button', name: 'Agregar' },
              ],
              expect: { type: 'text', match: 'Taxi: 80' },
              label: 'Al agregar "Taxi" de 80 aparece en la lista',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Nombre', value: 'Cena' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '40' },
                { action: 'click', role: 'button', name: 'Agregar' },
              ],
              expect: { type: 'text', match: 'Total: 120' },
              label: 'Con otro gasto de 40 el total es 120',
            },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
