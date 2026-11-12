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
  id: 'm01',
  title: 'Componentes',
  summary: 'Aprende a escribir JSX y a construir tu pantalla con piezas propias, cada una en su archivo.',
  lessons: [
    {
      id: 'm01-l1',
      title: 'JSX: HTML dentro de JavaScript',
      explanation: `Un componente es una función que **devuelve lo que se ve en pantalla**. Eso que devuelve se escribe en JSX, que parece HTML pero vive dentro de JavaScript.

Es como una receta que termina con "sirve el plato": sin esa última palabra, no llega nada a la mesa. En React, esa palabra es \`return\`.

Dos reglas para no tropezar:

1. Si tu JSX va en las líneas de abajo, abre un paréntesis **en la misma línea** que \`return\`: \`return (\`. Si pones \`return\` solo en su línea, JavaScript piensa que ya terminaste y no devuelve nada. (Si todo cabe en una línea, \`return <h1>Hola</h1>\` también vale, sin paréntesis.)
2. Un componente solo puede devolver **una cosa**. Si tienes varias, mételas dentro de un contenedor (como un \`div\`) o dentro de un envoltorio invisible \`<>\` ... \`</>\` (se llama fragmento).

\`\`\`jsx
export default function App() {
  return (
    <>
      <h1>Mi título</h1>
      <p>Mi párrafo</p>
    </>
  )
}
\`\`\``,
      challenges: [
        {
          id: 'm01-l1-c1',
          title: 'El return con paréntesis',
          instructions:
            'Ahora mismo la página sale en blanco: el `return` está solo en su línea. Fíjate en el subrayado amarillo que pone el editor sobre el código de abajo: es el aviso de que nunca se ejecuta. Arréglalo con `return (` (el paréntesis en la misma línea) y su `)` de cierre para que se vea el título **Mi tienda**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return
    <h1>Mi tienda</h1>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'JavaScript lee "return" solo en una línea como "devuelve nada" y se olvida del JSX de abajo.',
            'Escribe un paréntesis de apertura justo después de return, en la misma línea: return (',
            'Abre con "return (", deja el <h1> en medio y cierra con ")" en una línea propia, antes de la llave } final.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <h1>Mi tienda</h1>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'return[ \\t]*\\(',
              label: 'El return abre un paréntesis en su misma línea',
              message: 'Escribe "return (" con el paréntesis pegado a return, y ciérralo con ")" al final.',
            },
            { type: 'role', role: 'heading', name: 'Mi tienda', label: 'Se ve el título "Mi tienda"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
        {
          id: 'm01-l1-c2',
          title: 'Una sola cosa por return',
          instructions:
            'Este código da error porque devuelve dos cosas sueltas. Envuélvelas en un contenedor (un `div` o un fragmento `<>`) para que se vean el título **Mi tienda** y el párrafo **Abierto todos los días**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <h1>Mi tienda</h1>
    <p>Abierto todos los días</p>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Un return solo puede devolver un elemento "padre". Aquí hay dos hermanos sin padre.',
            'Pon un <div> alrededor de los dos, o bien <> al principio y </> al final.',
            'Después de "return (" escribe <div>, deja el h1 y el p, y cierra con </div> antes del ")".',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return (
    <>
      <h1>Mi tienda</h1>
      <p>Abierto todos los días</p>
    </>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'heading', name: 'Mi tienda', label: 'Se ve el título "Mi tienda"' },
            { type: 'text', match: 'Abierto todos los días', label: 'Se ve el párrafo "Abierto todos los días"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm01-l2',
      title: 'Llaves y className',
      explanation: `Dentro del JSX puedes "abrir una ventana" hacia JavaScript con llaves \`{ }\`. Lo que pongas dentro se calcula y su resultado aparece en pantalla. Es como una carta con huecos: "Querido ___": las llaves son los huecos.

\`\`\`jsx
const nombre = 'Ana'

return <h1>Hola, {nombre}</h1>   // se ve: Hola, Ana
\`\`\`

También sirven para cuentas: \`{2 + 3}\` muestra 5. Cada llave \`{\` que abres debe cerrarse con su \`}\`.

Otra diferencia con HTML: la palabra \`class\` ya la usa JavaScript, así que en JSX se escribe \`className\`:

\`\`\`jsx
<h1 className="titulo">Hola</h1>
\`\`\``,
      challenges: [
        {
          id: 'm01-l2-c1',
          title: 'Un hueco para el nombre',
          instructions:
            'Hay una variable `nombre`, pero el título la trata como texto normal. Usa llaves para que la página muestre **Hola, Ana**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const nombre = 'Ana'

  return (
    <h1>Hola, nombre</h1>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Todo lo que está entre <h1> y </h1> se lee como texto, incluida la palabra "nombre".',
            'Para usar la variable, rodéala con llaves: { }',
            'Escribe <h1>Hola, {nombre}</h1>',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  const nombre = 'Ana'

  return (
    <h1>Hola, {nombre}</h1>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '\\{\\s*nombre\\s*\\}',
              label: 'Usas la variable {nombre} dentro del JSX',
              message: 'Escribe {nombre} (con llaves) dentro del título.',
            },
            { type: 'role', role: 'heading', name: 'Hola, Ana', label: 'Se ve el título "Hola, Ana"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
        {
          id: 'm01-l2-c2',
          title: 'Cuentas y estilos',
          instructions:
            'Completa la cesta: el párrafo debe decir **Tengo 12 manzanas**, pero el 12 debe salir de una cuenta con llaves usando la variable `manzanas` (que vale 4, multiplicada por 3). Además, dale una clase al título con `className` (el nombre que quieras).',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const manzanas = 4

  return (
    <div>
      <h1>Mi cesta</h1>
      <p>Tengo 0 manzanas</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Cambia el 0 por unas llaves { } con la cuenta dentro. En JavaScript, multiplicar es con *.',
            'La cuenta es manzanas * 3. Y en el título añade className="algo" dentro de la etiqueta de apertura.',
            'Escribe <h1 className="titulo">Mi cesta</h1> y <p>Tengo {manzanas * 3} manzanas</p>',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  const manzanas = 4

  return (
    <div>
      <h1 className="titulo">Mi cesta</h1>
      <p>Tengo {manzanas * 3} manzanas</p>
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '\\{\\s*\\(?\\s*(manzanas\\s*\\*\\s*3|3\\s*\\*\\s*manzanas)\\s*\\)?\\s*\\}',
              label: 'El 12 sale de la cuenta {manzanas * 3}',
              message: 'Dentro del párrafo escribe la cuenta entre llaves: {manzanas * 3}.',
            },
            { type: 'text', match: 'Tengo 12 manzanas', label: 'Se ve "Tengo 12 manzanas"' },
            {
              type: 'class',
              selector: 'h1',
              pattern: '.+',
              label: 'El título tiene una clase (className)',
              message: 'Añade className="titulo" a la etiqueta <h1>.',
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm01-l3',
      title: 'Tus propios componentes',
      explanation: `Hasta ahora todo estaba dentro de \`App\`. Pero lo bonito de React es crear tus propias piezas, como bloques de Lego: haces una pieza una vez y la pones donde quieras, las veces que quieras.

Un componente es una función cuyo nombre **empieza con mayúscula** y que devuelve JSX. Se usa como una etiqueta que se cierra sola: \`<Saludo />\`.

\`\`\`jsx
function Saludo() {
  return <h2>Hola a todos</h2>
}

export default function App() {
  return (
    <div>
      <Saludo />
      <Saludo />
    </div>
  )
}
\`\`\`

La mayúscula importa: \`<saludo />\` en minúscula React lo tomaría por una etiqueta HTML inventada.`,
      challenges: [
        {
          id: 'm01-l3-c1',
          title: 'Una pieza, tres veces',
          instructions:
            'En `App.jsx` ya se usa `<Bienvenida />` tres veces, pero el componente no existe. Créalo (en el mismo archivo, arriba de `App`) para que muestre un título `h2` con **Bienvenido a mi página**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <Bienvenida />
      <Bienvenida />
      <Bienvenida />
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Falta definir una función llamada Bienvenida, con B mayúscula, antes de App.',
            'La función devuelve un h2: function Bienvenida() { return <h2>...</h2> }',
            'Escribe function Bienvenida() { return <h2>Bienvenido a mi página</h2> } arriba de export default function App.',
          ],
          solution: {
            '/src/App.jsx': `function Bienvenida() {
  return <h2>Bienvenido a mi página</h2>
}

export default function App() {
  return (
    <div>
      <Bienvenida />
      <Bienvenida />
      <Bienvenida />
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'role',
              role: 'heading',
              name: 'Bienvenido a mi página',
              min: 3,
              label: 'El mensaje aparece tres veces',
              message: 'Crea la función Bienvenida que devuelva <h2>Bienvenido a mi página</h2>.',
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 10,
        },
        {
          id: 'm01-l3-c2',
          title: 'Dos piezas nuevas',
          instructions:
            'Crea dos componentes en `App.jsx`: `Menu`, que muestre una lista (`ul`) con tres elementos (`li`): **Inicio**, **Tienda** y **Contacto**; y `Pie`, que muestre un párrafo **Gracias por visitarnos**. Úsalos en `App`: primero el menú y al final el pie.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1>Mi tienda</h1>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Cada componente es una función con mayúscula inicial que devuelve JSX. Si devuelve varias líneas, usa return ( ... ).',
            'Menu devuelve <ul> con tres <li>. Pie devuelve un <p>. Luego los pones como <Menu /> y <Pie />.',
            'function Menu() { return (<ul><li>Inicio</li><li>Tienda</li><li>Contacto</li></ul>) } y lo mismo con Pie, y dentro de App: <Menu /> debajo del h1 y <Pie /> al final.',
          ],
          solution: {
            '/src/App.jsx': `function Menu() {
  return (
    <ul>
      <li>Inicio</li>
      <li>Tienda</li>
      <li>Contacto</li>
    </ul>
  )
}

function Pie() {
  return <p>Gracias por visitarnos</p>
}

export default function App() {
  return (
    <div>
      <h1>Mi tienda</h1>
      <Menu />
      <Pie />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'role', role: 'listitem', min: 3, label: 'El menú tiene tres elementos' },
            { type: 'text', match: 'Inicio', label: 'Se ve "Inicio"' },
            { type: 'text', match: 'Tienda', label: 'Se ve "Tienda"' },
            { type: 'text', match: 'Contacto', label: 'Se ve "Contacto"' },
            { type: 'text', match: 'Gracias por visitarnos', label: 'Se ve el pie "Gracias por visitarnos"' },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '<Menu[\\s/>][\\s\\S]*<Pie[\\s/>]',
              label: 'App usa <Menu /> y después <Pie />',
              message: 'En App escribe <Menu /> y, más abajo, <Pie />.',
            },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm01-l4',
      title: 'Cada componente en su archivo',
      explanation: `Si guardas todas las recetas en una sola hoja, pronto es un lío. Mejor un archivo por componente, y los archivos en una carpeta. Lo habitual es \`/src/components/\`.

Para pasar un componente de un archivo a otro:

\`\`\`jsx
// /src/components/Menu.jsx
export default function Menu() {
  return <p>Soy el menú</p>
}

// /src/App.jsx
import Menu from './components/Menu.jsx'
\`\`\`

- \`export default\` es "este es el plato principal de este archivo". Al importarlo, le pones el nombre sin llaves.
- También puedes ofrecer varios con \`export function Uno()\` y \`export function Dos()\`. Entonces se importan **con llaves y con el mismo nombre**: \`import { Uno, Dos } from './...'\`.

La ruta empieza con \`./\` (esta carpeta). Para crear un archivo usa el botón **Nuevo archivo**. En la casilla **Nombre del archivo** escribe la carpeta, una barra y el nombre, por ejemplo \`components/Menu.jsx\`: la carpeta se crea sola.`,
      challenges: [
        {
          id: 'm01-l4-c1',
          title: 'Mudanza a components',
          instructions:
            'El componente `Encabezado` vive dentro de `App.jsx`. Mándalo a su propio archivo `/src/components/Encabezado.jsx` (con `export default`) e impórtalo en `App.jsx`. Para crear el archivo, en la casilla **Nombre del archivo** escribe `components/Encabezado.jsx` (la carpeta, una barra y el nombre). La página debe seguir mostrando el título **Mi blog**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `function Encabezado() {
  return <h1>Mi blog</h1>
}

export default function App() {
  return (
    <div>
      <Encabezado />
      <p>Bienvenido a mi rincón</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Pulsa Nuevo archivo y en la casilla Nombre del archivo escribe components/Encabezado.jsx.',
            'Copia la función Encabezado al archivo nuevo, ponle "export default" delante y bórrala de App.jsx.',
            "En App.jsx, arriba del todo: import Encabezado from './components/Encabezado.jsx'",
          ],
          solution: {
            '/src/components/Encabezado.jsx': `export default function Encabezado() {
  return <h1>Mi blog</h1>
}
`,
            '/src/App.jsx': `import Encabezado from './components/Encabezado.jsx'

export default function App() {
  return (
    <div>
      <Encabezado />
      <p>Bienvenido a mi rincón</p>
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/Encabezado\\.jsx$',
              label: 'Existe /src/components/Encabezado.jsx',
              message: 'Falta crear el archivo /src/components/Encabezado.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+Encabezado\\s+from\\s+[\'"]\\./components/Encabezado(\\.jsx)?[\'"]',
              label: 'App.jsx importa Encabezado desde components',
              message: "Falta la línea import Encabezado from './components/Encabezado.jsx' en App.jsx.",
            },
            {
              type: 'file-includes',
              path: '/src/components/Encabezado.jsx',
              pattern: 'export\\s+default',
              label: 'Encabezado.jsx ofrece su componente con export default',
              message: 'Escribe "export default" antes de "function Encabezado".',
            },
            { type: 'role', role: 'heading', name: 'Mi blog', label: 'Se ve el título "Mi blog"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 15,
        },
        {
          id: 'm01-l4-c2',
          title: 'Importar con llaves',
          instructions:
            'El archivo `Respuestas.jsx` ofrece dos botones con `export function`, pero `App.jsx` los importa mal y la página se rompe. Arregla el `import` para que se vean los botones **Sí** y **No**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/components/Respuestas.jsx': `export function BotonSi() {
  return <button>Sí</button>
}

export function BotonNo() {
  return <button>No</button>
}
`,
            '/src/App.jsx': `import BotonSi, BotonNo from './components/Respuestas.jsx'

export default function App() {
  return (
    <div>
      <h1>¿Te gusta React?</h1>
      <BotonSi />
      <BotonNo />
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Los componentes de Respuestas.jsx se ofrecen con "export function", sin "default".',
            'Cuando no hay "default", se importan entre llaves: import { Uno, Dos } from ...',
            "La línea correcta es: import { BotonSi, BotonNo } from './components/Respuestas.jsx'",
          ],
          solution: {
            '/src/App.jsx': `import { BotonSi, BotonNo } from './components/Respuestas.jsx'

export default function App() {
  return (
    <div>
      <h1>¿Te gusta React?</h1>
      <BotonSi />
      <BotonNo />
    </div>
  )
}
`,
          },
          checks: [
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s*\\{[^}]*BotonSi[^}]*\\}\\s*from',
              label: 'El import usa llaves',
              message: 'Rodea los nombres con llaves: import { BotonSi, BotonNo } from ...',
            },
            { type: 'role', role: 'button', name: 'Sí', label: 'Se ve el botón "Sí"' },
            { type: 'role', role: 'button', name: 'No', label: 'Se ve el botón "No"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm01-l5',
      title: 'Tu primera página con piezas',
      explanation: `Momento de juntar todo. Una página bien organizada se parece a una casa: cada habitación (componente) tiene su puerta (archivo) y \`App\` es el pasillo que las conecta.

Receta de siempre, por cada pieza:

1. Crea el archivo en \`/src/components/\`.
2. Escribe la función con mayúscula, con \`return (\` si ocupa varias líneas.
3. Ofrécela con \`export default\`.
4. Impórtala en \`App.jsx\` y úsala como etiqueta.

Si algo sale en blanco, revisa: ¿falta un \`return\`? ¿falta un \`export default\`? ¿está bien la ruta del \`import\`? ¿cerraste todas las llaves?`,
      challenges: [
        {
          id: 'm01-l5-c1',
          title: 'Página personal con tres piezas',
          instructions:
            'Construye una página con tres componentes, cada uno en su archivo dentro de `/src/components/`: `Encabezado.jsx` (un título **Mi página personal**), `Presentacion.jsx` (un párrafo **Soy Ana y estoy aprendiendo React**) y `Pie.jsx` (un párrafo **Hecho con React**). Para cada archivo, pulsa **Nuevo archivo** y en la casilla **Nombre del archivo** escribe, por ejemplo, `components/Pie.jsx` (la carpeta, una barra y el nombre). Usa los tres en `App.jsx`, en ese orden, con un contenedor o fragmento alrededor.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return <p>Aquí irá mi página</p>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Pulsa Nuevo archivo tres veces y escribe en Nombre del archivo: components/Encabezado.jsx, components/Presentacion.jsx y components/Pie.jsx.',
            "Cada archivo: export default function Nombre() { return <etiqueta>texto</etiqueta> }. En App.jsx: tres imports como import Pie from './components/Pie.jsx'.",
            'App devuelve return ( <> <Encabezado /> <Presentacion /> <Pie /> </> ) con los tres imports arriba.',
          ],
          solution: {
            '/src/components/Encabezado.jsx': `export default function Encabezado() {
  return <h1>Mi página personal</h1>
}
`,
            '/src/components/Presentacion.jsx': `export default function Presentacion() {
  return <p>Soy Ana y estoy aprendiendo React</p>
}
`,
            '/src/components/Pie.jsx': `export default function Pie() {
  return <p>Hecho con React</p>
}
`,
            '/src/App.jsx': `import Encabezado from './components/Encabezado.jsx'
import Presentacion from './components/Presentacion.jsx'
import Pie from './components/Pie.jsx'

export default function App() {
  return (
    <>
      <Encabezado />
      <Presentacion />
      <Pie />
    </>
  )
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/components/Encabezado\\.jsx$',
              label: 'Existe components/Encabezado.jsx',
              message: 'Falta crear /src/components/Encabezado.jsx.',
            },
            {
              type: 'file-exists',
              pattern: '^/src/components/Presentacion\\.jsx$',
              label: 'Existe components/Presentacion.jsx',
              message: 'Falta crear /src/components/Presentacion.jsx.',
            },
            {
              type: 'file-exists',
              pattern: '^/src/components/Pie\\.jsx$',
              label: 'Existe components/Pie.jsx',
              message: 'Falta crear /src/components/Pie.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+\\w+\\s+from\\s+[\'"]\\./components/Encabezado(\\.jsx)?[\'"]',
              label: 'App.jsx importa Encabezado',
              message: "Falta import Encabezado from './components/Encabezado.jsx' en App.jsx.",
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: '<Encabezado[\\s/>][\\s\\S]*<Presentacion[\\s/>][\\s\\S]*<Pie[\\s/>]',
              label: 'App usa Encabezado, Presentacion y Pie en ese orden',
              message: 'En App escribe <Encabezado />, luego <Presentacion /> y al final <Pie />.',
            },
            { type: 'role', role: 'heading', name: 'Mi página personal', label: 'Se ve el título "Mi página personal"' },
            { type: 'text', match: 'Soy Ana y estoy aprendiendo React', label: 'Se ve la presentación' },
            { type: 'text', match: 'Hecho con React', label: 'Se ve el pie "Hecho con React"' },
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
