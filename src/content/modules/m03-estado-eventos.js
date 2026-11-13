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
  id: 'm03',
  title: 'Estado y eventos',
  summary: 'Haz que tu página recuerde cosas y reaccione a clics y a lo que escribe la persona.',
  lessons: [
    {
      id: 'm03-l1',
      title: 'useState: la memoria de tu componente',
      explanation: `Piensa en el marcador de un partido: es un número que cambia, y cada vez que cambia el tablero se vuelve a dibujar. En React ese "marcador" se llama **estado** y se crea con \`useState\`.

\`\`\`jsx
import { useState } from 'react'

function Marcador() {
  const [goles, setGoles] = useState(0)
  // ...
}
\`\`\`

El \`import\` va arriba del archivo, pero la línea con \`useState(0)\` va **dentro** del componente, nunca suelta al inicio del archivo.

- \`goles\` es el valor actual (empieza en 0).
- \`setGoles\` es la función para cambiarlo. Es la **única** forma correcta: no escribas \`goles = 5\`.
- Cuando llamas a \`setGoles(...)\`, React vuelve a dibujar el componente con el valor nuevo.

Para reaccionar a un clic se usa \`onClick\` en el botón, y se le da una función:

\`\`\`jsx
<button onClick={() => setGoles(goles + 1)}>Gol</button>
\`\`\`

\`() => ...\` es una función corta y sin nombre: a la izquierda de la flecha lo que recibe, a la derecha lo que hace. \`onClick={() => setGoles(goles + 1)}\` se lee "cuando hagan clic, suma un gol".`,
      challenges: [
        {
          id: 'm03-l1-c1',
          title: 'Tu primer contador',
          instructions:
            'Ahora el contador no hace nada: usa una variable normal. Cámbialo para que use `useState` (empezando en 0). El botón **Sumar** debe sumar 1 y el botón **Reiniciar** debe volver a 0. La página debe mostrar **Veces: 0** al inicio.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const veces = 0

  return (
    <div>
      <p>Veces: {veces}</p>
      <button>Sumar</button>
      <button>Reiniciar</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Arriba del archivo hay que traer useState desde "react" con un import. Dentro de la función, crea el estado con const [veces, setVeces] = useState(0).',
            'A cada botón añádele onClick con una función flecha: onClick={() => setVeces(veces + 1)} para sumar. Para reiniciar usa setVeces(0).',
            'Código: import { useState } from \'react\' en la primera línea; <button onClick={() => setVeces(veces + 1)}>Sumar</button> y <button onClick={() => setVeces(0)}>Reiniciar</button>.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [veces, setVeces] = useState(0)

  return (
    <div>
      <p>Veces: {veces}</p>
      <button onClick={() => setVeces(veces + 1)}>Sumar</button>
      <button onClick={() => setVeces(0)}>Reiniciar</button>
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
              pattern: 'useState\\s*\\(',
              label: 'Usas useState',
              message: 'Falta usar useState. Escribe const [veces, setVeces] = useState(0).',
            },
            { type: 'text', match: 'Veces: 0', label: 'Al inicio la página dice "Veces: 0"', message: 'Al inicio debe verse "Veces: 0".' },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Reiniciar' },
                { action: 'click', role: 'button', name: 'Sumar' },
                { action: 'click', role: 'button', name: 'Sumar' },
                { action: 'click', role: 'button', name: 'Sumar' },
              ],
              expect: { type: 'text', match: 'Veces: 3' },
              label: 'Al pulsar Sumar tres veces dice "Veces: 3"',
              message: 'Los botones deben usar onClick con setVeces. Sumar: setVeces(veces + 1).',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Sumar' },
                { action: 'click', role: 'button', name: 'Reiniciar' },
              ],
              expect: { type: 'text', match: 'Veces: 0' },
              label: 'Reiniciar vuelve a "Veces: 0"',
              message: 'El botón Reiniciar debe llamar a setVeces(0).',
            },
          ],
          xp: 15,
        },
        {
          id: 'm03-l1-c2',
          title: 'Sube y baja',
          instructions:
            'Añade un botón nuevo con el texto **Restar** que reste 1. Deja funcionando los otros dos. Debe poder verse, por ejemplo, **Veces: 1** después de sumar dos veces y restar una.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [veces, setVeces] = useState(0)

  return (
    <div>
      <p>Veces: {veces}</p>
      <button onClick={() => setVeces(veces + 1)}>Sumar</button>
      <button onClick={() => setVeces(0)}>Reiniciar</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Copia una de las líneas <button ...> y cambia el texto y lo que hace.',
            'Para restar, el estado nuevo es el actual menos 1: setVeces(veces - 1).',
            'Añade <button onClick={() => setVeces(veces - 1)}>Restar</button> junto a los otros botones.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [veces, setVeces] = useState(0)

  return (
    <div>
      <p>Veces: {veces}</p>
      <button onClick={() => setVeces(veces + 1)}>Sumar</button>
      <button onClick={() => setVeces(veces - 1)}>Restar</button>
      <button onClick={() => setVeces(0)}>Reiniciar</button>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'role', role: 'button', name: 'Restar', label: 'Hay un botón "Restar"', message: 'Falta el botón con el texto Restar.' },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Reiniciar' },
                { action: 'click', role: 'button', name: 'Sumar' },
                { action: 'click', role: 'button', name: 'Sumar' },
                { action: 'click', role: 'button', name: 'Restar' },
              ],
              expect: { type: 'text', match: 'Veces: 1' },
              label: 'Sumar, sumar y restar da "Veces: 1"',
              message: 'Restar debe hacer setVeces(veces - 1).',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm03-l2',
      title: 'Eventos y funciones',
      explanation: `El estado no solo guarda números: puede guardar texto, verdadero/falso, y más. Piensa en una etiqueta que pegas y despegas: \`setLuz('encendida')\` pega la etiqueta "encendida".

Cuando el código del clic es largo, puedes ponerlo en una función con nombre y dársela al botón **sin paréntesis**:

\`\`\`jsx
function encender() {
  setLuz('encendida')
}

<button onClick={encender}>Encender</button>
\`\`\`

Cuidado: \`onClick={encender()}\` ejecuta la función al dibujar la página, no al hacer clic. Es como la diferencia entre darle a alguien tu número de teléfono (\`onClick={encender}\`: llama cuando haga falta) y llamarlo ya mismo (\`encender()\`). Entrega la función, no su resultado.`,
      challenges: [
        {
          id: 'm03-l2-c1',
          title: 'Enciende la luz',
          instructions:
            'Haz un interruptor con dos botones: **Encender** y **Apagar**. Guarda en el estado una palabra (empieza en `apagada`) y muestra el texto **La luz está apagada** o **La luz está encendida** según corresponda.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <p>Aquí irá el estado de la luz</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Importa useState y crea const [luz, setLuz] = useState(\'apagada\').',
            'El párrafo muestra el estado así: <p>La luz está {luz}</p>. Los botones llaman a setLuz con la palabra nueva.',
            'Botones: <button onClick={() => setLuz(\'encendida\')}>Encender</button> y <button onClick={() => setLuz(\'apagada\')}>Apagar</button>.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [luz, setLuz] = useState('apagada')

  return (
    <div>
      <p>La luz está {luz}</p>
      <button onClick={() => setLuz('encendida')}>Encender</button>
      <button onClick={() => setLuz('apagada')}>Apagar</button>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'text', match: 'La luz está apagada', label: 'Al inicio dice "La luz está apagada"', message: 'Al inicio debe verse "La luz está apagada".' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Encender' }],
              expect: { type: 'text', match: 'La luz está encendida' },
              label: 'Encender muestra "La luz está encendida"',
              message: 'El botón Encender debe hacer setLuz(\'encendida\').',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Apagar' }],
              expect: { type: 'text', match: 'La luz está apagada' },
              label: 'Apagar vuelve a "La luz está apagada"',
              message: 'El botón Apagar debe hacer setLuz(\'apagada\').',
            },
          ],
          xp: 10,
        },
        {
          id: 'm03-l2-c2',
          title: 'Arregla el clic',
          instructions:
            'Este botón rompe la página: cada clic debe sumar 5 puntos, y la página debe mostrar **Puntos: 0** al inicio. Hay dos errores: encuéntralos y arréglalos. Después de dos clics en **Ganar puntos** se leerá **Puntos: 10**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [puntos, setPuntos] = useState(0)

  function ganarPuntos() {
    setPuntos(puntos + 1)
  }

  return (
    <div>
      <p>Puntos: {puntos}</p>
      <button onClick={ganarPuntos()}>Ganar puntos</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Hay dos fallos. Uno: los paréntesis en onClick={ganarPuntos()} hacen que se ejecute al dibujar.',
            'El otro: la función suma 1 y debe sumar 5.',
            'Deja onClick={ganarPuntos} y dentro de la función escribe setPuntos(puntos + 5).',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [puntos, setPuntos] = useState(0)

  function ganarPuntos() {
    setPuntos(puntos + 5)
  }

  return (
    <div>
      <p>Puntos: {puntos}</p>
      <button onClick={ganarPuntos}>Ganar puntos</button>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'text', match: 'Puntos: 0', label: 'Al inicio dice "Puntos: 0"', message: 'Al inicio debe verse "Puntos: 0". Quita los paréntesis de onClick={ganarPuntos()}.' },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Ganar puntos' },
                { action: 'click', role: 'button', name: 'Ganar puntos' },
              ],
              expect: { type: 'text', match: 'Puntos: 10' },
              label: 'Dos clics dan "Puntos: 10"',
              message: 'Dos clics deben dar 10. La función debe sumar 5 en cada clic.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm03-l3',
      title: 'Escribir en un campo (onChange)',
      explanation: `Un campo de texto avisa cada vez que escribes una letra. Ese aviso se llama \`onChange\`. Es como un mensajero que te dice "ahora el campo contiene esto".

\`\`\`jsx
const [nombre, setNombre] = useState('')

<input value={nombre} onChange={(e) => setNombre(e.target.value)} />
\`\`\`

- \`e\` es el aviso (el "evento").
- \`e.target.value\` es lo que hay escrito en el campo ahora mismo.
- \`value={nombre}\` hace que el campo muestre siempre lo que dice el estado.

Así lo que escribes queda guardado y puedes usarlo en cualquier parte: \`<h1>Hola, {nombre}</h1>\`.`,
      challenges: [
        {
          id: 'm03-l3-c1',
          title: 'Un saludo que te sigue',
          instructions:
            'Haz que lo que se escribe en el campo aparezca en el título. Si escribes `Lucía`, el título debe decir **Hola, Lucía**. Al inicio, con el campo vacío, el título dice **Hola,**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1>Hola,</h1>
      <input />
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Necesitas un estado para guardar el nombre: const [nombre, setNombre] = useState(\'\') (y el import de useState).',
            'El input avisa con onChange. Lo escrito está en e.target.value.',
            'Usa <input value={nombre} onChange={(e) => setNombre(e.target.value)} /> y <h1>Hola, {nombre}</h1>.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [nombre, setNombre] = useState('')

  return (
    <div>
      <h1>Hola, {nombre}</h1>
      <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'role', role: 'textbox', label: 'Hay un campo de texto', message: 'Falta el campo <input />.' },
            {
              type: 'interaction',
              steps: [{ action: 'type', role: 'textbox', value: 'Lucía' }],
              expect: { type: 'role', role: 'heading', name: 'Hola, Lucía' },
              label: 'Al escribir "Lucía" el título dice "Hola, Lucía"',
              message: 'Usa onChange={(e) => setNombre(e.target.value)} en el input y {nombre} en el título.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm03-l3-c2',
          title: 'Cuenta las letras',
          instructions:
            'Debajo del campo muestra cuántas letras llevas escritas, con el texto **Llevas 4 letras** (si escribes 4). Pista: un texto sabe su tamaño con `.length`. Con el campo vacío debe verse **Llevas 0 letras**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <input />
      <p>Aquí irá el conteo</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Igual que antes: un estado de texto y un input con onChange.',
            'Un texto guarda su tamaño en texto.length, y puedes ponerlo entre llaves en el párrafo.',
            '<p>Llevas {texto.length} letras</p> con const [texto, setTexto] = useState(\'\').',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'

export default function App() {
  const [texto, setTexto] = useState('')

  return (
    <div>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <p>Llevas {texto.length} letras</p>
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'text', match: 'Llevas 0 letras', label: 'Al inicio dice "Llevas 0 letras"', message: 'Al inicio debe verse "Llevas 0 letras".' },
            {
              type: 'interaction',
              steps: [{ action: 'type', role: 'textbox', value: 'Hola' }],
              expect: { type: 'text', match: 'Llevas 4 letras' },
              label: 'Al escribir "Hola" dice "Llevas 4 letras"',
              message: 'Guarda lo escrito en el estado y muestra {texto.length}.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm03-l4',
      title: 'Cada pieza con su propia memoria',
      explanation: `Un componente puede tener su propio estado, y cada copia que uses tiene **el suyo**. Es como dos calculadoras iguales: lo que hagas en una no cambia la otra.

\`\`\`jsx
// /src/components/Contador.jsx
import { useState } from 'react'

export default function Contador() {
  const [n, setN] = useState(0)
  return <button onClick={() => setN(n + 1)}>{n}</button>
}
\`\`\`

Y en \`App.jsx\` puedes poner \`<Contador />\` dos veces: cada una cuenta por su lado. Recuerda que las props (módulo anterior) siguen funcionando: pueden configurar a cada copia.`,
      challenges: [
        {
          id: 'm03-l4-c1',
          title: 'Dos contadores independientes',
          instructions:
            'Crea el archivo `/src/components/Contador.jsx` (pulsa **Nuevo archivo** y en **Nombre del archivo** escribe `components/Contador.jsx`) con un componente que muestre **Cuenta: 0** y un botón **Sumar** que suba la cuenta de 1 en 1. En `App.jsx` impórtalo y úsalo dos veces. Al pulsar el primer **Sumar**, solo el primer contador debe subir.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <p>Aquí irán los contadores</p>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Pulsa Nuevo archivo y en la casilla Nombre del archivo escribe components/Contador.jsx (la carpeta se crea sola).',
            'En Contador.jsx: importa useState, crea el estado y devuelve un <div> con <p>Cuenta: {cuenta}</p> y el botón. Ofrécelo con export default.',
            'En App.jsx: import Contador from \'./components/Contador.jsx\' y devuelve <div><Contador /><Contador /></div>.',
          ],
          solution: {
            '/src/components/Contador.jsx': `import { useState } from 'react'

export default function Contador() {
  const [cuenta, setCuenta] = useState(0)

  return (
    <div>
      <p>Cuenta: {cuenta}</p>
      <button onClick={() => setCuenta(cuenta + 1)}>Sumar</button>
    </div>
  )
}
`,
            '/src/App.jsx': `import Contador from './components/Contador.jsx'

export default function App() {
  return (
    <div>
      <Contador />
      <Contador />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            {
              type: 'file-exists',
              pattern: '^/src/components/Contador\\.jsx$',
              label: 'Existe /src/components/Contador.jsx',
              message: 'Falta crear el archivo /src/components/Contador.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+.+?\\s+from\\s+[\'"]\\./components/Contador(\\.jsx)?[\'"]',
              label: 'App.jsx importa Contador',
              message: "Falta import Contador from './components/Contador.jsx' en App.jsx.",
            },
            { type: 'role', role: 'button', name: 'Sumar', min: 2, label: 'Hay dos botones "Sumar"', message: 'Usa <Contador /> dos veces en App.jsx.' },
            { type: 'text', match: 'Cuenta: 0', label: 'Se ve "Cuenta: 0"', message: 'Cada contador debe empezar mostrando "Cuenta: 0".' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Sumar' }],
              expect: { type: 'text', match: 'Cuenta: 1' },
              label: 'El primer "Sumar" sube su contador',
              message: 'El botón debe hacer setCuenta(cuenta + 1).',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Sumar' }],
              expect: { type: 'text', match: 'Cuenta: 0' },
              label: 'El otro contador sigue en "Cuenta: 0"',
              message: 'El estado debe estar dentro de Contador.jsx para que cada copia tenga el suyo.',
            },
          ],
          xp: 20,
        },
        {
          id: 'm03-l4-c2',
          title: 'Contadores con su propio paso',
          instructions:
            'Haz que `Contador` reciba una prop `paso` (cuánto suma cada clic). El botón debe decir **Sumar 1** o **Sumar 5** según el paso. En `App.jsx` usa un contador con paso 1 y otro con paso 5. Si no se da paso, debe valer 1.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import Contador from './components/Contador.jsx'

export default function App() {
  return (
    <div>
      <Contador />
      <Contador />
    </div>
  )
}
`,
            '/src/components/Contador.jsx': `import { useState } from 'react'

export default function Contador() {
  const [cuenta, setCuenta] = useState(0)

  return (
    <div>
      <p>Cuenta: {cuenta}</p>
      <button onClick={() => setCuenta(cuenta + 1)}>Sumar 1</button>
    </div>
  )
}
`,
          },
          activeFile: '/src/components/Contador.jsx',
          hints: [
            'Recibe la prop en la función: function Contador({ paso = 1 }). El = 1 es el valor por defecto.',
            'Úsala en setCuenta(cuenta + paso) y en el texto del botón: Sumar {paso}.',
            'En App.jsx: <Contador paso={1} /> y <Contador paso={5} />.',
          ],
          solution: {
            '/src/components/Contador.jsx': `import { useState } from 'react'

export default function Contador({ paso = 1 }) {
  const [cuenta, setCuenta] = useState(0)

  return (
    <div>
      <p>Cuenta: {cuenta}</p>
      <button onClick={() => setCuenta(cuenta + paso)}>Sumar {paso}</button>
    </div>
  )
}
`,
            '/src/App.jsx': `import Contador from './components/Contador.jsx'

export default function App() {
  return (
    <div>
      <Contador paso={1} />
      <Contador paso={5} />
    </div>
  )
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'file-includes', path: '/src/components/Contador.jsx', pattern: 'paso', label: 'Contador.jsx usa la prop paso', message: 'Contador debe recibir { paso = 1 } y usarla.' },
            { type: 'role', role: 'button', name: 'Sumar 5', label: 'Hay un botón "Sumar 5"', message: 'Falta un contador con paso={5}; su botón debe decir "Sumar 5".' },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Sumar 5' }],
              expect: { type: 'text', match: 'Cuenta: 5' },
              label: '"Sumar 5" lleva su cuenta a 5',
              message: 'El botón debe hacer setCuenta(cuenta + paso).',
            },
            {
              type: 'interaction',
              steps: [{ action: 'click', role: 'button', name: 'Sumar 1' }],
              expect: { type: 'text', match: 'Cuenta: 1' },
              label: '"Sumar 1" lleva su cuenta a 1 sin afectar al otro',
              message: 'El contador de paso 1 debe sumar de 1 en 1.',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm03-l5',
      title: 'Compartir el estado entre piezas',
      explanation: `¿Y si dos piezas necesitan el mismo dato? Ejemplo: un botón que suma y otro lugar que muestra el total. La solución es como un marcador de estadio: el dato vive en el **padre** (\`App\`) y se lo reparte a los hijos con props.

- El padre guarda el estado: \`const [total, setTotal] = useState(0)\`.
- Al hijo le pasa el valor **y** una función para cambiarlo: \`<Boton alSumar={() => setTotal(total + 1)} />\`.
- El hijo no cambia nada directamente: solo llama a la función que recibió.

\`\`\`jsx
export default function Boton({ alSumar }) {
  return <button onClick={alSumar}>Sumar</button>
}
\`\`\`

A esto se le llama "subir el estado": lo pones en el padre más cercano que lo necesita.`,
      challenges: [
        {
          id: 'm03-l5-c1',
          title: 'El marcador está en App',
          instructions:
            'El estado `total` ya vive en `App.jsx`, pero el botón está en otro archivo y no hace nada. Conéctalos: `App` debe pasar una función por la prop `alSumar` y `BotonSumar` debe usarla en `onClick`. Cada clic en **Sumar** sube **Total: 0** a **Total: 1**, etc.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `import { useState } from 'react'
import BotonSumar from './components/BotonSumar.jsx'

export default function App() {
  const [total, setTotal] = useState(0)

  return (
    <div>
      <p>Total: {total}</p>
      <BotonSumar />
    </div>
  )
}
`,
            '/src/components/BotonSumar.jsx': `export default function BotonSumar() {
  return <button>Sumar</button>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'En App.jsx, a <BotonSumar /> hay que darle una prop con una función: alSumar={...}.',
            'La función cambia el total: () => setTotal(total + 1). En BotonSumar recibe { alSumar } y úsala en onClick.',
            'App: <BotonSumar alSumar={() => setTotal(total + 1)} />. BotonSumar: function BotonSumar({ alSumar }) { return <button onClick={alSumar}>Sumar</button> }.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'
import BotonSumar from './components/BotonSumar.jsx'

export default function App() {
  const [total, setTotal] = useState(0)

  return (
    <div>
      <p>Total: {total}</p>
      <BotonSumar alSumar={() => setTotal(total + 1)} />
    </div>
  )
}
`,
            '/src/components/BotonSumar.jsx': `export default function BotonSumar({ alSumar }) {
  return <button onClick={alSumar}>Sumar</button>
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'text', match: 'Total: 0', label: 'Al inicio dice "Total: 0"', message: 'Al inicio debe verse "Total: 0".' },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Sumar' },
                { action: 'click', role: 'button', name: 'Sumar' },
              ],
              expect: { type: 'text', match: 'Total: 2' },
              label: 'Dos clics en "Sumar" dan "Total: 2"',
              message: 'Pasa alSumar desde App y úsalo en el onClick de BotonSumar.',
            },
          ],
          xp: 15,
        },
        {
          id: 'm03-l5-c2',
          title: 'Mini carrito',
          instructions:
            'Construye un carrito con un producto que cuesta 12 pesos. `App.jsx` guarda la `cantidad` (empieza en 1). Crea `/src/components/Cantidad.jsx` (pulsa **Nuevo archivo** y en **Nombre del archivo** escribe `components/Cantidad.jsx`) con los botones **Más** y **Menos** (reciben las funciones por props) y `/src/components/Resumen.jsx` (igual: **Nuevo archivo** y `components/Resumen.jsx`) que muestre **Total: 12 pesos** (cantidad × 12). Con 3 unidades: **Total: 36 pesos**. Que la cantidad no baje de 1.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return (
    <div>
      <h1>Mi carrito</h1>
    </div>
  )
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Estado en App: const [cantidad, setCantidad] = useState(1). Cantidad.jsx recibe { cantidad, alSubir, alBajar } y Resumen.jsx recibe { cantidad }.',
            'Para no bajar de 1 usa Math.max, que elige el mayor de dos números: setCantidad(Math.max(1, cantidad - 1)).',
            'Resumen: <p>Total: {cantidad * 12} pesos</p>. Cantidad: <button onClick={alBajar}>Menos</button> y <button onClick={alSubir}>Más</button>, más un <p>Cantidad: {cantidad}</p>.',
          ],
          solution: {
            '/src/App.jsx': `import { useState } from 'react'
import Cantidad from './components/Cantidad.jsx'
import Resumen from './components/Resumen.jsx'

export default function App() {
  const [cantidad, setCantidad] = useState(1)

  return (
    <div>
      <h1>Mi carrito</h1>
      <Cantidad
        cantidad={cantidad}
        alSubir={() => setCantidad(cantidad + 1)}
        alBajar={() => setCantidad(Math.max(1, cantidad - 1))}
      />
      <Resumen cantidad={cantidad} />
    </div>
  )
}
`,
            '/src/components/Cantidad.jsx': `export default function Cantidad({ cantidad, alSubir, alBajar }) {
  return (
    <div>
      <p>Cantidad: {cantidad}</p>
      <button onClick={alBajar}>Menos</button>
      <button onClick={alSubir}>Más</button>
    </div>
  )
}
`,
            '/src/components/Resumen.jsx': `export default function Resumen({ cantidad }) {
  return <p>Total: {cantidad * 12} pesos</p>
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'file-exists', pattern: '^/src/components/Cantidad\\.jsx$', label: 'Existe Cantidad.jsx', message: 'Falta crear /src/components/Cantidad.jsx.' },
            { type: 'file-exists', pattern: '^/src/components/Resumen\\.jsx$', label: 'Existe Resumen.jsx', message: 'Falta crear /src/components/Resumen.jsx.' },
            { type: 'file-includes', path: '/src/App.jsx', pattern: '<Cantidad\\b', label: 'App.jsx usa <Cantidad />', message: 'Usa <Cantidad ... /> en App.jsx.' },
            { type: 'file-includes', path: '/src/App.jsx', pattern: '<Resumen\\b', label: 'App.jsx usa <Resumen />', message: 'Usa <Resumen ... /> en App.jsx.' },
            { type: 'text', match: 'Total: 12 pesos', label: 'Al inicio dice "Total: 12 pesos"', message: 'Con cantidad 1 debe verse "Total: 12 pesos".' },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Más' },
                { action: 'click', role: 'button', name: 'Más' },
              ],
              expect: { type: 'text', match: 'Total: 36 pesos' },
              label: 'Dos veces "Más" dan "Total: 36 pesos"',
              message: 'El botón Más debe subir la cantidad en App mediante una función que recibe por props.',
            },
            {
              type: 'interaction',
              steps: [
                { action: 'click', role: 'button', name: 'Menos' },
                { action: 'click', role: 'button', name: 'Menos' },
                { action: 'click', role: 'button', name: 'Menos' },
                { action: 'click', role: 'button', name: 'Menos' },
              ],
              expect: { type: 'text', match: 'Total: 12 pesos' },
              label: 'Con "Menos" nunca baja de "Total: 12 pesos"',
              message: 'La cantidad no debe bajar de 1: usa Math.max(1, cantidad - 1).',
            },
          ],
          xp: 30,
        },
      ],
    },
  ],
}

export default modulo
