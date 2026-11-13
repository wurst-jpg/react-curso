const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

// "Servidor de mentira": responde tras un momento, como lo haría uno de verdad.
const API = `const GASTOS = [
  { id: 1, descripcion: 'Café', monto: 25 },
  { id: 2, descripcion: 'Autobús', monto: 12 },
  { id: 3, descripcion: 'Pan', monto: 8 },
]

// Devuelve una promesa: "te respondo en un ratito".
// Con { fallar: true } simula un servidor caído.
export function obtenerGastos({ fallar = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fallar) reject(new Error('El servidor no responde'))
      else resolve(GASTOS)
    }, fallar ? 0 : 250)
  })
}
`

const modulo = {
  id: 'm08',
  title: 'Datos externos',
  summary: 'Pedir datos que llegan con retraso: useEffect, "Cargando…" y qué hacer cuando algo falla.',
  lessons: [
    {
      id: 'm08-l1',
      title: 'useEffect: hacer algo después de dibujar',
      explanation: `Hasta ahora, un componente solo **dibujaba** cosas. Pero a veces hay que hacer algo **fuera** de la pantalla: cambiar el título de la pestaña del navegador, pedir datos a internet, guardar algo. Es como un mesero: dibuja el menú (el componente) y, aparte, avisa a la cocina (el efecto).

Eso se escribe con \`useEffect\`: una función que React ejecuta **después** de dibujar.

\`\`\`jsx
import { useEffect, useState } from 'react'

useEffect(() => {
  document.title = 'Hola, ' + nombre
}, [nombre])
\`\`\`

(Va dentro del componente, antes del \`return\`.)

Lo que va al final, \`[nombre]\`, se llama **lista de dependencias** y dice cuándo repetir el efecto:

- \`[nombre]\`: cada vez que \`nombre\` cambie.
- \`[]\` (vacía): solo una vez, cuando el componente aparece.
- Sin lista: después de cada dibujo (casi nunca lo quieres).

\`document.title\` es el texto de la pestaña del navegador.`,
      challenges: [
        {
          id: 'm08-l1-c1',
          title: 'El título de la pestaña',
          instructions:
            'Importa `useEffect` y úsalo para que el título de la pestaña (`document.title`) diga **Hola,** seguido del nombre, y se actualice cada vez que `nombre` cambie. La página debe seguir diciendo **Hola, Ana** al escribir Ana.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [nombre, setNombre] = useState('')

  return (
    <div className="p-6">
      <input
        className="border p-2"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <p>Hola, {nombre}</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Primero añade useEffect al import de arriba: import { useEffect, useState } from \'react\'.',
            'Dentro del componente, antes del return, escribe useEffect(() => { ... }, [nombre]). Dentro de las llaves cambia document.title.',
            'useEffect(() => { document.title = \'Hola, \' + nombre }, [nombre])',
          ],
          solution: {
            '/src/App.jsx': `import { useEffect, useState } from 'react'

export default function App() {
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    document.title = 'Hola, ' + nombre
  }, [nombre])

  return (
    <div className="p-6">
      <input
        className="border p-2"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <p>Hola, {nombre}</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'useEffect\\s*\\(',
              label: 'Usas useEffect',
              message: 'Falta useEffect(() => { ... }, [nombre]) dentro del componente.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'document\\.title\\s*=',
              label: 'Cambias document.title',
              message: 'Dentro del efecto falta document.title = ... para cambiar el título de la pestaña.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: ',\\s*\\[\\s*nombre\\s*\\]\\s*\\)',
              label: 'El efecto se repite cuando cambia nombre ([nombre])',
              message: 'Al final del useEffect falta la lista de dependencias: , [nombre]).',
            },
            {
              type: 'interaction',
              steps: [{ action: 'type', role: 'textbox', value: 'Ana' }],
              expect: { type: 'text', match: 'Hola, Ana' },
              label: 'La página sigue diciendo "Hola, Ana" al escribir Ana',
              message: 'Escribí "Ana" y la página no dijo "Hola, Ana". No borres el campo ni el párrafo.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm08-l2',
      title: 'Traer datos con retraso',
      explanation: `Los datos de una app de verdad (tus gastos guardados, por ejemplo) viven en un **servidor**: otra computadora lejos de aquí. Pedirlos es como pedir una pizza por teléfono: no llega al instante. Mientras tanto, tu app tiene que seguir viva.

En JavaScript, ese "te lo llevo en un rato" se llama **promesa**. Se usa así:

\`\`\`jsx
// Con un servidor real se usa fetch:
fetch('https://ejemplo.com/gastos')
  .then((respuesta) => respuesta.json())
  .then((datos) => setGastos(datos))
\`\`\`

\`.then(...)\` significa "cuando llegue, haz esto". \`respuesta.json()\` convierte lo que manda el servidor (texto) en datos que JavaScript entiende. Es lo mismo que haremos nosotros, pero como los servidores de internet pueden estar caídos, en este curso usaremos un **servidor de mentira**: un archivo \`/src/api.js\` con una función que devuelve una promesa que se cumple en un cuarto de segundo.

\`\`\`jsx
export function obtenerGastos() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([ /* los gastos */ ]), 250)
  })
}
\`\`\`

\`new Promise\` crea la promesa, \`resolve(datos)\` dice "ya llegó, aquí está" (su contrario, \`reject(error)\`, dice "algo salió mal"; lo usaremos más adelante) y \`setTimeout\` espera los milisegundos que le digas (250 = un cuarto de segundo).

Y el lugar natural para pedir datos es un efecto que corre **una sola vez**, al aparecer el componente:

\`\`\`jsx
useEffect(() => {
  obtenerGastos().then((datos) => setGastos(datos))
}, [])
\`\`\``,
      challenges: [
        {
          id: 'm08-l2-c1',
          title: 'Crea tu servidor de mentira',
          instructions:
            'La página ya sabe pedir gastos, pero le falta quien los entregue. Crea el archivo `api.js` (en el botón de nuevo archivo escribe `api.js`) que exporte una función `obtenerGastos` que devuelva una promesa que, tras **250** milisegundos (no uses más de 1000: el corrector espera solo un momento), entregue tres gastos: **Café** (25), **Autobús** (12) y **Pan** (8). Cada gasto es un objeto con `id`, `descripcion` (sin tilde, igual que en `App.jsx`) y `monto`. La vista previa mostrará un error hasta que crees el archivo; es normal.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'

export default function App() {
  const [gastos, setGastos] = useState([])

  useEffect(() => {
    obtenerGastos().then((datos) => setGastos(datos))
  }, [])

  return (
    <ul className="p-6 list-disc pl-10">
      {gastos.map((g) => (
        <li key={g.id}>
          {g.descripcion}: {g.monto}
        </li>
      ))}
    </ul>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'En api.js escribe export function obtenerGastos() { ... } y dentro un return new Promise(...).',
            'new Promise((resolve) => { setTimeout(() => resolve([...los gastos...]), 250) }). Cada gasto: { id: 1, descripcion: \'Café\', monto: 25 }.',
            'export function obtenerGastos() { return new Promise((resolve) => { setTimeout(() => { resolve([{ id: 1, descripcion: \'Café\', monto: 25 }, { id: 2, descripcion: \'Autobús\', monto: 12 }, { id: 3, descripcion: \'Pan\', monto: 8 }]) }, 250) }) }',
          ],
          solution: {
            '/src/api.js': `export function obtenerGastos() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, descripcion: 'Café', monto: 25 },
        { id: 2, descripcion: 'Autobús', monto: 12 },
        { id: 3, descripcion: 'Pan', monto: 8 },
      ])
    }, 250)
  })
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/api\\.js$',
              label: 'Existe el archivo api.js',
              message: 'Falta crear el archivo /src/api.js.',
            },
            {
              type: 'file-includes',
              path: '/src/api.js',
              pattern: 'export\\s+(async\\s+)?(function\\s+obtenerGastos|const\\s+obtenerGastos)|export\\s*\\{[^}]*obtenerGastos',
              label: 'api.js exporta obtenerGastos',
              message: 'Falta "export function obtenerGastos()" en api.js.',
            },
            {
              type: 'role',
              role: 'listitem',
              name: 'Café',
              label: 'En la lista aparece "Café"',
              message: 'No veo "Café" en la lista. ¿obtenerGastos entrega los gastos con resolve(...)? Revisa que las claves sean id, descripcion (sin tilde) y monto. Si pusiste un tiempo largo, espera a que aparezca la lista y vuelve a pulsar Comprobar.',
            },
            {
              type: 'role',
              role: 'listitem',
              min: 3,
              label: 'La lista tiene los 3 gastos',
              message: 'Faltan gastos: deben ser tres (Café, Autobús y Pan).',
            },
          ],
          xp: 15,
        },
        {
          id: 'm08-l2-c2',
          title: 'Pide los datos en un efecto',
          instructions:
            'Ahora al revés: `api.js` ya existe y la página está vacía. Usa `useEffect` (que corra **una sola vez**) para pedir los gastos con `obtenerGastos()` y guardarlos en el estado, para que aparezcan **Café**, **Autobús** y **Pan** en la lista.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/api.js': API,
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'

export default function App() {
  const [gastos, setGastos] = useState([])

  // Aquí falta pedir los gastos

  return (
    <ul className="p-6 list-disc pl-10">
      {gastos.map((g) => (
        <li key={g.id}>
          {g.descripcion}: {g.monto}
        </li>
      ))}
    </ul>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El import de useEffect y obtenerGastos ya está arriba; falta usarlos dentro del componente.',
            'useEffect(() => { ... }, []). Dentro: obtenerGastos().then(...) y con el resultado llama a setGastos.',
            'useEffect(() => { obtenerGastos().then((datos) => setGastos(datos)) }, [])',
          ],
          solution: {
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'

export default function App() {
  const [gastos, setGastos] = useState([])

  useEffect(() => {
    obtenerGastos().then((datos) => setGastos(datos))
  }, [])

  return (
    <ul className="p-6 list-disc pl-10">
      {gastos.map((g) => (
        <li key={g.id}>
          {g.descripcion}: {g.monto}
        </li>
      ))}
    </ul>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'useEffect\\s*\\(',
              label: 'Usas useEffect',
              message: 'Falta useEffect(() => { ... }, []) dentro del componente.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: ',\\s*\\[\\s*\\]\\s*\\)',
              label: 'El efecto corre una sola vez (lista vacía [])',
              message: 'Al final del useEffect falta la lista vacía: , []) para que corra una sola vez.',
            },
            {
              type: 'role',
              role: 'listitem',
              name: 'Café',
              label: 'En la lista aparece "Café"',
              message: 'No veo "Café" en la lista. ¿Llamas a obtenerGastos() y guardas el resultado con setGastos?',
            },
            {
              type: 'role',
              role: 'listitem',
              min: 3,
              label: 'La lista tiene los 3 gastos',
              message: 'Deberían aparecer tres gastos. Guarda en el estado todo lo que entrega obtenerGastos().',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm08-l3',
      title: 'Cargando… y errores',
      explanation: `Mientras llega la pizza, el cliente no debería mirar una mesa vacía sin saber qué pasa. Cuando pides datos hay **tres situaciones** que mostrar:

1. **Cargando**: todavía no llega nada. Muestra "Cargando…".
2. **Error**: algo salió mal (servidor caído, sin internet). Dile al usuario qué pasó.
3. **Listo**: muestra los datos.

Para eso, dos estados más: \`cargando\` y \`error\`.

\`\`\`jsx
function cargar() {
  setCargando(true)
  setError('')
  obtenerGastos()
    .then((datos) => {
      setGastos(datos)
      setCargando(false)
    })
    .catch(() => {
      setError('No se pudo cargar')
      setCargando(false)
    })
}
\`\`\`

\`.catch(...)\` es "si la promesa falla, haz esto". Y en la pantalla:

\`\`\`jsx
{cargando && <p>Cargando…</p>}
{error && <p>{error}</p>}
\`\`\`

Para probar, \`obtenerGastos({ fallar: true })\` de nuestro servidor de mentira falla a propósito.`,
      challenges: [
        {
          id: 'm08-l3-c1',
          title: 'Muestra "Cargando…"',
          instructions:
            'Hay un botón **Recargar** que vuelve a pedir los gastos, pero mientras esperas no se ve nada. Añade un estado `cargando`: mientras es verdadero muestra **Cargando…** (y oculta la lista); al llegar los datos, vuelve a falso. Haz que la función `cargar` ponga `cargando` en verdadero al empezar.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/api.js': API,
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'

export default function App() {
  const [gastos, setGastos] = useState([])

  function cargar() {
    obtenerGastos().then((datos) => {
      setGastos(datos)
    })
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="p-6 space-y-2">
      <button onClick={cargar} className="bg-blue-600 text-white px-4 py-2 rounded">
        Recargar
      </button>
      <ul className="list-disc pl-6">
        {gastos.map((g) => (
          <li key={g.id}>
            {g.descripcion}: {g.monto}
          </li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Crea const [cargando, setCargando] = useState(true). Empieza en verdadero porque al abrir la página ya se está cargando.',
            'En cargar: setCargando(true) al inicio, y setCargando(false) dentro del .then. En el JSX: cargando ? <p>Cargando…</p> : <ul>...</ul>.',
            'Envuelve la lista: {cargando ? (<p>Cargando…</p>) : (<ul>...la lista...</ul>)}. Y en cargar: setCargando(true) arriba y setCargando(false) después de setGastos(datos).',
          ],
          solution: {
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'

export default function App() {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)

  function cargar() {
    setCargando(true)
    obtenerGastos().then((datos) => {
      setGastos(datos)
      setCargando(false)
    })
  }

  useEffect(() => {
    cargar()
  }, [])

  return (
    <div className="p-6 space-y-2">
      <button onClick={cargar} className="bg-blue-600 text-white px-4 py-2 rounded">
        Recargar
      </button>
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <ul className="list-disc pl-6">
          {gastos.map((g) => (
            <li key={g.id}>
              {g.descripcion}: {g.monto}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'role',
              role: 'listitem',
              name: 'Café',
              label: 'Cuando termina de cargar, la lista muestra "Café"',
              message: 'Al terminar de cargar no veo "Café". ¿Pones cargando en falso al llegar los datos?',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Recargar' }],
              expect: { type: 'text', match: 'Cargando' },
              label: 'Al pulsar Recargar aparece "Cargando…"',
              message: 'Pulsé Recargar y no vi "Cargando…". ¿cargar() hace setCargando(true) y el JSX lo muestra?',
            },
          ],
          xp: 15,
        },
        {
          id: 'm08-l3-c2',
          title: 'Cuando algo falla',
          instructions:
            'Hay un botón **Simular fallo** que hace fallar la petición. Ahora mismo se queda en "Cargando…" para siempre. Añade un estado `error` y un `.catch(...)` para que, al fallar, se vea un mensaje que empiece con **No se pudo cargar** y deje de decir "Cargando…". Puede salir un aviso rojo de error en la vista previa: es justo lo que vas a arreglar.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/api.js': API,
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'

export default function App() {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)

  function cargar(fallar) {
    setCargando(true)
    obtenerGastos({ fallar }).then((datos) => {
      setGastos(datos)
      setCargando(false)
    })
  }

  useEffect(() => {
    cargar(false)
  }, [])

  return (
    <div className="p-6 space-y-2">
      <button onClick={() => cargar(false)} className="bg-blue-600 text-white px-4 py-2 rounded">
        Cargar gastos
      </button>
      <button onClick={() => cargar(true)} className="bg-gray-600 text-white px-4 py-2 rounded ml-2">
        Simular fallo
      </button>
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <ul className="list-disc pl-6">
          {gastos.map((g) => (
            <li key={g.id}>
              {g.descripcion}: {g.monto}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Hacen falta tres cosas: un estado error, un .catch después del .then, y mostrar el error en el JSX.',
            'const [error, setError] = useState(\'\'). En cargar: setError(\'\') al empezar; .catch(() => { setError(\'No se pudo cargar los gastos.\'); setCargando(false) }). En el JSX: {error && <p>{error}</p>}.',
            'Pega .catch(() => { setError(\'No se pudo cargar los gastos.\'); setCargando(false) }) justo después del cierre del .then(...) y añade {error && <p className="text-red-600">{error}</p>} bajo los botones. Empieza cada carga con setError(\'\') para que el mensaje desaparezca al cargar bien.',
          ],
          solution: {
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'

export default function App() {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  function cargar(fallar) {
    setCargando(true)
    setError('')
    obtenerGastos({ fallar })
      .then((datos) => {
        setGastos(datos)
        setCargando(false)
      })
      .catch(() => {
        setError('No se pudo cargar los gastos.')
        setCargando(false)
      })
  }

  useEffect(() => {
    cargar(false)
  }, [])

  return (
    <div className="p-6 space-y-2">
      <button onClick={() => cargar(false)} className="bg-blue-600 text-white px-4 py-2 rounded">
        Cargar gastos
      </button>
      <button onClick={() => cargar(true)} className="bg-gray-600 text-white px-4 py-2 rounded ml-2">
        Simular fallo
      </button>
      {error && <p className="text-red-600">{error}</p>}
      {cargando ? (
        <p>Cargando…</p>
      ) : (
        <ul className="list-disc pl-6">
          {gastos.map((g) => (
            <li key={g.id}>
              {g.descripcion}: {g.monto}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '\\.catch\\s*\\(|catch\\s*\\(?\\s*\\w*\\s*\\)?\\s*\\{',
              label: 'Usas catch para atrapar el fallo',
              message: 'Falta .catch(() => { ... }) para saber cuándo la petición falla.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Simular fallo' }],
              expect: { type: 'text', match: 'No se pudo cargar' },
              label: 'Al fallar aparece "No se pudo cargar…"',
              message: 'Pulsé Simular fallo y no vi "No se pudo cargar". ¿El catch guarda el mensaje con setError y el JSX lo muestra?',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Cargar gastos' }],
              expect: { type: 'text', match: 'Cargando' },
              label: 'Al volver a cargar aparece "Cargando…"',
              message: 'Pulsé Cargar gastos y no vi "Cargando…". No quites el estado cargando de antes.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm08-l4',
      title: 'Todo junto',
      explanation: `Ya sabes pedir datos, esperar y fallar con elegancia. Falta ordenar: mientras más crece una pantalla, más conviene que **cada pieza tenga su archivo**. Una buena división:

- \`App.jsx\` es el jefe: guarda el estado y sabe cargar los datos.
- \`ListaGastos.jsx\` es el vitrinista: solo recibe por props lo que debe mostrar (\`gastos\`, \`cargando\`, \`error\`) y decide qué dibujar.

\`\`\`jsx
export default function ListaGastos({ gastos, cargando, error }) {
  if (cargando) return <p>Cargando…</p>
  if (error) return <p>{error}</p>
  return <ul>...</ul>
}
\`\`\`

Un \`return\` temprano (como el de los formularios) deja el código plano y fácil de leer: primero los casos especiales, al final el caso normal.`,
      challenges: [
        {
          id: 'm08-l4-c1',
          title: 'Lista de gastos con estados',
          instructions:
            'Reto del módulo. `App.jsx` ya carga los gastos, tiene el formulario para agregar uno y usa `<ListaGastos />`. Crea el archivo que falta: en el botón de nuevo archivo escribe `components/ListaGastos.jsx`. Recibe `gastos`, `cargando` y `error` por props y muestra **Cargando…** mientras carga, el texto del error si lo hay, o la lista de gastos (`descripcion: monto`, cada uno en un `<li>`). La vista previa mostrará un error hasta que crees el archivo; es normal. Antes de Comprobar, pulsa **Cargar gastos** y espera la lista.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/api.js': API,
            '/src/App.jsx': `import { useEffect, useState } from 'react'
import { obtenerGastos } from './api.js'
import ListaGastos from './components/ListaGastos.jsx'

export default function App() {
  const [gastos, setGastos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')

  function cargar(fallar) {
    setCargando(true)
    setError('')
    obtenerGastos({ fallar })
      .then((datos) => {
        setGastos(datos)
        setCargando(false)
      })
      .catch(() => {
        setError('No se pudo cargar los gastos.')
        setCargando(false)
      })
  }

  useEffect(() => {
    cargar(false)
  }, [])

  function agregar(e) {
    e.preventDefault()
    setError('')
    setGastos([...gastos, { id: Date.now(), descripcion, monto: Number(monto) }])
    setDescripcion('')
    setMonto('')
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Mis gastos</h1>
      <div className="space-x-2">
        <button onClick={() => cargar(false)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Cargar gastos
        </button>
        <button onClick={() => cargar(true)} className="bg-gray-600 text-white px-4 py-2 rounded">
          Simular fallo
        </button>
      </div>
      <form onSubmit={agregar} className="space-x-2">
        <input
          className="border p-2"
          aria-label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <input
          className="border p-2"
          type="number"
          aria-label="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>
      <ListaGastos gastos={gastos} cargando={cargando} error={error} />
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Crea components/ListaGastos.jsx con una función ListaGastos({ gastos, cargando, error }) y export default. Los tres datos llegan por props.',
            'Dentro: if (cargando) return <p>Cargando…</p>; luego if (error) return <p>{error}</p>; y al final return con un <ul> que haga gastos.map(...) con un <li key={g.id}> por gasto.',
            'return (<ul>{gastos.map((g) => (<li key={g.id}>{g.descripcion}: {g.monto}</li>))}</ul>) como último return, después de los dos if. Escribe "return (" en la misma línea.',
          ],
          solution: {
            '/src/components/ListaGastos.jsx': `export default function ListaGastos({ gastos, cargando, error }) {
  if (cargando) return <p>Cargando…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <ul className="list-disc pl-6">
      {gastos.map((g) => (
        <li key={g.id}>
          {g.descripcion}: {g.monto}
        </li>
      ))}
    </ul>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/ListaGastos\\.jsx$',
              label: 'Existe /src/components/ListaGastos.jsx',
              message: 'Falta crear el archivo /src/components/ListaGastos.jsx.',
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            {
              type: 'role',
              role: 'listitem',
              name: 'Café',
              label: 'Al terminar de cargar la lista muestra "Café"',
              message: 'No veo "Café" en la lista. Dibuja cada gasto en un <li> con gastos.map. Antes de Comprobar, pulsa Cargar gastos y espera la lista.',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Taxi' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '30' },
                { action: 'click', role: 'button', name: 'Guardar' },
              ],
              expect: { type: 'role', role: 'listitem', name: 'Taxi' },
              label: 'Un gasto nuevo ("Taxi") aparece en la lista',
              message: 'Agregué "Taxi" y no apareció en la lista. ¿ListaGastos dibuja todos los elementos de la prop gastos? Antes de Comprobar, pulsa Cargar gastos y espera la lista.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Simular fallo' }],
              expect: { type: 'text', match: 'No se pudo cargar' },
              label: 'Si falla, se muestra el mensaje de error',
              message: 'Simulé un fallo y no vi el mensaje de error. ¿ListaGastos muestra la prop error cuando existe?',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Cargar gastos' }],
              expect: { type: 'text', match: 'Cargando' },
              label: 'Mientras carga, se muestra "Cargando…"',
              message: 'Pulsé Cargar gastos y no vi "Cargando…". ¿ListaGastos revisa la prop cargando?',
            },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
