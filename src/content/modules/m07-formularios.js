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
  id: 'm07',
  title: 'Formularios',
  summary: 'Campos que React controla, enviar un formulario y avisar cuando algo está mal escrito.',
  lessons: [
    {
      id: 'm07-l1',
      title: 'Campos controlados',
      explanation: `Un campo de texto normal es como una libreta: lo que escribes se queda en el papel y nadie más lo sabe. En React queremos que **el estado sea la libreta oficial** y que el campo solo la muestre. A eso se le llama campo **controlado**.

Se logra con dos piezas:

- \`value\`: lo que el campo muestra (viene del estado).
- \`onChange\`: lo que pasa cada vez que el usuario teclea (guarda lo nuevo en el estado).

\`\`\`jsx
const [nombre, setNombre] = useState('')

<input
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
/>
\`\`\`

\`e.target.value\` es "lo que hay escrito ahora mismo" en el campo. Como el estado cambia, la página se redibuja y puedes usar \`nombre\` donde quieras (por ejemplo, para saludar).`,
      challenges: [
        {
          id: 'm07-l1-c1',
          title: 'Un campo que obedece',
          instructions:
            'Conecta el campo con el estado `nombre` usando `value` y `onChange`. Cuando escribas **Ana** en el campo, la página debe decir **Hola, Ana**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [nombre, setNombre] = useState('')

  return (
    <div className="p-6">
      <input className="border p-2" placeholder="Tu nombre" />
      <p>Hola, {nombre}</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Ahora mismo el campo no está conectado a nada: escribes pero el estado no se entera.',
            'Al <input> le faltan dos cosas: value={nombre} y un onChange que llame a setNombre.',
            'onChange={(e) => setNombre(e.target.value)} y value={nombre}, los dos dentro de la etiqueta <input ... />.',
          ],
          solution: {
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
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'onChange\\s*=',
              label: 'El campo tiene un onChange',
              message: 'Al <input> le falta onChange={...} para guardar lo que se escribe.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'type', role: 'textbox', value: 'Ana' }],
              expect: { type: 'text', match: 'Hola, Ana' },
              label: 'Al escribir "Ana" la página dice "Hola, Ana"',
              message: 'Escribí "Ana" en el campo y la página no dijo "Hola, Ana". Revisa value y onChange.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm07-l1-c2',
          title: 'Cuenta las letras',
          instructions:
            'Este campo ya es controlado. Debajo del campo muestra cuántas letras lleva escritas con el formato **5 caracteres** (el número cambia según lo escrito). Pista: un texto sabe su largo con `.length`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [texto, setTexto] = useState('')

  return (
    <div className="p-6">
      <input
        className="border p-2"
        placeholder="Escribe algo"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <p>Aquí va el conteo</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El estado "texto" siempre tiene lo último que se escribió.',
            'Un texto sabe cuántas letras tiene con texto.length. Para usarlo dentro del JSX va entre llaves.',
            'Cambia el párrafo por: <p>{texto.length} caracteres</p>',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [texto, setTexto] = useState('')

  return (
    <div className="p-6">
      <input
        className="border p-2"
        placeholder="Escribe algo"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <p>{texto.length} caracteres</p>
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'interaction',
              steps: [{ action: 'type', role: 'textbox', value: 'React' }],
              expect: { type: 'text', match: '5 caracteres' },
              label: 'Al escribir "React" aparece "5 caracteres"',
              message: 'Escribí "React" y no vi "5 caracteres". Muestra {texto.length} seguido de la palabra caracteres.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'type', role: 'textbox', value: 'Hola mundo' }],
              expect: { type: 'text', match: '10 caracteres' },
              label: 'El número cambia con lo que escribes',
              message: 'El conteo no se actualizó con un texto distinto. Usa texto.length, no un número fijo.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm07-l2',
      title: 'Varios campos',
      explanation: `Un formulario de gastos tiene varios campos: qué compraste, cuánto costó, de qué tipo fue. Cada campo controlado necesita su propio lugar en el estado.

Dos detalles que usaremos desde ahora:

- Los campos de **número** (\`type="number"\`) entregan igual un texto: \`"15"\`. Si necesitas sumar, conviértelo con \`Number(monto)\`.
- \`aria-label\` es una etiqueta invisible que le dice a quien no ve la pantalla (y también al corrector del curso) **qué es cada campo**: \`<input aria-label="Monto" />\`. Los retos de este módulo piden estas etiquetas exactas para poder encontrar tus campos.

Cuando hay muchos campos, en lugar de un \`useState\` por cada uno, puedes guardarlos juntos en **un objeto**:

\`\`\`jsx
const [gasto, setGasto] = useState({ descripcion: '', monto: '' })

function cambiar(e) {
  setGasto({ ...gasto, [e.target.name]: e.target.value })
}
\`\`\`

\`...gasto\` copia lo que ya había, y \`[e.target.name]\` cambia solo el campo que se está tecleando (se sabe cuál por su atributo \`name\`).`,
      challenges: [
        {
          id: 'm07-l2-c1',
          title: 'Descripción y monto',
          instructions:
            'Añade el campo del monto: un `<input type="number">` con `aria-label="Monto"` (el nombre que se busca es **Monto**; el otro campo se llama **Descripción**), conectado a un estado `monto` (con `useState`). Al escribir **Café** en la descripción y **15** en el monto, la página debe decir **Gasto: Café por 15**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')

  return (
    <div className="p-6 space-y-2">
      <input
        className="border p-2"
        aria-label="Descripción"
        placeholder="¿Qué compraste?"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <p>Gasto: {descripcion} por {monto}</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'ESLint marca "monto" porque todavía no existe: falta crear su estado, igual que el de descripcion.',
            'Crea const [monto, setMonto] = useState(\'\') y un segundo <input type="number" aria-label="Monto" /> con value y onChange.',
            'El input nuevo: <input type="number" aria-label="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')

  return (
    <div className="p-6 space-y-2">
      <input
        className="border p-2"
        aria-label="Descripción"
        placeholder="¿Qué compraste?"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <input
        className="border p-2"
        type="number"
        aria-label="Monto"
        placeholder="¿Cuánto costó?"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />
      <p>Gasto: {descripcion} por {monto}</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            {
              type: 'role',
              role: 'textbox',
              name: 'Monto',
              label: 'Hay un campo con aria-label "Monto"',
              message: 'Falta el campo del monto con aria-label="Monto".',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Café' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '15' },
              ],
              expect: { type: 'text', match: 'Gasto: Café por 15' },
              label: 'Con "Café" y "15" la página dice "Gasto: Café por 15"',
              message: 'Escribí en los dos campos y no apareció "Gasto: Café por 15". ¿El campo del monto usa value y onChange?',
            },
          ],
          xp: 10,
        },
        {
          id: 'm07-l2-c2',
          title: 'Todo en un objeto',
          instructions:
            'Ahora son tres campos y tres estados: demasiado. Reemplázalos por **un solo estado `gasto`** (un objeto) y una sola función `cambiar` (usa `name` en cada campo y `...gasto` para copiar lo anterior). El comportamiento no debe cambiar: al escribir **Café**, **15** y **Comida**, la página dice **Gasto: Café por 15 (Comida)**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')

  return (
    <div className="p-6 space-y-2">
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
      <input
        className="border p-2"
        aria-label="Categoría"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />
      <p>Gasto: {descripcion} por {monto} ({categoria})</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Un solo useState con un objeto: useState({ descripcion: \'\', monto: \'\', categoria: \'\' }).',
            'Cada input necesita name="descripcion" (o monto / categoria), value={gasto.descripcion} y onChange={cambiar}. La función: setGasto({ ...gasto, [e.target.name]: e.target.value }).',
            'function cambiar(e) { setGasto({ ...gasto, [e.target.name]: e.target.value }) } y el párrafo: Gasto: {gasto.descripcion} por {gasto.monto} ({gasto.categoria}).',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [gasto, setGasto] = useState({ descripcion: '', monto: '', categoria: '' })

  function cambiar(e) {
    setGasto({ ...gasto, [e.target.name]: e.target.value })
  }

  return (
    <div className="p-6 space-y-2">
      <input
        className="border p-2"
        name="descripcion"
        aria-label="Descripción"
        value={gasto.descripcion}
        onChange={cambiar}
      />
      <input
        className="border p-2"
        type="number"
        name="monto"
        aria-label="Monto"
        value={gasto.monto}
        onChange={cambiar}
      />
      <input
        className="border p-2"
        name="categoria"
        aria-label="Categoría"
        value={gasto.categoria}
        onChange={cambiar}
      />
      <p>Gasto: {gasto.descripcion} por {gasto.monto} ({gasto.categoria})</p>
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '\\.\\.\\.\\s*\\w+',
              label: 'Copias lo que ya había con "..." (spread)',
              message: 'Falta copiar el objeto anterior: setGasto({ ...gasto, [e.target.name]: e.target.value }).',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Café' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '15' },
                { action: 'type', role: 'textbox', name: 'Categoría', value: 'Comida' },
              ],
              expect: { type: 'text', match: 'Gasto: Café por 15 (Comida)' },
              label: 'La página dice "Gasto: Café por 15 (Comida)"',
              message: 'Escribí en los tres campos y no apareció "Gasto: Café por 15 (Comida)". Revisa que cada input tenga su name y use gasto.<campo>.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm07-l3',
      title: 'Enviar el formulario',
      explanation: `Cuando llenas un papel y lo entregas en la ventanilla, hay un momento de "enviar". En una página, eso es el evento **submit** del \`<form>\`, que ocurre al pulsar el botón de enviar (o la tecla Enter).

Por costumbre, el navegador al enviar **recarga la página entera**, y se pierde todo lo que React tenía en memoria. Para evitarlo, la primera línea de tu función es siempre \`e.preventDefault()\` ("no hagas lo de siempre, yo me encargo").

\`\`\`jsx
function guardar(e) {
  e.preventDefault()
  setMensaje('Guardado: ' + descripcion)
}

<form onSubmit={guardar}>
  <input value={descripcion} onChange={...} />
  <button>Guardar</button>
</form>
\`\`\`

Nota: el evento va en el **formulario** (\`onSubmit\`), no en el botón (\`onClick\`). Así también funciona con Enter.

Después de guardar, normalmente se **vacía** el campo volviendo a poner el estado en \`''\`.`,
      challenges: [
        {
          id: 'm07-l3-c1',
          title: 'Pulsa Guardar',
          instructions:
            'El botón **Guardar** todavía no hace nada útil (y recarga la página). Haz que el formulario llame a `guardar` al enviarse, que `guardar` use `e.preventDefault()` y que muestre **Guardado: Café** cuando escribas Café y pulses Guardar.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [mensaje, setMensaje] = useState('')

  function guardar() {
    setMensaje('Guardado: ' + descripcion)
  }

  return (
    <form className="p-6 space-y-2">
      <input
        className="border p-2"
        aria-label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      <p>{mensaje}</p>
    </form>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Hay dos cosas por arreglar: conectar el formulario con guardar, y evitar que la página se recargue.',
            'A la etiqueta <form> añade onSubmit={guardar}. Y guardar debe recibir el evento: function guardar(e).',
            'Primera línea de guardar: e.preventDefault(). Y en el form: <form onSubmit={guardar} className="p-6 space-y-2">.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [mensaje, setMensaje] = useState('')

  function guardar(e) {
    e.preventDefault()
    setMensaje('Guardado: ' + descripcion)
  }

  return (
    <form onSubmit={guardar} className="p-6 space-y-2">
      <input
        className="border p-2"
        aria-label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      <p>{mensaje}</p>
    </form>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'preventDefault\\s*\\(',
              label: 'Usas e.preventDefault()',
              message: 'Falta e.preventDefault() al inicio de guardar; sin eso la página se recarga y la vista previa puede dejar de responder.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'onSubmit\\s*=',
              label: 'El formulario tiene onSubmit',
              message: 'Falta onSubmit={guardar} en la etiqueta <form>.',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Café' },
                { action: 'click', role: 'button', name: 'Guardar' },
              ],
              expect: { type: 'text', match: 'Guardado: Café' },
              label: 'Al escribir "Café" y pulsar Guardar aparece "Guardado: Café"',
              message: 'Pulsé Guardar y no apareció "Guardado: Café". ¿El formulario tiene onSubmit y guardar actualiza el mensaje?',
            },
          ],
          xp: 15,
        },
        {
          id: 'm07-l3-c2',
          title: 'Agrega a la lista y limpia',
          instructions:
            'Ya se envía bien, pero falta lo útil: al pulsar **Guardar**, agrega la descripción a la lista `gastos` (sin perder las anteriores) y **vacía el campo** para el siguiente gasto.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [gastos, setGastos] = useState([])

  function guardar(e) {
    e.preventDefault()
    // Agrega la descripción a la lista y vacía el campo
  }

  return (
    <div className="p-6 space-y-2">
      <form onSubmit={guardar} className="space-y-2">
        <input
          className="border p-2"
          aria-label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>
      <ul className="list-disc pl-6">
        {gastos.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Dentro de guardar hacen falta dos líneas: una que agregue a gastos y otra que vacíe la descripción.',
            'Para agregar sin perder lo anterior: setGastos([...gastos, descripcion]). Para vaciar: setDescripcion(\'\').',
            'Escribe en guardar: setGastos([...gastos, descripcion]) y debajo setDescripcion(\'\') (dos comillas seguidas).',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [gastos, setGastos] = useState([])

  function guardar(e) {
    e.preventDefault()
    setGastos([...gastos, descripcion])
    setDescripcion('')
  }

  return (
    <div className="p-6 space-y-2">
      <form onSubmit={guardar} className="space-y-2">
        <input
          className="border p-2"
          aria-label="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>
      <ul className="list-disc pl-6">
        {gastos.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Café' },
                { action: 'click', role: 'button', name: 'Guardar' },
              ],
              expect: { type: 'role', role: 'listitem', name: 'Café' },
              label: 'Al guardar "Café" aparece en la lista',
              message: 'Guardé "Café" y no apareció en la lista. Usa setGastos([...gastos, descripcion]).',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'setDescripcion\\(\\s*[\'"`]{2}\\s*\\)',
              label: 'Vacías el campo con setDescripcion(\'\')',
              message: 'Falta vaciar el campo después de guardar: setDescripcion(\'\').',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm07-l4',
      title: 'Validar antes de guardar',
      explanation: `Un guardia en la puerta revisa que traigas lo necesario antes de dejarte pasar. Un formulario también debe revisar los datos **antes** de guardarlos: no tiene sentido un gasto de 0 pesos o sin monto.

El truco: un estado \`error\` que guarda el aviso (o \`''\` si todo va bien), y un \`return\` temprano que corta la función si algo está mal:

\`\`\`jsx
function guardar(e) {
  e.preventDefault()
  if (Number(monto) <= 0) {
    setError('El monto debe ser mayor que 0')
    return
  }
  setError('')
  // ... aquí sí se guarda
}

{error && <p className="text-red-600">{error}</p>}
\`\`\`

El \`return\` solo, sin nada, significa "sal de la función ahora". Lo que sigue no se ejecuta. Y \`{error && ...}\` muestra el aviso únicamente cuando el texto no está vacío (como en el módulo de condiciones).`,
      challenges: [
        {
          id: 'm07-l4-c1',
          title: 'El monto debe ser positivo',
          instructions:
            'Valida el monto en `guardar`. Si es 0, negativo o está vacío, no guardes nada y muestra el aviso **El monto debe ser mayor que 0**. Si es correcto, guarda como siempre y quita el aviso.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [gastos, setGastos] = useState([])
  const [error, setError] = useState('')

  function guardar(e) {
    e.preventDefault()
    // Aquí falta revisar el monto
    setGastos([...gastos, descripcion])
    setDescripcion('')
    setMonto('')
  }

  return (
    <div className="p-6 space-y-2">
      <form onSubmit={guardar} className="space-y-2">
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
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="list-disc pl-6">
        {gastos.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'La revisión va después de e.preventDefault() y antes de guardar en la lista.',
            'if (Number(monto) <= 0) { setError(...) ; return }  y, si pasa la revisión, setError(\'\') para quitar el aviso.',
            'if (Number(monto) <= 0) { setError(\'El monto debe ser mayor que 0\'); return } y luego setError(\'\') antes de setGastos.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [gastos, setGastos] = useState([])
  const [error, setError] = useState('')

  function guardar(e) {
    e.preventDefault()
    if (Number(monto) <= 0) {
      setError('El monto debe ser mayor que 0')
      return
    }
    setError('')
    setGastos([...gastos, descripcion])
    setDescripcion('')
    setMonto('')
  }

  return (
    <div className="p-6 space-y-2">
      <form onSubmit={guardar} className="space-y-2">
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
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      <ul className="list-disc pl-6">
        {gastos.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Pan' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '0' },
                { action: 'click', role: 'button', name: 'Guardar' },
              ],
              expect: { type: 'text', match: 'El monto debe ser mayor que 0' },
              label: 'Con monto 0 aparece "El monto debe ser mayor que 0"',
              message: 'Probé con monto 0 y no apareció el aviso. Revisa el if y que uses setError con ese texto exacto.',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Café' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '20' },
                { action: 'click', role: 'button', name: 'Guardar' },
              ],
              expect: { type: 'role', role: 'listitem', name: 'Café' },
              label: 'Con monto 20 el gasto "Café" sí se guarda',
              message: 'Con un monto válido el gasto no se guardó. ¿El return solo ocurre dentro del if?',
            },
          ],
          xp: 15,
        },
        {
          id: 'm07-l4-c2',
          title: 'Formulario de gastos completo',
          instructions:
            'Reto del módulo. Crea el archivo `FormularioGasto.jsx` dentro de una carpeta `components` (en el botón de nuevo archivo escribe `components/FormularioGasto.jsx`; se crea la carpeta con el archivo; la vista previa mostrará un error hasta que lo hagas, es normal): un formulario con tres campos (aria-label **Descripción**, **Monto** y **Categoría**), botón **Guardar**, `e.preventDefault()` y el aviso **El monto debe ser mayor que 0**. Al guardar bien llama a `onAgregar({ descripcion, monto: Number(monto), categoria })`. `App.jsx` ya lo usa: no hace falta tocarlo.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'
import FormularioGasto from './components/FormularioGasto.jsx'

export default function App() {
  const [gastos, setGastos] = useState([])

  function agregar(gasto) {
    setGastos([...gastos, gasto])
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mis gastos</h1>
      <FormularioGasto onAgregar={agregar} />
      <ul className="list-disc pl-6">
        {gastos.map((g, i) => (
          <li key={i}>
            {g.descripcion} - {g.categoria}: {g.monto}
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
            'Crea /src/components/FormularioGasto.jsx con una función FormularioGasto({ onAgregar }) y "export default". Dentro: un <form onSubmit={guardar}> con tres inputs y un botón.',
            'Usa tres estados (o un objeto como en la lección 2), e.preventDefault() al inicio, el if de Number(monto) <= 0 con su aviso y return, y al final onAgregar({...}) y, para dejar el formulario listo para el siguiente gasto, vacía los tres campos con setX(\'\').',
            'Estructura: useState para descripcion, monto, categoria, error; function guardar(e) { e.preventDefault(); if (Number(monto) <= 0) { setError(\'El monto debe ser mayor que 0\'); return } setError(\'\'); onAgregar({ descripcion, monto: Number(monto), categoria }); vaciar los tres }.',
          ],
          solution: {
            '/src/components/FormularioGasto.jsx': `import { useState } from 'react'

export default function FormularioGasto({ onAgregar }) {
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [error, setError] = useState('')

  function guardar(e) {
    e.preventDefault()
    if (Number(monto) <= 0) {
      setError('El monto debe ser mayor que 0')
      return
    }
    setError('')
    onAgregar({ descripcion, monto: Number(monto), categoria })
    setDescripcion('')
    setMonto('')
    setCategoria('')
  }

  return (
    <form onSubmit={guardar} className="space-y-2">
      <input
        className="border p-2"
        aria-label="Descripción"
        placeholder="¿Qué compraste?"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <input
        className="border p-2"
        type="number"
        aria-label="Monto"
        placeholder="¿Cuánto costó?"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
      />
      <input
        className="border p-2"
        aria-label="Categoría"
        placeholder="Comida, transporte..."
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/FormularioGasto\\.jsx$',
              label: 'Existe /src/components/FormularioGasto.jsx',
              message: 'Falta crear el archivo /src/components/FormularioGasto.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/components/FormularioGasto.jsx',
              pattern: 'preventDefault\\s*\\(',
              label: 'El formulario usa e.preventDefault()',
              message: 'Falta e.preventDefault() en la función que guarda.',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Pan' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '0' },
                { action: 'type', role: 'textbox', name: 'Categoría', value: 'Comida' },
                { action: 'click', role: 'button', name: 'Guardar' },
              ],
              expect: { type: 'text', match: 'El monto debe ser mayor que 0' },
              label: 'Con monto 0 aparece "El monto debe ser mayor que 0"',
              message: 'Con monto 0 no apareció el aviso. Revisa la validación y el texto exacto.',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'type', role: 'textbox', name: 'Descripción', value: 'Café' },
                { action: 'type', role: 'textbox', name: 'Monto', value: '20' },
                { action: 'type', role: 'textbox', name: 'Categoría', value: 'Comida' },
                { action: 'click', role: 'button', name: 'Guardar' },
              ],
              expect: { type: 'text', match: 'Café - Comida: 20' },
              label: 'Un gasto válido aparece en la lista como "Café - Comida: 20"',
              message: 'Guardé un gasto válido y no apareció "Café - Comida: 20". ¿Llamas a onAgregar con descripcion, monto y categoria?',
            },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
