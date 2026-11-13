const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

// ---------------------------------------------------------------------------
// Código de referencia de cada etapa (la "versión limpia"). Cada etapa crece
// sobre la anterior: solo se listan los archivos que cambian.
// ---------------------------------------------------------------------------

const EJEMPLOS = `const gastosEjemplo = [
  { id: 1, descripcion: 'Almuerzo', monto: 12000, categoria: 'Comida' },
  { id: 2, descripcion: 'Bus', monto: 3000, categoria: 'Transporte' },
  { id: 3, descripcion: 'Cine', monto: 20000, categoria: 'Ocio' },
]

export default gastosEjemplo
`

const CATEGORIAS = `export const CATEGORIAS = ['Comida', 'Transporte', 'Ocio', 'Otros']
`

// ----- Etapa 1 -----
const APP_1 = `import gastosEjemplo from './gastosEjemplo.js'
import ListaGastos from './components/ListaGastos.jsx'

export default function App() {
  return (
    <main>
      <h1>Mis gastos</h1>
      <ListaGastos gastos={gastosEjemplo} />
    </main>
  )
}
`

const LISTA_1 = `export default function ListaGastos({ gastos }) {
  return (
    <ul>
      {gastos.map((gasto) => (
        <li key={gasto.id}>
          {gasto.descripcion} - {'$' + gasto.monto} ({gasto.categoria})
        </li>
      ))}
    </ul>
  )
}
`

// ----- Etapa 2 -----
const APP_2 = `import { useState } from 'react'
import gastosEjemplo from './gastosEjemplo.js'
import FormularioGasto from './components/FormularioGasto.jsx'
import ListaGastos from './components/ListaGastos.jsx'

export default function App() {
  const [gastos, setGastos] = useState(gastosEjemplo)

  function agregarGasto(nuevo) {
    setGastos([...gastos, nuevo])
  }

  return (
    <main>
      <h1>Mis gastos</h1>
      <FormularioGasto alAgregar={agregarGasto} />
      <ListaGastos gastos={gastos} />
    </main>
  )
}
`

const FORM_2 = `import { useState } from 'react'
import { CATEGORIAS } from '../categorias.js'

export default function FormularioGasto({ alAgregar }) {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [error, setError] = useState('')

  function enviar(evento) {
    evento.preventDefault()
    const valor = Number(monto)
    if (descripcion.trim() === '' || !(valor > 0)) {
      setError('Escribe una descripción y un monto mayor que 0')
      return
    }
    alAgregar({ id: Date.now(), descripcion: descripcion.trim(), monto: valor, categoria })
    setDescripcion('')
    setMonto('')
    setError('')
  }

  return (
    <form onSubmit={enviar}>
      <input
        aria-label="Descripción"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <input
        type="number"
        aria-label="Monto"
        placeholder="Monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />
      <select aria-label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        {CATEGORIAS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button type="submit">Agregar</button>
      {error && <p>{error}</p>}
    </form>
  )
}
`

// ----- Etapa 3 -----
const APP_3 = `import { useState } from 'react'
import gastosEjemplo from './gastosEjemplo.js'
import FormularioGasto from './components/FormularioGasto.jsx'
import ListaGastos from './components/ListaGastos.jsx'

export default function App() {
  const [gastos, setGastos] = useState(gastosEjemplo)

  function agregarGasto(nuevo) {
    setGastos([...gastos, nuevo])
  }

  function borrarGasto(id) {
    setGastos(gastos.filter((gasto) => gasto.id !== id))
  }

  const total = gastos.reduce((suma, gasto) => suma + gasto.monto, 0)

  return (
    <main>
      <h1>Mis gastos</h1>
      <FormularioGasto alAgregar={agregarGasto} />
      <ListaGastos gastos={gastos} alBorrar={borrarGasto} />
      <p>{'Total: $' + total}</p>
    </main>
  )
}
`

const LISTA_3 = `export default function ListaGastos({ gastos, alBorrar }) {
  return (
    <ul>
      {gastos.map((gasto) => (
        <li key={gasto.id}>
          {gasto.descripcion} - {'$' + gasto.monto} ({gasto.categoria}){' '}
          <button aria-label={'Eliminar ' + gasto.descripcion} onClick={() => alBorrar(gasto.id)}>
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  )
}
`

// ----- Etapa 4 -----
const APP_4 = `import { useState } from 'react'
import gastosEjemplo from './gastosEjemplo.js'
import FormularioGasto from './components/FormularioGasto.jsx'
import FiltroCategorias from './components/FiltroCategorias.jsx'
import ResumenCategorias from './components/ResumenCategorias.jsx'
import ListaGastos from './components/ListaGastos.jsx'

export default function App() {
  const [gastos, setGastos] = useState(gastosEjemplo)
  const [filtro, setFiltro] = useState('Todas')

  function agregarGasto(nuevo) {
    setGastos([...gastos, nuevo])
  }

  function borrarGasto(id) {
    setGastos(gastos.filter((gasto) => gasto.id !== id))
  }

  const visibles = filtro === 'Todas' ? gastos : gastos.filter((gasto) => gasto.categoria === filtro)
  const total = gastos.reduce((suma, gasto) => suma + gasto.monto, 0)

  return (
    <main>
      <h1>Mis gastos</h1>
      <FormularioGasto alAgregar={agregarGasto} />
      <ResumenCategorias gastos={gastos} />
      <FiltroCategorias actual={filtro} alElegir={setFiltro} />
      <ListaGastos gastos={visibles} alBorrar={borrarGasto} />
      <p>{'Total: $' + total}</p>
    </main>
  )
}
`

const FILTRO_4 = `import { CATEGORIAS } from '../categorias.js'

export default function FiltroCategorias({ actual, alElegir }) {
  return (
    <div>
      {['Todas', ...CATEGORIAS].map((nombre) => (
        <button key={nombre} aria-pressed={actual === nombre} onClick={() => alElegir(nombre)}>
          {nombre}
        </button>
      ))}
    </div>
  )
}
`

const RESUMEN_4 = `import { CATEGORIAS } from '../categorias.js'

export default function ResumenCategorias({ gastos }) {
  return (
    <ul>
      {CATEGORIAS.map((categoria) => {
        const suma = gastos
          .filter((gasto) => gasto.categoria === categoria)
          .reduce((acumulado, gasto) => acumulado + gasto.monto, 0)
        return <li key={categoria}>{categoria + ': $' + suma}</li>
      })}
    </ul>
  )
}
`

// ----- Etapa 5 -----
const APP_5 = `import { useEffect, useState } from 'react'
import gastosEjemplo from './gastosEjemplo.js'
import FormularioGasto from './components/FormularioGasto.jsx'
import FiltroCategorias from './components/FiltroCategorias.jsx'
import ResumenCategorias from './components/ResumenCategorias.jsx'
import ListaGastos from './components/ListaGastos.jsx'

const CLAVE = 'gastos-guardados'

function leerGastos() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) return JSON.parse(guardado)
  } catch {
    // sin acceso al almacenamiento: se usan los de ejemplo
  }
  return gastosEjemplo
}

export default function App() {
  const [gastos, setGastos] = useState(leerGastos)
  const [filtro, setFiltro] = useState('Todas')

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(gastos))
    } catch {
      // sin acceso al almacenamiento: la app sigue funcionando sin guardar
    }
  }, [gastos])

  function agregarGasto(nuevo) {
    setGastos([...gastos, nuevo])
  }

  function borrarGasto(id) {
    setGastos(gastos.filter((gasto) => gasto.id !== id))
  }

  const visibles = filtro === 'Todas' ? gastos : gastos.filter((gasto) => gasto.categoria === filtro)
  const total = gastos.reduce((suma, gasto) => suma + gasto.monto, 0)

  return (
    <main>
      <h1>Mis gastos</h1>
      <FormularioGasto alAgregar={agregarGasto} />
      <ResumenCategorias gastos={gastos} />
      <FiltroCategorias actual={filtro} alElegir={setFiltro} />
      <ListaGastos gastos={visibles} alBorrar={borrarGasto} />
      <p>{'Total: $' + total}</p>
    </main>
  )
}
`

// ----- Etapa 6 -----
const APP_6 = `import { useEffect, useState } from 'react'
import { MemoryRouter, Link, Route, Routes } from 'react-router'
import gastosEjemplo from './gastosEjemplo.js'
import Inicio from './pages/Inicio.jsx'
import Resumen from './pages/Resumen.jsx'
import DetalleGasto from './pages/DetalleGasto.jsx'

const CLAVE = 'gastos-guardados'

function leerGastos() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) return JSON.parse(guardado)
  } catch {
    // sin acceso al almacenamiento: se usan los de ejemplo
  }
  return gastosEjemplo
}

export default function App() {
  const [gastos, setGastos] = useState(leerGastos)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(gastos))
    } catch {
      // sin acceso al almacenamiento: la app sigue funcionando sin guardar
    }
  }, [gastos])

  function agregarGasto(nuevo) {
    setGastos([...gastos, nuevo])
  }

  function borrarGasto(id) {
    setGastos(gastos.filter((gasto) => gasto.id !== id))
  }

  return (
    <MemoryRouter>
      <h1>Mis gastos</h1>
      <nav>
        <Link to="/">Gastos</Link> <Link to="/resumen">Resumen</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Inicio gastos={gastos} alAgregar={agregarGasto} alBorrar={borrarGasto} />} />
        <Route path="/resumen" element={<Resumen gastos={gastos} />} />
        <Route path="/gasto/:id" element={<DetalleGasto gastos={gastos} />} />
      </Routes>
    </MemoryRouter>
  )
}
`

const INICIO_6 = `import { useState } from 'react'
import FormularioGasto from '../components/FormularioGasto.jsx'
import FiltroCategorias from '../components/FiltroCategorias.jsx'
import ListaGastos from '../components/ListaGastos.jsx'

export default function Inicio({ gastos, alAgregar, alBorrar }) {
  const [filtro, setFiltro] = useState('Todas')

  const visibles = filtro === 'Todas' ? gastos : gastos.filter((gasto) => gasto.categoria === filtro)
  const total = gastos.reduce((suma, gasto) => suma + gasto.monto, 0)

  return (
    <section>
      <FormularioGasto alAgregar={alAgregar} />
      <FiltroCategorias actual={filtro} alElegir={setFiltro} />
      <ListaGastos gastos={visibles} alBorrar={alBorrar} />
      <p>{'Total: $' + total}</p>
    </section>
  )
}
`

const RESUMEN_PAG_6 = `import ResumenCategorias from '../components/ResumenCategorias.jsx'

export default function Resumen({ gastos }) {
  const total = gastos.reduce((suma, gasto) => suma + gasto.monto, 0)

  return (
    <section>
      <h2>Resumen por categoría</h2>
      <ResumenCategorias gastos={gastos} />
      <p>{'Total: $' + total}</p>
    </section>
  )
}
`

const DETALLE_6 = `import { Link, useParams } from 'react-router'

export default function DetalleGasto({ gastos }) {
  const { id } = useParams()
  const gasto = gastos.find((g) => String(g.id) === id)

  if (!gasto) {
    return (
      <section>
        <p>Ese gasto no existe.</p>
        <Link to="/">Volver</Link>
      </section>
    )
  }

  return (
    <section>
      <h2>Detalle del gasto</h2>
      <p>{'Descripción: ' + gasto.descripcion}</p>
      <p>{'Monto: $' + gasto.monto}</p>
      <p>{'Categoría: ' + gasto.categoria}</p>
      <Link to="/">Volver</Link>
    </section>
  )
}
`

const LISTA_6 = `import { Link } from 'react-router'

export default function ListaGastos({ gastos, alBorrar }) {
  return (
    <ul>
      {gastos.map((gasto) => (
        <li key={gasto.id}>
          <Link to={'/gasto/' + gasto.id}>{gasto.descripcion}</Link> - {'$' + gasto.monto} ({gasto.categoria}){' '}
          <button aria-label={'Eliminar ' + gasto.descripcion} onClick={() => alBorrar(gasto.id)}>
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  )
}
`

// ----- Etapa 7 -----
const APP_7 = `import { useEffect, useState } from 'react'
import { MemoryRouter, Link, Route, Routes } from 'react-router'
import gastosEjemplo from './gastosEjemplo.js'
import Inicio from './pages/Inicio.jsx'
import Resumen from './pages/Resumen.jsx'
import DetalleGasto from './pages/DetalleGasto.jsx'

const CLAVE = 'gastos-guardados'

function leerGastos() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado) return JSON.parse(guardado)
  } catch {
    // sin acceso al almacenamiento: se usan los de ejemplo
  }
  return gastosEjemplo
}

export default function App() {
  const [gastos, setGastos] = useState(leerGastos)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(gastos))
    } catch {
      // sin acceso al almacenamiento: la app sigue funcionando sin guardar
    }
  }, [gastos])

  function agregarGasto(nuevo) {
    setGastos([...gastos, nuevo])
  }

  function borrarGasto(id) {
    setGastos(gastos.filter((gasto) => gasto.id !== id))
  }

  return (
    <MemoryRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <main className="mx-auto max-w-2xl p-4 sm:p-8">
          <h1 className="mb-4 text-2xl font-bold text-indigo-700 sm:text-3xl">Mis gastos</h1>
          <nav className="mb-6 flex gap-4 border-b border-slate-200 pb-2">
            <Link className="font-medium text-indigo-600 hover:underline" to="/">
              Gastos
            </Link>
            <Link className="font-medium text-indigo-600 hover:underline" to="/resumen">
              Resumen
            </Link>
          </nav>
          <Routes>
            <Route path="/" element={<Inicio gastos={gastos} alAgregar={agregarGasto} alBorrar={borrarGasto} />} />
            <Route path="/resumen" element={<Resumen gastos={gastos} />} />
            <Route path="/gasto/:id" element={<DetalleGasto gastos={gastos} />} />
          </Routes>
        </main>
      </div>
    </MemoryRouter>
  )
}
`

const INICIO_7 = `import { useState } from 'react'
import FormularioGasto from '../components/FormularioGasto.jsx'
import FiltroCategorias from '../components/FiltroCategorias.jsx'
import ListaGastos from '../components/ListaGastos.jsx'

export default function Inicio({ gastos, alAgregar, alBorrar }) {
  const [filtro, setFiltro] = useState('Todas')

  const visibles = filtro === 'Todas' ? gastos : gastos.filter((gasto) => gasto.categoria === filtro)
  const total = gastos.reduce((suma, gasto) => suma + gasto.monto, 0)

  return (
    <section className="flex flex-col gap-4">
      <FormularioGasto alAgregar={alAgregar} />
      <FiltroCategorias actual={filtro} alElegir={setFiltro} />
      <ListaGastos gastos={visibles} alBorrar={alBorrar} />
      <p className="text-right text-lg font-semibold">{'Total: $' + total}</p>
    </section>
  )
}
`

const RESUMEN_PAG_7 = `import ResumenCategorias from '../components/ResumenCategorias.jsx'

export default function Resumen({ gastos }) {
  const total = gastos.reduce((suma, gasto) => suma + gasto.monto, 0)

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Resumen por categoría</h2>
      <ResumenCategorias gastos={gastos} />
      <p className="text-right text-lg font-semibold">{'Total: $' + total}</p>
    </section>
  )
}
`

const DETALLE_7 = `import { Link, useParams } from 'react-router'

export default function DetalleGasto({ gastos }) {
  const { id } = useParams()
  const gasto = gastos.find((g) => String(g.id) === id)

  if (!gasto) {
    return (
      <section className="flex flex-col gap-3">
        <p>Ese gasto no existe.</p>
        <Link className="text-indigo-600 hover:underline" to="/">
          Volver
        </Link>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold">Detalle del gasto</h2>
      <p>{'Descripción: ' + gasto.descripcion}</p>
      <p>{'Monto: $' + gasto.monto}</p>
      <p>{'Categoría: ' + gasto.categoria}</p>
      <Link className="mt-2 text-indigo-600 hover:underline" to="/">
        Volver
      </Link>
    </section>
  )
}
`

const LISTA_7 = `import { Link } from 'react-router'

export default function ListaGastos({ gastos, alBorrar }) {
  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
      {gastos.map((gasto) => (
        <li key={gasto.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
          <div>
            <Link className="font-medium text-indigo-700 hover:underline" to={'/gasto/' + gasto.id}>
              {gasto.descripcion}
            </Link>
            <p className="text-sm text-slate-500">{gasto.categoria}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">{'$' + gasto.monto}</span>
            <button
              className="rounded bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200"
              aria-label={'Eliminar ' + gasto.descripcion}
              onClick={() => alBorrar(gasto.id)}
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
`

const FORM_7 = `import { useState } from 'react'
import { CATEGORIAS } from '../categorias.js'

const CAMPO = 'rounded border border-slate-300 bg-white p-2'

export default function FormularioGasto({ alAgregar }) {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0])
  const [error, setError] = useState('')

  function enviar(evento) {
    evento.preventDefault()
    const valor = Number(monto)
    if (descripcion.trim() === '' || !(valor > 0)) {
      setError('Escribe una descripción y un monto mayor que 0')
      return
    }
    alAgregar({ id: Date.now(), descripcion: descripcion.trim(), monto: valor, categoria })
    setDescripcion('')
    setMonto('')
    setError('')
  }

  return (
    <form onSubmit={enviar} className="grid gap-2 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2">
      <input
        className={CAMPO}
        aria-label="Descripción"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <input
        className={CAMPO}
        type="number"
        aria-label="Monto"
        placeholder="Monto"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />
      <select className={CAMPO} aria-label="Categoría" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
        {CATEGORIAS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button className="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700" type="submit">
        Agregar
      </button>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
    </form>
  )
}
`

const FILTRO_7 = `import { CATEGORIAS } from '../categorias.js'

export default function FiltroCategorias({ actual, alElegir }) {
  return (
    <div className="flex flex-wrap gap-2">
      {['Todas', ...CATEGORIAS].map((nombre) => (
        <button
          key={nombre}
          aria-pressed={actual === nombre}
          className={
            'rounded-full px-3 py-1 text-sm hover:bg-indigo-200 ' +
            (actual === nombre ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-100 text-indigo-800')
          }
          onClick={() => alElegir(nombre)}
        >
          {nombre}
        </button>
      ))}
    </div>
  )
}
`

const RESUMEN_7 = `import { CATEGORIAS } from '../categorias.js'

export default function ResumenCategorias({ gastos }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {CATEGORIAS.map((categoria) => {
        const suma = gastos
          .filter((gasto) => gasto.categoria === categoria)
          .reduce((acumulado, gasto) => acumulado + gasto.monto, 0)
        return (
          <li key={categoria} className="rounded-lg bg-white p-3 shadow-sm">
            {categoria + ': $' + suma}
          </li>
        )
      })}
    </ul>
  )
}
`

// ---------------------------------------------------------------------------
// Ayudas para los checks (sin imports: este archivo solo exporta el módulo).
// Todos los checks son de COMPORTAMIENTO sobre la app dibujada.
// ---------------------------------------------------------------------------

const tipear = (name, value) => ({ action: 'type', role: 'textbox', name, value })
const pulsar = (role, name) => ({ action: 'click', role, name })

// Agrega un gasto de prueba y lo borra: no deja rastro (importa desde la etapa 5,
// porque lo agregado se guarda en el navegador). Si `antes` trae pasos, se hacen primero.
const agregarYBorrar = (descripcion, label, antes = []) => ({
  type: 'interaction',
  label,
  steps: [
    ...antes,
    tipear('Descripción', descripcion),
    tipear('Monto', '100'),
    pulsar('button', 'Agregar'),
    pulsar('button', 'Eliminar ' + descripcion),
  ],
  expect: { type: 'count', selector: '[aria-label="Eliminar ' + descripcion + '"]', max: 0 },
})

const IR_A_GASTOS = [pulsar('link', 'Gastos')]

const CONTRATO_FORM =
  'Para poder comprobarlo, los dos campos deben tener su **etiqueta accesible** (el atributo `aria-label`) con los textos **Descripción** y **Monto**, y el botón debe decir **Agregar**. La categoría debe venir elegida por defecto (por ejemplo Comida): el gasto se tiene que poder agregar escribiendo solo descripción y monto.'

const modulo = {
  id: 'm11',
  title: 'Proyecto final',
  summary: 'Construye tu propia app de gastos personales, etapa por etapa, con tu propia estructura.',
  lessons: [
    {
      id: 'm11-l1',
      title: 'Empezamos: la lista de gastos',
      explanation: `Llegó el momento de construir algo tuyo: una **app de gastos personales**, como la libreta donde anotas en qué se va el dinero. La haremos en etapas; cada etapa añade una capacidad nueva y **tu código se conserva** de una etapa a la siguiente.

Una regla de oro: **tú decides la estructura**. Los nombres de archivos, carpetas y componentes son tuyos. Yo solo te digo **qué debe hacer la app**, y la comprobación mira lo que se ve en pantalla (textos, botones, campos), no cómo llamaste a tus piezas.

Por eso a veces te pediré textos exactos visibles (un título, un botón). Son como las etiquetas de los cajones: así la comprobación sabe dónde mirar.

Si en alguna etapa tu código se enreda, hay un botón para empezar esa etapa desde una versión limpia de referencia.`,
      challenges: [
        {
          id: 'm11-l1-c1',
          title: 'Etapa 1: estructura y gastos de ejemplo',
          instructions: `Crea la base de tu app. Debe mostrar:

- Un título principal: **Mis gastos**.
- Una lista con estos 3 gastos de ejemplo (cada uno con su descripción, su monto con el signo \`$\` pegado al número, y su categoría):
  - **Almuerzo**, **$12000**, **Comida**
  - **Bus**, **$3000**, **Transporte**
  - **Cine**, **$20000**, **Ocio**

Las categorías (Comida, Transporte, Ocio) las usaremos más adelante.

Escribe los montos **sin puntos ni comas** (\`$12000\`). Organiza tu código en varios archivos (por ejemplo un componente para la lista); tú eliges los nombres.`,
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return <p>Aquí irá mi app de gastos</p>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Guarda los 3 gastos en un arreglo de objetos, cada uno con descripcion, monto y categoria (y un id para la key). El monto va como número (12000, sin comillas).',
            'Crea un componente en su propio archivo que reciba el arreglo por props y use map para dibujar un <li> por gasto, dentro de un <ul>.',
            "En App.jsx: pon <h1>Mis gastos</h1> y usa tu componente de lista. El monto se escribe {'$' + gasto.monto}.",
          ],
          solution: {
            '/src/gastosEjemplo.js': EJEMPLOS,
            '/src/components/ListaGastos.jsx': LISTA_1,
            '/src/App.jsx': APP_1,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Mis gastos', label: 'Hay un título "Mis gastos"' },
            { type: 'text', match: 'Almuerzo', label: 'Se ve el gasto "Almuerzo"' },
            { type: 'text', match: '12000', label: 'Se ve su monto (12000)' },
            { type: 'text', match: 'Bus', label: 'Se ve el gasto "Bus"' },
            { type: 'text', match: '3000', label: 'Se ve su monto (3000)' },
            { type: 'text', match: 'Cine', label: 'Se ve el gasto "Cine"' },
            { type: 'text', match: '20000', label: 'Se ve su monto (20000)' },
            {
              type: 'file-count',
              min: 3,
              label: 'Separaste tu código en varios archivos',
              message: 'Divide tu app en piezas: crea al menos un archivo de componente además de main.jsx y App.jsx.',
            },
            { type: 'manual', label: '¿Los 3 gastos se ven uno debajo de otro, como una lista?' },
            { type: 'manual', label: '¿Cada gasto muestra también su categoría (Comida, Transporte, Ocio)?' },
          ],
          xp: 30,
        },
      ],
    },
    {
      id: 'm11-l2',
      title: 'Agregar y borrar gastos',
      explanation: `Una libreta que no deja anotar ni tachar no sirve. En esta lección tu app aprende a **agregar** gastos con un formulario y a **borrar** los que sobran.

Dos cosas para que la app sea cómoda de probar y de usar:

- Las etiquetas accesibles (\`aria-label\`) ayudan a quien usa lector de pantalla, y también a nuestra comprobación a encontrar tus campos. Ejemplo: \`<input aria-label="Monto" />\`.
- Valida **con tu código** (un \`if\`), no con atributos como \`required\` o \`min\`: así tú controlas el aviso que se muestra.

Los gastos viven en el estado de un componente (\`useState\`), y los botones llaman funciones que cambian ese estado.

Tres herramientas útiles para esta lección:

- **Un menú desplegable** para elegir la categoría. Es como una lista de opciones en un formulario de papel: marcas una sola. Se escribe así:

\`\`\`jsx
<select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
</select>
\`\`\`

  \`value\` es la opción elegida ahora, y \`onChange\` la actualiza cuando la persona escoge otra. Cada \`<option>\` sale de la lista \`CATEGORIAS\` con \`map\`.
- \`.trim()\` quita los espacios de los extremos de un texto: \`'  Café '.trim()\` queda \`'Café'\`. Sirve para no aceptar una descripción hecha solo de espacios.
- \`reduce\` suma todos los gastos en un solo número: \`gastos.reduce((suma, g) => suma + g.monto, 0)\`. Es como ir echando monedas a una alcancía: empiezas con 0 (el último valor del paréntesis) y, por cada gasto, \`suma\` crece con su monto. Al final tienes el total.`,
      challenges: [
        {
          id: 'm11-l2-c1',
          title: 'Etapa 2: formulario para agregar un gasto',
          startFrom: 'previous',
          instructions: `Haz que se pueda **agregar un gasto** desde un formulario. ${CONTRATO_FORM}

- Campos: descripción (texto), monto (número) y categoría (una lista desplegable con Comida, Transporte, Ocio y Otros).
- Al pulsar **Agregar**, el gasto nuevo aparece al final de la lista y el formulario se vacía.
- **Validación:** si la descripción está vacía (o solo espacios) o el monto no es mayor que 0, NO se agrega y se muestra el aviso **Escribe una descripción y un monto mayor que 0**.

Los 3 gastos de ejemplo deben seguir estando al inicio.`,
          hints: [
            'Necesitas un estado para la lista de gastos (empieza con los de ejemplo) y un estado para cada campo del formulario.',
            "En la función del submit: evento.preventDefault(), convierte el monto con Number(monto), y si descripcion.trim() === '' o no es mayor que 0, guarda el aviso en un estado y haz return. Copia el aviso tal cual, con 'mayor que 0'.",
            'Si todo está bien: llama a una función que reciba el gasto { id: Date.now(), descripcion, monto, categoria } y haga setGastos([...gastos, nuevo]); luego vacía los campos y el aviso.',
          ],
          solution: {
            '/src/categorias.js': CATEGORIAS,
            '/src/components/FormularioGasto.jsx': FORM_2,
            '/src/App.jsx': APP_2,
          },
          checks: [
            {
              type: 'interaction',
              label: 'Con campos vacíos o inválidos, no se agrega y sale el aviso',
              steps: [tipear('Descripción', '   '), tipear('Monto', '-5'), pulsar('button', 'Agregar')],
              expect: { type: 'text', match: 'Escribe una descripción y un monto mayor que 0' },
            },
            {
              type: 'interaction',
              label: 'Escribir "Helado" con monto 4500 y pulsar Agregar muestra "Helado"',
              steps: [tipear('Descripción', 'Helado'), tipear('Monto', '4500'), pulsar('button', 'Agregar')],
              expect: { type: 'text', match: 'Helado' },
            },
            { type: 'text', match: 'Almuerzo', label: 'Los gastos de ejemplo siguen en la lista' },
            { type: 'role', role: 'button', name: 'Agregar', label: 'Hay un botón "Agregar"' },
            { type: 'manual', label: '¿Puedes elegir la categoría (Comida, Transporte, Ocio, Otros) y el gasto nuevo la muestra?' },
            { type: 'manual', label: '¿Después de agregar un gasto, el formulario queda vacío y el aviso desaparece?' },
          ],
          xp: 30,
        },
        {
          id: 'm11-l2-c2',
          title: 'Etapa 3: borrar gastos y total general',
          startFrom: 'previous',
          instructions: `Dos mejoras:

1. **Borrar:** cada gasto tiene un botón con el texto **Eliminar**. Debe tener como etiqueta accesible (\`aria-label\`) la palabra Eliminar seguida de la descripción del gasto, por ejemplo \`aria-label={'Eliminar ' + gasto.descripcion}\`. Al pulsarlo, ese gasto desaparece (sin ventana de confirmación con \`confirm\`).
2. **Total general:** muestra la suma de todos los gastos con el formato **Total: $35000** (con los 3 de ejemplo). Debe actualizarse al agregar o borrar.`,
          hints: [
            'Para borrar: pasa a la lista una función alBorrar(id) que haga setGastos(gastos.filter((g) => g.id !== id)).',
            "El total se calcula con gastos.reduce((suma, g) => suma + g.monto, 0) en el componente que tiene la lista de gastos (no hace falta un estado nuevo).",
            "Muéstralo con <p>{'Total: $' + total}</p> y escribe el botón así: <button aria-label={'Eliminar ' + gasto.descripcion} onClick={() => alBorrar(gasto.id)}>Eliminar</button>.",
          ],
          solution: {
            '/src/components/ListaGastos.jsx': LISTA_3,
            '/src/App.jsx': APP_3,
          },
          checks: [
            { type: 'text', match: '35000', label: 'Con los 3 gastos de ejemplo el total es 35000' },
            { type: 'role', role: 'button', name: 'Eliminar', min: 3, label: 'Cada gasto tiene su botón "Eliminar"' },
            agregarYBorrar('Zzz prueba', 'Agregar un gasto y borrarlo con su botón "Eliminar" funciona'),
            { type: 'manual', label: '¿El total sube al agregar un gasto y baja al borrar uno?' },
          ],
          xp: 30,
        },
      ],
    },
    {
      id: 'm11-l3',
      title: 'Entender tus gastos',
      explanation: `Anotar gastos es el principio; lo útil es **entender** en qué se va el dinero. Es como separar los billetes en sobres: uno para comida, otro para transporte, otro para diversión.

Para calcular el total de una categoría combinas dos herramientas: \`filter\` (la viste con las listas: te quedas solo con los de esa categoría) y \`reduce\` (la viste en la lección anterior: los suma).

Para el filtro, un estado guarda cuál categoría está elegida, y la lista que dibujas es la versión filtrada del arreglo completo. Los gastos originales **no se tocan**: solo cambias lo que muestras.`,
      challenges: [
        {
          id: 'm11-l3-c1',
          title: 'Etapa 4: totales y filtro por categoría',
          startFrom: 'previous',
          instructions: `Añade dos cosas a tu app:

1. **Totales por categoría:** una sección que muestre una línea por categoría, con este formato exacto: **Comida: $12000**, **Transporte: $3000**, **Ocio: $20000**, Otros: $0 (con los gastos de ejemplo). Se actualizan al agregar o borrar. El **Total** general sigue mostrando todo.
2. **Filtro:** botones Todas, Comida, Transporte, Ocio y Otros (usa botones, no lista desplegable, para que se puedan pulsar y comprobar). Al pulsar una categoría, la lista muestra solo los gastos de esa categoría; **Todas** los muestra todos.`,
          hints: [
            'Para el total de una categoría: gastos.filter((g) => g.categoria === categoria).reduce((suma, g) => suma + g.monto, 0). Repítelo para cada categoría con map sobre tu lista de categorías.',
            "Para el filtro: un estado 'Todas' por defecto. Los botones llaman setFiltro(nombre). La lista que dibujas es filtro === 'Todas' ? gastos : gastos.filter(...).",
            "Cada línea del resumen: <li>{categoria + ': $' + suma}</li>. Los botones: ['Todas', ...categorias].map((n) => <button key={n} onClick={() => setFiltro(n)}>{n}</button>).",
          ],
          solution: {
            '/src/components/FiltroCategorias.jsx': FILTRO_4,
            '/src/components/ResumenCategorias.jsx': RESUMEN_4,
            '/src/App.jsx': APP_4,
          },
          checks: [
            { type: 'text', match: 'Comida: $12000', label: 'Se ve "Comida: $12000"' },
            { type: 'text', match: 'Transporte: $3000', label: 'Se ve "Transporte: $3000"' },
            { type: 'text', match: 'Ocio: $20000', label: 'Se ve "Ocio: $20000"' },
            { type: 'text', match: 'Total: $35000', label: 'El total general sigue diciendo "Total: $35000"' },
            {
              type: 'interaction',
              label: 'Al pulsar "Comida" desaparece "Bus" de la lista',
              steps: [pulsar('button', 'Comida')],
              expect: { type: 'count', selector: '[aria-label="Eliminar Bus"]', max: 0 },
            },
            {
              type: 'interaction',
              label: 'Al pulsar "Transporte" desaparece "Almuerzo" de la lista',
              steps: [pulsar('button', 'Transporte')],
              expect: { type: 'count', selector: '[aria-label="Eliminar Almuerzo"]', max: 0 },
            },
            {
              type: 'interaction',
              label: 'Al pulsar "Todas" vuelven los 3 gastos',
              steps: [pulsar('button', 'Todas')],
              expect: { type: 'role', role: 'button', name: 'Eliminar', min: 3 },
            },
            { type: 'manual', label: '¿Al elegir "Transporte" desaparecen de la lista los gastos que no son de Transporte?' },
            { type: 'manual', label: '¿Si agregas un gasto de Otros, aparece su total?' },
            { type: 'manual', label: '¿Los totales por categoría suben al agregar un gasto nuevo de esa categoría?' },
          ],
          xp: 30,
        },
      ],
    },
    {
      id: 'm11-l4',
      title: 'Que no se pierda nada',
      explanation: `Ahora mismo, si recargas la página, tus gastos desaparecen: es como anotar en una pizarra que alguien borra cada noche. Para que se queden, el navegador ofrece un pequeño cajón llamado \`localStorage\`.

- \`localStorage.setItem('clave', texto)\` guarda un texto.
- \`localStorage.getItem('clave')\` lo recupera (o da \`null\` si no hay nada).
- Solo guarda **texto**, así que conviertes con \`JSON.stringify\` (de arreglo a texto) y \`JSON.parse\` (de texto a arreglo).

Cuándo usarlo: lees al **empezar** (valor inicial del estado) y guardas cada vez que los gastos **cambian** (con \`useEffect\`).

Leer puede fallar (por ejemplo, si el texto guardado está dañado o el navegador no deja usar \`localStorage\`). Para que la app no se rompa, envuelves el intento en un \`try/catch\`, que es como decir "intenta esto y, si sale mal, haz esto otro":

\`\`\`js
try {
  // intenta leer y convertir el texto guardado
} catch {
  // si algo falló, usa una lista vacía
}
\`\`\``,
      challenges: [
        {
          id: 'm11-l4-c1',
          title: 'Etapa 5: guardar los gastos en el navegador',
          startFrom: 'previous',
          instructions: `Haz que tus gastos se guarden:

- Cada vez que agregas o borras un gasto, la lista se guarda con \`localStorage\`.
- Al abrir la app, si hay gastos guardados se usan esos; si no hay nada guardado, empieza con los 3 de ejemplo.
- Si borras todos los gastos y recargas, la lista debe seguir vacía (no vuelven los de ejemplo).

Ojo: a partir de aquí lo que agregues queda guardado también en la vista previa, por eso ya no se comprueban totales exactos.

Si la comprobación de agregar y borrar falla, borra a mano en la vista previa cualquier gasto que empiece por **Zzz** y vuelve a comprobar.`,
          hints: [
            'Calcula el valor inicial del estado con una función que haga localStorage.getItem y, si hay algo, JSON.parse; si no, devuelve los de ejemplo. useState acepta esa función.',
            'Guarda con un useEffect que dependa de los gastos: localStorage.setItem(clave, JSON.stringify(gastos)). Lo de leer NO va en un useEffect: va en la función inicial de useState, para que la primera pantalla ya muestre lo guardado.',
            "Pregunta con if (guardado) y no con si el arreglo tiene elementos: un arreglo vacío guardado es '[]', que es un texto y cuenta como \"hay algo guardado\". Envuelve en try/catch por si el navegador no deja usar el almacenamiento.",
          ],
          solution: {
            '/src/App.jsx': APP_5,
          },
          checks: [
            {
              type: 'file-includes',
              pattern: 'localStorage\\s*\\.\\s*(setItem|getItem)',
              label: 'Tu código usa localStorage.setItem o localStorage.getItem',
              message: 'Guarda y lee con localStorage.setItem y localStorage.getItem.',
            },
            agregarYBorrar('Zzz guardado', 'Agregar y borrar un gasto sigue funcionando'),
            { type: 'manual', label: '¿Si agregas un gasto y recargas la vista previa (botón de recargar), tu gasto sigue ahí?' },
            { type: 'manual', label: '¿Si borras un gasto y recargas, sigue borrado?' },
            { type: 'manual', label: '¿Si borras todos los gastos y recargas, la lista sigue vacía (no vuelven los 3 de ejemplo)?' },
          ],
          xp: 30,
        },
      ],
    },
    {
      id: 'm11-l5',
      title: 'Varias páginas y buena pinta',
      explanation: `Tu app ya hace mucho, pero está toda en una sola pantalla. Vamos a repartirla en **páginas** con React Router (que ya conoces) y luego a darle una **cara bonita y adaptable** con Tailwind, como vestir la casa que ya construiste.

Piezas del módulo de navegación que usarás:

- \`<MemoryRouter>\`, \`<Routes>\` y \`<Route path="..." element={...} />\`.
- \`<Link to="/ruta">\` para moverte sin recargar.
- \`useParams()\` para leer la parte variable de una ruta como \`/gasto/:id\`.

Importa todo desde \`'react-router'\`. En esta vista previa usa \`<MemoryRouter>\` (en vez de BrowserRouter): guarda la ruta en memoria y funciona dentro del editor. Lo importante: la **lista de gastos vive arriba** (en un componente que está por encima de las rutas, o en un Context) para que todas las páginas vean los mismos datos.`,
      challenges: [
        {
          id: 'm11-l5-c1',
          title: 'Etapa 6: varias páginas navegables',
          startFrom: 'previous',
          dependencies: { 'react-router': '^7' },
          instructions: `Reparte tu app en páginas (importando desde \`'react-router'\`):

- Un **menú siempre visible** con dos enlaces: **Gastos** (el enlace debe decir exactamente **Gastos**; la página con el formulario, el filtro, la lista y el total) y **Resumen**.
- La página **Resumen** tiene un título (un \`<h2>\`) **Resumen por categoría** y muestra los totales por categoría.
- Cada gasto de la lista tiene su descripción como **enlace** a su página de **detalle**, con un título **Detalle del gasto**, la descripción, el monto y la categoría, y un enlace **Volver** que regresa a la página de Gastos.
- Mantén todo lo anterior funcionando (agregar con \`aria-label\` "Descripción" y "Monto", botón "Agregar", botones "Eliminar ..."), y el guardado en el navegador.

Si la comprobación de agregar y borrar falla, borra a mano en la vista previa cualquier gasto que empiece por **Zzz** y vuelve a comprobar.`,
          hints: [
            "Mete <MemoryRouter> (en este proyecto puede ir en App.jsx; en el módulo 10 lo pusiste en main.jsx) y un <Routes> con tres <Route>: '/', '/resumen' y '/gasto/:id'. El menú (<nav> con dos <Link>) va dentro del MemoryRouter pero fuera de <Routes>, para que se vea siempre.",
            'Deja los gastos (useState + localStorage) en App y pásalos a cada página por props. En la página de detalle usa const { id } = useParams() y busca con gastos.find((g) => String(g.id) === id).',
            "En la lista, la descripción pasa a ser <Link to={'/gasto/' + gasto.id}>{gasto.descripcion}</Link>. En el detalle, añade <Link to=\"/\">Volver</Link> y el título <h2>Detalle del gasto</h2>.",
          ],
          solution: {
            '/src/pages/Inicio.jsx': INICIO_6,
            '/src/pages/Resumen.jsx': RESUMEN_PAG_6,
            '/src/pages/DetalleGasto.jsx': DETALLE_6,
            '/src/components/ListaGastos.jsx': LISTA_6,
            '/src/App.jsx': APP_6,
          },
          checks: [
            {
              type: 'file-includes',
              pattern: 'from\\s+[\'"]react-router[\'"]',
              label: 'Usas React Router (importado desde "react-router")',
              message: 'Importa desde \'react-router\' (por ejemplo: import { MemoryRouter, Link, Routes, Route } from \'react-router\').',
            },
            { type: 'role', role: 'link', name: 'Gastos', label: 'Hay un enlace "Gastos" en el menú' },
            { type: 'role', role: 'link', name: 'Resumen', label: 'Hay un enlace "Resumen" en el menú' },
            {
              type: 'interaction',
              label: 'Al pulsar "Resumen" aparece el título "Resumen por categoría"',
              steps: [pulsar('link', 'Resumen')],
              expect: { type: 'role', role: 'heading', name: 'Resumen por categoría' },
            },
            {
              type: 'interaction',
              label: 'Al pulsar "Gastos" vuelve la página con el botón "Agregar"',
              steps: [pulsar('link', 'Resumen'), pulsar('link', 'Gastos')],
              expect: { type: 'role', role: 'button', name: 'Agregar' },
            },
            {
              type: 'interaction',
              label: 'Al pulsar la descripción de un gasto se abre su página "Detalle del gasto"',
              steps: [
                ...IR_A_GASTOS,
                tipear('Descripción', 'Zzz detalle'),
                tipear('Monto', '100'),
                pulsar('button', 'Agregar'),
                pulsar('link', 'Zzz detalle'),
              ],
              expect: { type: 'text', match: 'Detalle del gasto' },
            },
            {
              type: 'interaction',
              label: 'Desde el detalle, el enlace "Volver" regresa a la página de Gastos',
              steps: [...IR_A_GASTOS, pulsar('link', 'Zzz detalle'), pulsar('link', 'Volver')],
              expect: { type: 'role', role: 'button', name: 'Agregar' },
            },
            {
              type: 'interaction',
              label: 'Limpieza: se puede borrar el gasto de prueba "Zzz detalle"',
              steps: [...IR_A_GASTOS, pulsar('button', 'Eliminar Zzz detalle')],
              expect: { type: 'count', selector: '[aria-label="Eliminar Zzz detalle"]', max: 0 },
            },
            { type: 'manual', label: '¿La página de detalle muestra la descripción, el monto y la categoría del gasto que elegiste?' },
            { type: 'manual', label: '¿Los gastos y los totales son los mismos en todas las páginas (no se pierden al navegar)?' },
          ],
          xp: 30,
        },
        {
          id: 'm11-l5-c2',
          title: 'Etapa 7: estilo con Tailwind y versión responsive',
          startFrom: 'previous',
          dependencies: { 'react-router': '^7' },
          instructions: `Dale a tu app una cara cuidada con Tailwind, sin romper nada de lo anterior:

- Un diseño coherente: colores, espaciado, bordes redondeados y tipografía con jerarquía (título más grande que el resto).
- Los botones tienen un color de fondo y cambian al pasar el ratón (\`hover:\`).
- Usa flex o grid para ordenar el contenido.
- Es responsive: en pantalla pequeña (celular) todo cabe y se lee bien, y en pantalla ancha se aprovecha (usa prefijos como \`sm:\` o \`md:\`).

Tú decides colores y estilo; abajo hay una lista para que revises tu propio trabajo.

Si la comprobación de agregar y borrar falla, borra a mano en la vista previa cualquier gasto que empiece por **Zzz** y vuelve a comprobar.

Cuando termines: lo lograste. Esta app la construiste tú, pieza por pieza, con tus propias decisiones.`,
          hints: [
            'Empieza por lo grande: un contenedor con mx-auto, max-w-2xl y p-4 que centre el contenido. Luego estilos para los botones: bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700.',
            'Para ordenar: flex con gap-2 (o grid con gap-2) en el formulario y en cada gasto. Para la lista, divide-y y border le dan un aspecto de tarjeta.',
            'Para que sea responsive: piensa primero en el celular (una sola columna) y añade sm:grid-cols-2 o sm:flex-row y sm:p-8 para pantallas más anchas.',
          ],
          solution: {
            '/src/App.jsx': APP_7,
            '/src/pages/Inicio.jsx': INICIO_7,
            '/src/pages/Resumen.jsx': RESUMEN_PAG_7,
            '/src/pages/DetalleGasto.jsx': DETALLE_7,
            '/src/components/ListaGastos.jsx': LISTA_7,
            '/src/components/FormularioGasto.jsx': FORM_7,
            '/src/components/FiltroCategorias.jsx': FILTRO_7,
            '/src/components/ResumenCategorias.jsx': RESUMEN_7,
          },
          checks: [
            { type: 'class', selector: 'button', pattern: '^bg-', label: 'Los botones tienen color de fondo (bg-...)' },
            { type: 'class', selector: '*', pattern: '^hover:', label: 'Algo cambia al pasar el ratón (hover:...)' },
            { type: 'class', selector: '*', pattern: '^(flex|grid|inline-flex)$', label: 'Usas flex o grid para ordenar' },
            { type: 'class', selector: '*', pattern: '^(p|px|py|m|mx|my|gap)-\\d', label: 'Usas espaciado (p-, m- o gap-)' },
            { type: 'class', selector: '*', pattern: '^rounded', label: 'Algo tiene bordes redondeados (rounded)' },
            { type: 'class', selector: '*', pattern: '^text-(xl|2xl|3xl|4xl|lg)$', label: 'El título tiene un tamaño de letra grande (text-xl, text-2xl...)' },
            { type: 'class', selector: '*', pattern: '^(sm|md|lg|xl):', label: 'Tu diseño se adapta con prefijos responsive (sm:, md:, lg:)' },
            agregarYBorrar('Zzz estilo', 'Agregar y borrar un gasto sigue funcionando', IR_A_GASTOS),
            { type: 'role', role: 'link', name: 'Resumen', label: 'El menú con "Resumen" sigue ahí' },
            { type: 'manual', label: 'En pantalla angosta (estrecha la ventana) no hay nada cortado ni que obligue a deslizar de lado' },
            { type: 'manual', label: 'En pantalla ancha el contenido se ve ordenado y aprovecha el espacio' },
            { type: 'manual', label: 'Los colores se leen bien (el texto se distingue del fondo)' },
            { type: 'manual', label: 'Las tres páginas (Gastos, Resumen y Detalle) tienen un estilo parecido' },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
