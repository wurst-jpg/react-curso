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
  id: 'm02',
  title: 'Props',
  summary: 'Haz que tus componentes sean flexibles: pásales datos, contenido interior y valores por defecto.',
  lessons: [
    {
      id: 'm02-l1',
      title: 'Pasar datos con props',
      explanation: `Un componente que siempre dice lo mismo sirve de poco. Imagina una receta de pastel: la receta es una sola, pero cambia con los **ingredientes** que le pasas (chocolate, fresa...). En React, esos ingredientes se llaman **props**.

Quien usa el componente los escribe como si fueran atributos de HTML:

\`\`\`jsx
<Saludo nombre="Ana" />
\`\`\`

Y el componente los recibe y los usa con llaves:

\`\`\`jsx
function Saludo(props) {
  return <h2>Hola, {props.nombre}</h2>
}
\`\`\`

Regla: los textos van entre comillas (\`nombre="Ana"\`); todo lo demás (números, cuentas, variables) va entre llaves (\`precio={30}\`).`,
      challenges: [
        {
          id: 'm02-l1-c1',
          title: 'Un saludo para cada persona',
          instructions:
            '`Saludo` siempre dice "Hola, Ana". Haz que reciba la prop `nombre` y la muestre, y en `App.jsx` úsalo dos veces para que la página diga **Hola, Ana** y **Hola, Luis**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Saludo.jsx': `export default function Saludo() {
  return <h2>Hola, Ana</h2>
}
`,
            '/src/App.jsx': `import Saludo from './components/Saludo.jsx'

export default function App() {
  return (
    <div>
      <Saludo />
      <Saludo />
    </div>
  )
}
`,
          },
          activeFile: '/src/components/Saludo.jsx',
          hints: [
            'Una función de componente recibe un solo parámetro con todas las props; suele llamarse props.',
            'En Saludo.jsx: function Saludo(props) y muestra {props.nombre}. En App.jsx: <Saludo nombre="Ana" />',
            'Saludo devuelve <h2>Hola, {props.nombre}</h2>, y en App pones <Saludo nombre="Ana" /> y <Saludo nombre="Luis" />',
          ],
          solution: {
            '/src/components/Saludo.jsx': `export default function Saludo(props) {
  return <h2>Hola, {props.nombre}</h2>
}
`,
            '/src/App.jsx': `import Saludo from './components/Saludo.jsx'

export default function App() {
  return (
    <div>
      <Saludo nombre="Ana" />
      <Saludo nombre="Luis" />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'text', match: 'Hola, Ana', label: 'Se ve "Hola, Ana"' },
            { type: 'text', match: 'Hola, Luis', label: 'Se ve "Hola, Luis"', message: 'Pasa nombre="Luis" a la segunda etiqueta <Saludo />.' },
            {
              type: 'file-includes',
              path: '/src/components/Saludo.jsx',
              pattern: 'props\\.nombre|\\{\\s*nombre\\s*\\}',
              label: 'Saludo usa la prop nombre',
              message: 'En Saludo.jsx muestra {props.nombre} en lugar del texto fijo.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'nombre\\s*=\\s*["\']Luis["\']',
              label: 'App pasa nombre="Luis"',
              message: 'En App.jsx escribe <Saludo nombre="Luis" /> en la segunda etiqueta.',
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
        {
          id: 'm02-l1-c2',
          title: 'Texto y números',
          instructions:
            '`Producto` ya recibe `nombre` y `precio` (por ahora vacíos). En `App.jsx` pásale los datos para que se vean **Café: $30** y **Pan: $12**. Recuerda: textos con comillas, números con llaves. (Dentro de `Producto`, el `$` es solo un texto normal que va pegado delante de las llaves `{props.precio}`: no hay que tocarlo.)',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Producto.jsx': `export default function Producto(props) {
  return <p>{props.nombre}: \${props.precio}</p>
}
`,
            '/src/App.jsx': `import Producto from './components/Producto.jsx'

export default function App() {
  return (
    <div>
      <Producto />
      <Producto />
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Cada <Producto /> necesita sus propios ingredientes: nombre y precio.',
            'El nombre es texto, va con comillas: nombre="Café". El precio es número, va con llaves: precio={30}',
            'Escribe <Producto nombre="Café" precio={30} /> y <Producto nombre="Pan" precio={12} />',
          ],
          solution: {
            '/src/App.jsx': `import Producto from './components/Producto.jsx'

export default function App() {
  return (
    <div>
      <Producto nombre="Café" precio={30} />
      <Producto nombre="Pan" precio={12} />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'text', match: 'Café: $30', label: 'Se ve "Café: $30"' },
            { type: 'text', match: 'Pan: $12', label: 'Se ve "Pan: $12"' },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'precio\\s*=\\s*\\{\\s*30\\s*\\}',
              label: 'El precio se pasa con llaves: precio={30}',
              message: 'Los números van entre llaves: precio={30}.',
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm02-l2',
      title: 'Desarmar las props',
      explanation: `Escribir \`props.nombre\`, \`props.precio\`... cansa. Hay un atajo de JavaScript llamado **desestructuración**: es como abrir la caja de ingredientes y dejar cada uno sobre la mesa con su nombre.

\`\`\`jsx
// Antes
function Saludo(props) {
  return <h2>Hola, {props.nombre}</h2>
}

// Después: llaves en el parámetro, con los nombres de las props
function Saludo({ nombre }) {
  return <h2>Hola, {nombre}</h2>
}
\`\`\`

Con varias props, se separan con comas: \`function Tarjeta({ nombre, edad })\`. Los nombres deben ser iguales a los que usa quien pone la etiqueta.`,
      challenges: [
        {
          id: 'm02-l2-c1',
          title: 'Quita el props.',
          instructions:
            'La `Tarjeta` funciona, pero repite `props.` en todas partes. Reescríbela con desestructuración, `{ nombre, edad }`, sin cambiar lo que se ve: **Ana tiene 30 años**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Tarjeta.jsx': `export default function Tarjeta(props) {
  return <p>{props.nombre} tiene {props.edad} años</p>
}
`,
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

export default function App() {
  return <Tarjeta nombre="Ana" edad={30} />
}
`,
          },
          activeFile: '/src/components/Tarjeta.jsx',
          hints: [
            'Cambia el parámetro props por unas llaves con los nombres de las props.',
            'function Tarjeta({ nombre, edad }) y dentro usa {nombre} y {edad} sin "props.".',
            'return <p>{nombre} tiene {edad} años</p> con el parámetro { nombre, edad }.',
          ],
          solution: {
            '/src/components/Tarjeta.jsx': `export default function Tarjeta({ nombre, edad }) {
  return <p>{nombre} tiene {edad} años</p>
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/components/Tarjeta.jsx',
              pattern: 'Tarjeta\\s*\\(\\s*\\{[^}]*nombre[^}]*\\}\\s*\\)',
              label: 'Tarjeta recibe { nombre, edad } con llaves',
              message: 'Escribe function Tarjeta({ nombre, edad }) en lugar de (props).',
            },
            { type: 'text', match: 'Ana tiene 30 años', label: 'Se ve "Ana tiene 30 años"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
        {
          id: 'm02-l2-c2',
          title: 'Un perfil desde cero',
          instructions:
            'Crea el archivo `/src/components/Perfil.jsx` (pulsa **Nuevo archivo** y en **Nombre del archivo** escribe `components/Perfil.jsx`) con un componente que reciba `{ nombre, ciudad }` y muestre un título `h2` con el nombre y un párrafo **Vive en** y la ciudad. En `App.jsx` (que ya lo importa) se usa dos veces: debe verse **Ana**, **Vive en Lima**, **Luis** y **Vive en Quito**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Perfil from './components/Perfil.jsx'

export default function App() {
  return (
    <div>
      <Perfil nombre="Ana" ciudad="Lima" />
      <Perfil nombre="Luis" ciudad="Quito" />
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Pulsa Nuevo archivo y en Nombre del archivo escribe components/Perfil.jsx. Debe tener export default.',
            'export default function Perfil({ nombre, ciudad }) { return (...) } con un h2 y un p.',
            'Devuelve <> <h2>{nombre}</h2> <p>Vive en {ciudad}</p> </> dentro de return ( ).',
          ],
          solution: {
            '/src/components/Perfil.jsx': `export default function Perfil({ nombre, ciudad }) {
  return (
    <div>
      <h2>{nombre}</h2>
      <p>Vive en {ciudad}</p>
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/Perfil\\.jsx$',
              label: 'Existe /src/components/Perfil.jsx',
              message: 'Falta crear el archivo /src/components/Perfil.jsx.',
            },
            { type: 'role', role: 'heading', name: 'Ana', label: 'Se ve el título "Ana"' },
            { type: 'role', role: 'heading', name: 'Luis', label: 'Se ve el título "Luis"' },
            { type: 'text', match: 'Vive en Lima', label: 'Se ve "Vive en Lima"' },
            { type: 'text', match: 'Vive en Quito', label: 'Se ve "Vive en Quito"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm02-l3',
      title: 'Children: el contenido del medio',
      explanation: `Una caja de regalo puede llevar cualquier cosa adentro. Un componente también: lo que escribes **entre** la etiqueta de apertura y la de cierre le llega en una prop especial llamada \`children\` ("hijos").

\`\`\`jsx
// Quien lo usa
<Caja>
  <p>Lo que va dentro</p>
</Caja>

// El componente
function Caja({ children }) {
  return <div className="border p-4">{children}</div>
}
\`\`\`

Pon \`{children}\` donde quieres que aparezca el contenido. Puedes combinar \`children\` con otras props: \`function Tarjeta({ titulo, children })\`.`,
      challenges: [
        {
          id: 'm02-l3-c1',
          title: 'Una caja con sorpresa',
          instructions:
            '`Caja` tiene un marco pero no muestra lo que le pones dentro. Haz que muestre sus `children` para que se vea **Hola desde la caja**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Caja.jsx': `export default function Caja() {
  return <div className="border p-4"></div>
}
`,
            '/src/App.jsx': `import Caja from './components/Caja.jsx'

export default function App() {
  return (
    <Caja>
      <p>Hola desde la caja</p>
    </Caja>
  )
}
`,
          },
          activeFile: '/src/components/Caja.jsx',
          hints: [
            'El contenido del medio llega en una prop llamada children.',
            'Recíbela con function Caja({ children }).',
            'Pon {children} entre el <div ...> y el </div>.',
          ],
          solution: {
            '/src/components/Caja.jsx': `export default function Caja({ children }) {
  return <div className="border p-4">{children}</div>
}
`,
          },
          checks: [
            { type: 'text', match: 'Hola desde la caja', label: 'Se ve "Hola desde la caja"' },
            {
              type: 'file-includes',
              path: '/src/components/Caja.jsx',
              pattern: '\\{\\s*(props\\.)?children\\s*\\}',
              label: 'Caja usa {children}',
              message: 'Escribe {children} dentro del div de Caja.',
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
        {
          id: 'm02-l3-c2',
          title: 'Tarjeta con título y contenido',
          instructions:
            '`App.jsx` ya usa un componente `Tarjeta` con un título y contenido, pero falta crearlo. Crea `/src/components/Tarjeta.jsx` (en **Nombre del archivo** escribe `components/Tarjeta.jsx`): debe mostrar el `titulo` en un `h2` y debajo sus `children`. Deben verse **Receta de panqueques** y **Mezclar harina con leche**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Tarjeta from './components/Tarjeta.jsx'

export default function App() {
  return (
    <Tarjeta titulo="Receta de panqueques">
      <p>Mezclar harina con leche</p>
    </Tarjeta>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Pulsa Nuevo archivo y escribe components/Tarjeta.jsx como nombre. Usa export default. Recibe dos cosas: titulo y children.',
            'function Tarjeta({ titulo, children }) y devuelve un contenedor con <h2>{titulo}</h2> y {children}.',
            'return ( <div> <h2>{titulo}</h2> {children} </div> )',
          ],
          solution: {
            '/src/components/Tarjeta.jsx': `export default function Tarjeta({ titulo, children }) {
  return (
    <div>
      <h2>{titulo}</h2>
      {children}
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/Tarjeta\\.jsx$',
              label: 'Existe /src/components/Tarjeta.jsx',
              message: 'Falta crear el archivo /src/components/Tarjeta.jsx.',
            },
            { type: 'role', role: 'heading', name: 'Receta de panqueques', label: 'Se ve el título de la tarjeta' },
            { type: 'text', match: 'Mezclar harina con leche', label: 'Se ve el contenido de la tarjeta' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm02-l4',
      title: 'Valores por defecto',
      explanation: `¿Qué pasa si alguien olvida un ingrediente? La prop llega vacía (\`undefined\`) y en pantalla no sale nada. Para eso existen los valores por defecto: es como decir "si no me dices qué café quieres, te sirvo uno negro".

Se escriben con un \`=\` en la desestructuración:

\`\`\`jsx
function Boton({ texto = 'Aceptar' }) {
  return <button>{texto}</button>
}

<Boton />                  // Aceptar
<Boton texto="Cancelar" /> // Cancelar
\`\`\`

Si la prop sí llega, se usa la que llegó; si no, la de por defecto.`,
      challenges: [
        {
          id: 'm02-l4-c1',
          title: 'Un botón que sabe qué decir',
          instructions:
            'El `Boton` queda vacío cuando no recibe `texto`. Dale el valor por defecto **Aceptar**. En `App.jsx` ya hay un `<Boton />` y un `<Boton texto="Cancelar" />`: deben verse los botones **Aceptar** y **Cancelar**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Boton.jsx': `export default function Boton({ texto }) {
  return <button>{texto}</button>
}
`,
            '/src/App.jsx': `import Boton from './components/Boton.jsx'

export default function App() {
  return (
    <div>
      <Boton />
      <Boton texto="Cancelar" />
    </div>
  )
}
`,
          },
          activeFile: '/src/components/Boton.jsx',
          hints: [
            'El valor por defecto se escribe con = justo después del nombre de la prop.',
            "En el parámetro: { texto = '...' }",
            "function Boton({ texto = 'Aceptar' }) { ... }",
          ],
          solution: {
            '/src/components/Boton.jsx': `export default function Boton({ texto = 'Aceptar' }) {
  return <button>{texto}</button>
}
`,
          },
          checks: [
            {
              type: 'role',
              role: 'button',
              name: 'Aceptar',
              label: 'Se ve el botón "Aceptar"',
              message: "Dale a texto un valor por defecto: { texto = 'Aceptar' }.",
            },
            { type: 'role', role: 'button', name: 'Cancelar', label: 'Se ve el botón "Cancelar"' },
            {
              type: 'file-includes',
              path: '/src/components/Boton.jsx',
              pattern: 'texto\\s*=\\s*[\'"]Aceptar[\'"]',
              label: "texto tiene el valor por defecto 'Aceptar'",
              message: "Escribe { texto = 'Aceptar' } en el parámetro de Boton.",
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
        {
          id: 'm02-l4-c2',
          title: 'Dos valores por defecto',
          instructions:
            '`Bienvenida` muestra `saludo` y `nombre`, pero no tiene valores por defecto. Dale **Hola** a `saludo` y **visitante** a `nombre`. Con los tres usos de `App.jsx` deben verse **Hola, visitante**, **Hola, Ana** y **Buenas, Luis**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Bienvenida.jsx': `export default function Bienvenida({ saludo, nombre }) {
  return <h2>{saludo}, {nombre}</h2>
}
`,
            '/src/App.jsx': `import Bienvenida from './components/Bienvenida.jsx'

export default function App() {
  return (
    <div>
      <Bienvenida />
      <Bienvenida nombre="Ana" />
      <Bienvenida saludo="Buenas" nombre="Luis" />
    </div>
  )
}
`,
          },
          activeFile: '/src/components/Bienvenida.jsx',
          hints: [
            'Cada prop puede tener su propio valor por defecto, separados por coma.',
            "{ saludo = 'Hola', nombre = 'visitante' }",
            "function Bienvenida({ saludo = 'Hola', nombre = 'visitante' }) y el return queda igual.",
          ],
          solution: {
            '/src/components/Bienvenida.jsx': `export default function Bienvenida({ saludo = 'Hola', nombre = 'visitante' }) {
  return <h2>{saludo}, {nombre}</h2>
}
`,
          },
          checks: [
            { type: 'text', match: 'Hola, visitante', label: 'Se ve "Hola, visitante"', message: 'Faltan los valores por defecto saludo = \'Hola\' y nombre = \'visitante\'.' },
            { type: 'text', match: 'Hola, Ana', label: 'Se ve "Hola, Ana"' },
            { type: 'text', match: 'Buenas, Luis', label: 'Se ve "Buenas, Luis"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm02-l5',
      title: 'Todo junto: tarjetas de producto',
      explanation: `Ya conoces las tres herramientas: props para los datos, \`children\` para el contenido del medio, y valores por defecto para los olvidos.

\`\`\`jsx
function Tarjeta({ titulo, etiqueta = 'Nuevo', children }) {
  ...
}
\`\`\`

Un detalle con el precio: para mostrar un signo \`$\` delante de un dato, escribe el \`$\` como texto normal y pega las llaves detrás: \`<p>\${precio}</p>\` se ve como \`$25\`. Ahí el \`$\` es solo una letra más, y \`{precio}\` es el dato.

En un componente real mezclas las tres. Cuando algo no aparezca, revisa: ¿el nombre de la prop es igual en los dos archivos? ¿los números van con llaves? ¿pusiste \`{children}\`?`,
      challenges: [
        {
          id: 'm02-l5-c1',
          title: 'Escaparate de productos',
          instructions:
            'Crea `/src/components/TarjetaProducto.jsx` (en **Nombre del archivo** escribe `components/TarjetaProducto.jsx`). Recibe `nombre`, `precio`, una `etiqueta` con valor por defecto **Nuevo**, y `children` con la descripción. Muestra el nombre en un `h2`, la etiqueta, el precio con el signo `$` delante (por ejemplo **$25**) y los hijos. `App.jsx` ya la usa tres veces: deben verse **Lámpara**, **$25**, **Lámpara de mesa con luz cálida**, la etiqueta **Oferta** (en la segunda tarjeta) y **Nuevo** en las otras dos.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import TarjetaProducto from './components/TarjetaProducto.jsx'

export default function App() {
  return (
    <div>
      <TarjetaProducto nombre="Lámpara" precio={25}>
        <p>Lámpara de mesa con luz cálida</p>
      </TarjetaProducto>
      <TarjetaProducto nombre="Silla" precio={40} etiqueta="Oferta">
        <p>Silla de madera</p>
      </TarjetaProducto>
      <TarjetaProducto nombre="Cojín" precio={8}>
        <p>Cojín suave</p>
      </TarjetaProducto>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Pulsa Nuevo archivo, escribe components/TarjetaProducto.jsx y recibe todo en el parámetro: { nombre, precio, etiqueta = ..., children }.',
            'Devuelve un div (return con paréntesis) con <h2>{nombre}</h2>, un <span> con la etiqueta, un <p> con el precio y {children}.',
            'El precio: <p>${precio}</p> (el $ es texto normal y {precio} es la variable). Valor por defecto: etiqueta = \'Nuevo\'.',
          ],
          solution: {
            '/src/components/TarjetaProducto.jsx': `export default function TarjetaProducto({ nombre, precio, etiqueta = 'Nuevo', children }) {
  return (
    <div>
      <h2>{nombre}</h2>
      <span>{etiqueta}</span>
      <p>\${precio}</p>
      {children}
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/TarjetaProducto\\.jsx$',
              label: 'Existe /src/components/TarjetaProducto.jsx',
              message: 'Falta crear el archivo /src/components/TarjetaProducto.jsx.',
            },
            { type: 'role', role: 'heading', name: 'Lámpara', label: 'Se ve el título "Lámpara"' },
            { type: 'text', match: '$25', label: 'Se ve el precio "$25"' },
            { type: 'text', match: 'Lámpara de mesa con luz cálida', label: 'Se ve la descripción (children)' },
            { type: 'text', match: 'Oferta', label: 'Se ve la etiqueta "Oferta"' },
            {
              type: 'text',
              match: 'Nuevo',
              label: 'Se ve la etiqueta por defecto "Nuevo"',
              message: 'Muestra {etiqueta} en la tarjeta; sin etiqueta debe verse "Nuevo".',
            },
            {
              type: 'file-includes',
              path: '/src/components/TarjetaProducto.jsx',
              pattern: 'etiqueta\\s*=\\s*[\'"]Nuevo[\'"]',
              label: "La etiqueta tiene el valor por defecto 'Nuevo'",
              message: "Escribe etiqueta = 'Nuevo' en el parámetro del componente.",
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
