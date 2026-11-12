const MAIN = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`

const LINT = { type: 'lint-clean', label: 'ESLint no encuentra errores' }

const modulo = {
  id: 'm04',
  title: 'Listas y condiciones',
  summary: 'Dibuja listas de datos con map y decide qué mostrar según la situación.',
  lessons: [
    {
      id: 'm04-l1',
      title: 'Muchos elementos con map',
      explanation: `Imagina un molde de galletas: una forma, muchas galletas. \`map\` es ese molde: recorre una lista de datos y fabrica **un elemento de pantalla por cada dato**.

\`\`\`jsx
const frutas = ['Manzana', 'Pera', 'Uva']

<ul>
  {frutas.map((fruta) => (
    <li key={fruta}>{fruta}</li>
  ))}
</ul>
\`\`\`

- \`frutas.map(...)\` recibe una función que dice qué dibujar por cada fruta.
- Va entre llaves \`{ }\` porque es código dentro del JSX.
- \`key\` es una etiqueta con nombre para cada elemento; React la usa para no confundirlos. Pronto la verás mejor.
- Tropiezo clásico: si usas llaves en la función flecha, necesitas \`return\`; con paréntesis \`( )\` se devuelve solo.`,
      challenges: [
        {
          id: 'm04-l1-c1',
          title: 'Lista de compras',
          instructions:
            'La lista de compras está en un arreglo pero la pantalla muestra una lista vacía. Usa `map` para dibujar un `<li>` por cada producto (Leche, Pan, Huevos). Deben verse como elementos `<li>` dentro de la `<ul>`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const compras = ['Leche', 'Pan', 'Huevos']

  return (
    <div>
      <h1>Lista de compras</h1>
      <ul>
      </ul>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Dentro de <ul> abre llaves y escribe compras.map(...).',
            'La función recibe un producto y devuelve un <li> con ese producto adentro. No olvides key={producto}.',
            '{compras.map((producto) => (<li key={producto}>{producto}</li>))}',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  const compras = ['Leche', 'Pan', 'Huevos']

  return (
    <div>
      <h1>Lista de compras</h1>
      <ul>
        {compras.map((producto) => (
          <li key={producto}>{producto}</li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'file-includes', path: '/src/App.jsx', pattern: '\\.map\\s*\\(', label: 'Usas map', message: 'Falta usar compras.map(...).' },
            { type: 'role', role: 'listitem', min: 3, label: 'Se ven 3 elementos de lista', message: 'Debe haber 3 <li>, uno por producto.' },
            { type: 'text', match: 'Huevos', label: 'Se ve "Huevos"', message: 'Debe verse cada producto, incluido "Huevos".' },
          ],
          xp: 10,
        },
        {
          id: 'm04-l1-c2',
          title: 'Una pieza por producto',
          instructions:
            'Crea `/src/components/Producto.jsx`: recibe la prop `nombre` y devuelve un `<li>` con ese nombre. En `App.jsx`, usa `map` para dibujar un `<Producto />` por cada elemento de la lista (Arroz, Café, Azúcar, Sal), sin olvidar `key`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const compras = ['Arroz', 'Café', 'Azúcar', 'Sal']

  return (
    <div>
      <h1>Despensa</h1>
      <ul>
      </ul>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Crea el archivo Producto.jsx dentro de /src/components/ con una función que devuelva <li>{nombre}</li>.',
            'En App.jsx importa Producto y dentro de map devuelve <Producto key={...} nombre={...} />. La key va en lo que devuelve map.',
            '{compras.map((p) => (<Producto key={p} nombre={p} />))} e import Producto from \'./components/Producto.jsx\'.',
          ],
          solution: {
            '/src/components/Producto.jsx': `export default function Producto({ nombre }) {
  return <li>{nombre}</li>
}
`,
            '/src/App.jsx': `import Producto from './components/Producto.jsx'

export default function App() {
  const compras = ['Arroz', 'Café', 'Azúcar', 'Sal']

  return (
    <div>
      <h1>Despensa</h1>
      <ul>
        {compras.map((p) => (
          <Producto key={p} nombre={p} />
        ))}
      </ul>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'file-exists', pattern: '^/src/components/Producto\\.jsx$', label: 'Existe Producto.jsx', message: 'Falta crear /src/components/Producto.jsx.' },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+.+?\\s+from\\s+[\'"]\\./components/Producto(\\.jsx)?[\'"]',
              label: 'App.jsx importa Producto',
              message: "Falta import Producto from './components/Producto.jsx' en App.jsx.",
            },
            { type: 'file-includes', path: '/src/App.jsx', pattern: 'key\\s*=\\s*\\{', label: 'Pones key a cada elemento', message: 'Falta key={...} en el elemento que devuelve map.' },
            { type: 'role', role: 'listitem', min: 4, label: 'Se ven 4 elementos de lista', message: 'Debe haber 4 <li>, uno por producto.' },
            { type: 'text', match: 'Azúcar', label: 'Se ve "Azúcar"', message: 'Debe verse cada producto, incluido "Azúcar".' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm04-l2',
      title: 'Listas de objetos y la key',
      explanation: `Casi nunca tendrás listas de palabras sueltas. Lo normal es una lista de **objetos**: cada uno con varios datos. Por ejemplo, gastos con un \`id\`, una descripción y un monto:

\`\`\`jsx
const gastos = [
  { id: 1, descripcion: 'Café', monto: 35 },
  { id: 2, descripcion: 'Cine', monto: 120 },
]
\`\`\`

Piensa en cajas de mudanza: cada caja lleva una etiqueta única para saber cuál es cuál aunque las cambien de lugar. Esa etiqueta es la **key**. Debe ser única y no cambiar: lo mejor es el \`id\`.

\`\`\`jsx
{gastos.map((gasto) => (
  <li key={gasto.id}>{gasto.descripcion}: {gasto.monto} pesos</li>
))}
\`\`\`

Evita usar la posición (\`index\`) como key si la lista puede cambiar de orden o perder elementos.`,
      challenges: [
        {
          id: 'm04-l2-c1',
          title: 'Lista de gastos',
          instructions:
            'Dibuja cada gasto en un `<li>` con el formato **Café: 35 pesos** (descripción, dos puntos, monto y la palabra pesos). Usa el `id` de cada gasto como `key`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const gastos = [
    { id: 1, descripcion: 'Café', monto: 35 },
    { id: 2, descripcion: 'Cine', monto: 120 },
    { id: 3, descripcion: 'Pan', monto: 18 },
  ]

  return (
    <div>
      <h1>Mis gastos</h1>
      <ul>
      </ul>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Igual que con la lista de compras, pero cada elemento ahora es un objeto: gasto.descripcion y gasto.monto.',
            'Dentro del <li> escribe {gasto.descripcion}: {gasto.monto} pesos y key={gasto.id}.',
            '{gastos.map((gasto) => (<li key={gasto.id}>{gasto.descripcion}: {gasto.monto} pesos</li>))}',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  const gastos = [
    { id: 1, descripcion: 'Café', monto: 35 },
    { id: 2, descripcion: 'Cine', monto: 120 },
    { id: 3, descripcion: 'Pan', monto: 18 },
  ]

  return (
    <div>
      <h1>Mis gastos</h1>
      <ul>
        {gastos.map((gasto) => (
          <li key={gasto.id}>
            {gasto.descripcion}: {gasto.monto} pesos
          </li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'file-includes', path: '/src/App.jsx', pattern: 'key\\s*=\\s*\\{\\s*gasto\\.id\\s*\\}|key\\s*=\\s*\\{\\s*\\w+\\.id\\s*\\}', label: 'Usas el id como key', message: 'Pon key={gasto.id} en el <li>.' },
            { type: 'role', role: 'listitem', min: 3, label: 'Se ven 3 elementos de lista', message: 'Debe haber 3 <li>, uno por gasto.' },
            { type: 'text', match: 'Café: 35 pesos', label: 'Se ve "Café: 35 pesos"', message: 'Cada gasto debe verse como "Café: 35 pesos".' },
            { type: 'text', match: 'Cine: 120 pesos', label: 'Se ve "Cine: 120 pesos"', message: 'Cada gasto debe verse como "Cine: 120 pesos".' },
          ],
          xp: 15,
        },
        {
          id: 'm04-l2-c2',
          title: 'El gasto como pieza',
          instructions:
            'Crea `/src/components/Gasto.jsx`: recibe `descripcion` y `monto` y devuelve un `<li>` que diga **Café: 35 pesos**. En `App.jsx`, dibuja un `<Gasto />` por gasto usando `map` y el `id` como `key`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const gastos = [
    { id: 1, descripcion: 'Café', monto: 35 },
    { id: 2, descripcion: 'Cine', monto: 120 },
    { id: 3, descripcion: 'Pan', monto: 18 },
  ]

  return (
    <div>
      <h1>Mis gastos</h1>
      <ul>
      </ul>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Gasto.jsx: function Gasto({ descripcion, monto }) que devuelva el <li>. No olvides export default.',
            'En App.jsx importa Gasto y dentro del map devuelve <Gasto key={gasto.id} descripcion={gasto.descripcion} monto={gasto.monto} />.',
            'Gasto devuelve <li>{descripcion}: {monto} pesos</li>. La key va en <Gasto key={gasto.id} ... /> dentro de App, no dentro de Gasto.',
          ],
          solution: {
            '/src/components/Gasto.jsx': `export default function Gasto({ descripcion, monto }) {
  return (
    <li>
      {descripcion}: {monto} pesos
    </li>
  )
}
`,
            '/src/App.jsx': `import Gasto from './components/Gasto.jsx'

export default function App() {
  const gastos = [
    { id: 1, descripcion: 'Café', monto: 35 },
    { id: 2, descripcion: 'Cine', monto: 120 },
    { id: 3, descripcion: 'Pan', monto: 18 },
  ]

  return (
    <div>
      <h1>Mis gastos</h1>
      <ul>
        {gastos.map((gasto) => (
          <Gasto key={gasto.id} descripcion={gasto.descripcion} monto={gasto.monto} />
        ))}
      </ul>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'file-exists', pattern: '^/src/components/Gasto\\.jsx$', label: 'Existe Gasto.jsx', message: 'Falta crear /src/components/Gasto.jsx.' },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+.+?\\s+from\\s+[\'"]\\./components/Gasto(\\.jsx)?[\'"]',
              label: 'App.jsx importa Gasto',
              message: "Falta import Gasto from './components/Gasto.jsx' en App.jsx.",
            },
            { type: 'file-includes', path: '/src/App.jsx', pattern: 'key\\s*=\\s*\\{', label: 'Pones key a cada gasto', message: 'Falta key={gasto.id} en <Gasto />.' },
            { type: 'role', role: 'listitem', min: 3, label: 'Se ven 3 elementos de lista', message: 'Debe haber 3 <li>, uno por gasto.' },
            { type: 'text', match: 'Pan: 18 pesos', label: 'Se ve "Pan: 18 pesos"', message: 'Cada gasto debe verse como "Pan: 18 pesos".' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm04-l3',
      title: 'Mostrar solo si... (&&)',
      explanation: `A veces algo solo debe verse en ciertas situaciones: como el letrero "Abierto" de una tienda, que se enciende solo si hay alguien atendiendo. En React se usa \`&&\`:

\`\`\`jsx
{abierto && <p>Estamos atendiendo</p>}
\`\`\`

Se lee: "si \`abierto\` es verdadero, muestra el párrafo; si no, no muestres nada". La condición puede ser una comparación, por ejemplo:

\`\`\`jsx
{compras.length === 0 && <p>No hay elementos</p>}
\`\`\`

\`compras.length\` es cuántos elementos tiene la lista. Dos cosas que ayudan: un \`true/false\` en el estado y un botón que lo cambie con \`setVer(!ver)\` (el signo \`!\` significa "lo contrario").`,
      challenges: [
        {
          id: 'm04-l3-c1',
          title: 'Detalles escondidos',
          instructions:
            'Al inicio solo se ven el título y el botón **Detalles**. Al pulsar el botón debe aparecer un párrafo `<p>` con el texto **Incluye café y pan**; al pulsarlo otra vez, debe desaparecer. Usa un estado verdadero/falso y `&&`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1>Desayuno</h1>
      <button>Detalles</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Crea un estado que empiece en false: const [ver, setVer] = useState(false) (con su import).',
            'El botón cambia el estado al contrario: onClick={() => setVer(!ver)}.',
            'Debajo del botón: {ver && <p>Incluye café y pan</p>}',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [ver, setVer] = useState(false)

  return (
    <div>
      <h1>Desayuno</h1>
      <button onClick={() => setVer(!ver)}>Detalles</button>
      {ver && <p>Incluye café y pan</p>}
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'count', selector: 'p', max: 0, label: 'Al inicio los detalles están ocultos', message: 'Al inicio no debe verse ningún párrafo <p>.' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Detalles' }],
              expect: { type: 'text', match: 'Incluye café y pan' },
              label: 'Al pulsar "Detalles" aparece "Incluye café y pan"',
              message: 'El botón debe cambiar el estado y el párrafo mostrarse con {ver && <p>...</p>}.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Detalles' }],
              expect: { type: 'count', selector: 'p', max: 0 },
              label: 'Al pulsar otra vez, los detalles se ocultan',
              message: 'El segundo clic debe volver el estado a false: setVer(!ver).',
            },
          ],
          xp: 15,
        },
        {
          id: 'm04-l3-c2',
          title: 'Aviso de lista vacía',
          instructions:
            'La lista tiene un botón **Vaciar lista** que la deja sin elementos. Cuando no haya elementos, debe aparecer el mensaje **No hay elementos**. Usa `&&` con `compras.length === 0`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [compras, setCompras] = useState(['Leche', 'Pan'])

  return (
    <div>
      <h1>Compras</h1>
      <ul>
        {compras.map((producto) => (
          <li key={producto}>{producto}</li>
        ))}
      </ul>
      <button onClick={() => setCompras([])}>Vaciar lista</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Escribe el mensaje justo después de la lista, entre llaves.',
            'La condición es compras.length === 0 (tres signos igual: compara).',
            '{compras.length === 0 && <p>No hay elementos</p>}',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [compras, setCompras] = useState(['Leche', 'Pan'])

  return (
    <div>
      <h1>Compras</h1>
      <ul>
        {compras.map((producto) => (
          <li key={producto}>{producto}</li>
        ))}
      </ul>
      {compras.length === 0 && <p>No hay elementos</p>}
      <button onClick={() => setCompras([])}>Vaciar lista</button>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'text', match: 'Leche', label: 'Al inicio se ve la lista con "Leche"', message: 'Al inicio debe seguir viéndose la lista.' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Vaciar lista' }],
              expect: { type: 'text', match: 'No hay elementos' },
              label: 'Al vaciar la lista aparece "No hay elementos"',
              message: 'Añade {compras.length === 0 && <p>No hay elementos</p>} debajo de la lista.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm04-l4',
      title: 'Una cosa u otra (ternario)',
      explanation: `\`&&\` sirve para "mostrar o nada". Cuando quieres elegir **entre dos cosas**, se usa el ternario, como decidir: "si llueve, paraguas; si no, gorra".

\`\`\`jsx
{lluvia ? 'Lleva paraguas' : 'Lleva gorra'}
\`\`\`

Tiene tres partes: \`condición ? si es verdadera : si es falsa\`. Puedes usarlo en un texto, en un botón o con elementos completos:

\`\`\`jsx
<button>{encendida ? 'Apagar' : 'Encender'}</button>
\`\`\`

También sirve con comparaciones: \`monto >= 100 ? 'Gasto grande' : 'Gasto pequeño'\`.`,
      challenges: [
        {
          id: 'm04-l4-c1',
          title: 'Un interruptor, un botón',
          instructions:
            'Ahora la luz tiene un solo botón. Cuando está apagada, el botón dice **Encender** y el texto **La luz está apagada**. Cuando está encendida, el botón dice **Apagar** y el texto **La luz está encendida**. Usa el ternario.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [encendida, setEncendida] = useState(false)

  return (
    <div>
      <p>La luz está apagada</p>
      <button onClick={() => setEncendida(!encendida)}>Encender</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El estado encendida ya existe. Falta que los dos textos cambien según su valor.',
            'Usa llaves y el ternario: {encendida ? \'encendida\' : \'apagada\'} dentro del párrafo.',
            '<p>La luz está {encendida ? \'encendida\' : \'apagada\'}</p> y <button ...>{encendida ? \'Apagar\' : \'Encender\'}</button>',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [encendida, setEncendida] = useState(false)

  return (
    <div>
      <p>La luz está {encendida ? 'encendida' : 'apagada'}</p>
      <button onClick={() => setEncendida(!encendida)}>{encendida ? 'Apagar' : 'Encender'}</button>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'text', match: 'La luz está apagada', label: 'Al inicio dice "La luz está apagada"', message: 'Al inicio debe verse "La luz está apagada".' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Encender' }],
              expect: { type: 'text', match: 'La luz está encendida' },
              label: 'Al pulsar "Encender" dice "La luz está encendida"',
              message: 'Usa {encendida ? \'encendida\' : \'apagada\'} en el texto.',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Apagar' }],
              expect: { type: 'role', role: 'button', name: 'Encender' },
              label: 'Al pulsar "Apagar" el botón vuelve a decir "Encender"',
              message: 'El botón debe decir {encendida ? \'Apagar\' : \'Encender\'}.',
            },
          ],
          xp: 15,
        },
        {
          id: 'm04-l4-c2',
          title: 'Gasto grande o pequeño',
          instructions:
            'Cada gasto debe llevar una etiqueta: si el monto es 100 o más, **Gasto grande**; si no, **Gasto pequeño**. Edita `Gasto.jsx` usando el ternario con `monto >= 100`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Gasto from './components/Gasto.jsx'

export default function App() {
  const gastos = [
    { id: 1, descripcion: 'Café', monto: 35 },
    { id: 2, descripcion: 'Renta', monto: 800 },
    { id: 3, descripcion: 'Pan', monto: 18 },
  ]

  return (
    <div>
      <h1>Mis gastos</h1>
      <ul>
        {gastos.map((gasto) => (
          <Gasto key={gasto.id} descripcion={gasto.descripcion} monto={gasto.monto} />
        ))}
      </ul>
    </div>
  )
}
`,
            '/src/components/Gasto.jsx': `export default function Gasto({ descripcion, monto }) {
  return (
    <li>
      {descripcion}: {monto} pesos
    </li>
  )
}
`,
          },
          activeFile: '/src/components/Gasto.jsx',
          hints: [
            'Añade la etiqueta dentro del <li>, después del monto.',
            'El ternario es: monto >= 100 ? \'Gasto grande\' : \'Gasto pequeño\'.',
            'Escribe después de pesos: - {monto >= 100 ? \'Gasto grande\' : \'Gasto pequeño\'}',
          ],
          solution: {
            '/src/components/Gasto.jsx': `export default function Gasto({ descripcion, monto }) {
  return (
    <li>
      {descripcion}: {monto} pesos - {monto >= 100 ? 'Gasto grande' : 'Gasto pequeño'}
    </li>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'text', match: 'Gasto grande', label: 'Se ve "Gasto grande"', message: 'La Renta (800) debe llevar "Gasto grande".' },
            { type: 'text', match: 'Gasto pequeño', label: 'Se ve "Gasto pequeño"', message: 'El Café (35) debe llevar "Gasto pequeño".' },
            { type: 'text', match: 'Renta: 800 pesos', label: 'Los gastos siguen mostrando su descripción y monto', message: 'No quites "Renta: 800 pesos"; añade la etiqueta.' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm04-l5',
      title: 'Una lista que cambia',
      explanation: `Las listas del estado cambian: se agregan y se quitan cosas. La regla de oro es la misma de siempre: **nunca modifiques el arreglo; entrégale a React uno nuevo**.

- Agregar: copia todo y añade uno al final con los tres puntos (\`...\`):

\`\`\`jsx
setCompras([...compras, nuevo])
\`\`\`

- Quitar: \`filter\` se queda solo con los que cumplen una condición. Para quitar el de cierto \`id\`, te quedas con los que **no** tienen ese id:

\`\`\`jsx
setCompras(compras.filter((c) => c.id !== id))
\`\`\`

Evita \`compras.push(...)\`: cambia el arreglo por dentro y React no se entera de que debe redibujar.`,
      challenges: [
        {
          id: 'm04-l5-c1',
          title: 'Agrega productos',
          instructions:
            'El botón **Agregar producto** crea un producto nuevo pero no lo guarda. Haz que se agregue al final de la lista (usa `[...compras, nuevo]`). Tras pulsar el botón dos veces, la lista debe tener al menos 3 elementos `<li>`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [compras, setCompras] = useState([{ id: 1, nombre: 'Leche' }])

  function agregar() {
    const numero = compras.length + 1
    const nuevo = { id: numero, nombre: 'Producto ' + numero }
  }

  return (
    <div>
      <h1>Compras</h1>
      <ul>
        {compras.map((compra) => (
          <li key={compra.id}>{compra.nombre}</li>
        ))}
      </ul>
      <button onClick={agregar}>Agregar producto</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'En la función agregar falta usar setCompras: es la única forma de cambiar la lista.',
            'No uses compras.push(nuevo). Entrega una copia nueva con el elemento al final.',
            'Dentro de agregar, después de crear nuevo: setCompras([...compras, nuevo])',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [compras, setCompras] = useState([{ id: 1, nombre: 'Leche' }])

  function agregar() {
    const numero = compras.length + 1
    const nuevo = { id: numero, nombre: 'Producto ' + numero }
    setCompras([...compras, nuevo])
  }

  return (
    <div>
      <h1>Compras</h1>
      <ul>
        {compras.map((compra) => (
          <li key={compra.id}>{compra.nombre}</li>
        ))}
      </ul>
      <button onClick={agregar}>Agregar producto</button>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Agregar producto' },
                { action: 'click', role: 'button', name: 'Agregar producto' },
              ],
              expect: { type: 'role', role: 'listitem', min: 3 },
              label: 'Al agregar dos veces hay al menos 3 elementos',
              message: 'La función agregar debe terminar con setCompras([...compras, nuevo]).',
            },
          ],
          xp: 15,
        },
        {
          id: 'm04-l5-c2',
          title: 'Quita productos',
          instructions:
            'Cada producto tiene un botón **Quitar**, pero la función `quitar` está vacía. Complétala con `filter` para que, al pulsar **Quitar** en un producto, desaparezca de la lista.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [compras, setCompras] = useState([
    { id: 1, nombre: 'Leche' },
    { id: 2, nombre: 'Pan' },
    { id: 3, nombre: 'Huevos' },
  ])

  function quitar(id) {
    console.log('Quitar', id)
  }

  return (
    <div>
      <h1>Compras</h1>
      <ul>
        {compras.map((compra) => (
          <li key={compra.id}>
            {compra.nombre}
            <button onClick={() => quitar(compra.id)}>Quitar</button>
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
            'Quitar significa quedarse con todos los demás: eso hace filter.',
            'La condición de filter es: el id de cada compra es distinto (!==) al id recibido.',
            'setCompras(compras.filter((compra) => compra.id !== id)) dentro de quitar, en lugar del console.log.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [compras, setCompras] = useState([
    { id: 1, nombre: 'Leche' },
    { id: 2, nombre: 'Pan' },
    { id: 3, nombre: 'Huevos' },
  ])

  function quitar(id) {
    setCompras(compras.filter((compra) => compra.id !== id))
  }

  return (
    <div>
      <h1>Compras</h1>
      <ul>
        {compras.map((compra) => (
          <li key={compra.id}>
            {compra.nombre}
            <button onClick={() => quitar(compra.id)}>Quitar</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'role', role: 'listitem', min: 3, label: 'Al inicio hay 3 productos', message: 'Al inicio deben verse los 3 productos.' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Quitar' }],
              expect: { type: 'count', selector: 'li', max: 2 },
              label: 'Al pulsar "Quitar" queda un producto menos',
              message: 'quitar debe hacer setCompras(compras.filter(...)).',
            },
          ],
          xp: 15,
        },
        {
          id: 'm04-l5-c3',
          title: 'Mi lista de gastos',
          instructions:
            'Reúne todo. En `App.jsx` guarda en el estado dos gastos iniciales: **Café** de 35 y **Renta** de 800 (cada uno con `id`, `descripcion` y `monto`). Crea `/src/components/Gasto.jsx` (un `<li>` con **Café: 35 pesos**, la etiqueta **Gasto grande** si el monto es 100 o más y **Gasto pequeño** si no, y un botón **Quitar**). `App` debe tener un botón **Agregar gasto** que añada un gasto nuevo de 50 pesos, y mostrar **No hay gastos** cuando no quede ninguno.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1>Mis gastos</h1>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Estado: useState con los dos gastos. Gasto.jsx recibe descripcion, monto y alQuitar. App usa map con key={gasto.id}.',
            'Agregar: setGastos([...gastos, { id: Date.now(), descripcion: \'Gasto nuevo\', monto: 50 }]). Quitar: setGastos(gastos.filter((g) => g.id !== id)). Vacío: {gastos.length === 0 && <p>No hay gastos</p>}.',
            'Gasto: <li>{descripcion}: {monto} pesos - {monto >= 100 ? \'Gasto grande\' : \'Gasto pequeño\'} <button onClick={alQuitar}>Quitar</button></li>, y en App: <Gasto key={gasto.id} ... alQuitar={() => quitar(gasto.id)} />.',
          ],
          solution: {
            '/src/components/Gasto.jsx': `export default function Gasto({ descripcion, monto, alQuitar }) {
  return (
    <li>
      {descripcion}: {monto} pesos - {monto >= 100 ? 'Gasto grande' : 'Gasto pequeño'}
      <button onClick={alQuitar}>Quitar</button>
    </li>
  )
}
`,
            '/src/App.jsx': `import { useState } from 'react'
import Gasto from './components/Gasto.jsx'

export default function App() {
  const [gastos, setGastos] = useState([
    { id: 1, descripcion: 'Café', monto: 35 },
    { id: 2, descripcion: 'Renta', monto: 800 },
  ])

  function agregar() {
    setGastos([...gastos, { id: Date.now(), descripcion: 'Gasto nuevo', monto: 50 }])
  }

  function quitar(id) {
    setGastos(gastos.filter((gasto) => gasto.id !== id))
  }

  return (
    <div>
      <h1>Mis gastos</h1>
      <ul>
        {gastos.map((gasto) => (
          <Gasto
            key={gasto.id}
            descripcion={gasto.descripcion}
            monto={gasto.monto}
            alQuitar={() => quitar(gasto.id)}
          />
        ))}
      </ul>
      {gastos.length === 0 && <p>No hay gastos</p>}
      <button onClick={agregar}>Agregar gasto</button>
    </div>
  )
}
`,
          },
          checks: [
            LINT,
            { type: 'file-exists', pattern: '^/src/components/Gasto\\.jsx$', label: 'Existe Gasto.jsx', message: 'Falta crear /src/components/Gasto.jsx.' },
            { type: 'file-includes', pattern: 'key\\s*=\\s*\\{', label: 'Pones key a cada gasto', message: 'Falta key={gasto.id} en el elemento que devuelve map.' },
            { type: 'text', match: 'Café: 35 pesos', label: 'Se ve "Café: 35 pesos"', message: 'Cada gasto debe verse como "Café: 35 pesos".' },
            { type: 'text', match: 'Gasto grande', label: 'La Renta es "Gasto grande"', message: 'Monto de 100 o más: "Gasto grande".' },
            { type: 'text', match: 'Gasto pequeño', label: 'El Café es "Gasto pequeño"', message: 'Monto menor a 100: "Gasto pequeño".' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Agregar gasto' }],
              expect: { type: 'role', role: 'listitem', min: 3 },
              label: 'Agregar gasto suma un elemento (3 en total)',
              message: 'Agregar debe hacer setGastos([...gastos, nuevo]).',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Quitar' },
                { action: 'click', role: 'button', name: 'Quitar' },
                { action: 'click', role: 'button', name: 'Quitar' },
              ],
              expect: { type: 'text', match: 'No hay gastos' },
              label: 'Al quitar todos aparece "No hay gastos"',
              message: 'Quitar debe usar filter, y falta {gastos.length === 0 && <p>No hay gastos</p>}.',
            },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
