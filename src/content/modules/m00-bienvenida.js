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
  id: 'm00',
  title: 'Bienvenida',
  summary: 'Conoce las partes de un proyecto de React y a tu corrector de código.',
  lessons: [
    {
      id: 'm00-l1',
      title: 'Las partes de un proyecto',
      explanation: `Un proyecto de React es como una casa pequeña, y cada archivo tiene su trabajo:

- \`index.html\` es el terreno: una página casi vacía con un hueco (un \`div\` llamado "root") donde se construirá todo (no lo verás en las pestañas: la plataforma lo maneja por ti).
- \`main.jsx\` es el constructor: toma tu aplicación y la coloca en ese hueco.
- \`App.jsx\` es la casa en sí: lo que de verdad ves en pantalla.

Casi siempre trabajarás en \`App.jsx\`. Los otros dos se quedan quietos.

Cómo usar el editor:

- Escribe tu código en el editor, y la vista previa se actualiza sola.
- **Comprobar** revisa si tu reto está bien hecho. Al pulsar **Comprobar** la vista previa se reinicia desde cero y tarda unos segundos; es normal.
- **Pista** te da una ayuda poco a poco; **Nuevo archivo** (junto a las pestañas) crea un archivo.
- **Ver solución** te muestra la respuesta, pero da solo la mitad de XP.`,
      challenges: [
        {
          id: 'm00-l1-c1',
          title: 'Di hola',
          instructions:
            'Abre `App.jsx` y cambia el texto del título para que diga **¡Hola, React!**. Fíjate cómo la vista previa cambia sola.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return <h1>Texto por cambiar</h1>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'El texto está entre las etiquetas <h1> y </h1>.',
            'Borra "Texto por cambiar" y escribe en su lugar lo que pide el reto.',
            'No cambies nada más: solo las palabras entre <h1> y </h1>.',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  return <h1>¡Hola, React!</h1>
}
`,
          },
          checks: [
            { type: 'text', match: '¡Hola, React!', label: 'La página dice "¡Hola, React!"' },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm00-l2',
      title: 'Un archivo para cada pieza',
      explanation: `Imagina un cuaderno donde cada tema vive en su propia hoja: es más fácil encontrar todo. En React pasa igual: cada pieza de la pantalla (un componente) vive en su propio archivo.

Para usar una pieza en otro archivo hacen falta dos pasos:

1. En el archivo de la pieza, la ofreces con \`export default\`.
2. En el archivo que la necesita, la traes con \`import\` y la pones como una etiqueta, por ejemplo \`<Saludo />\`.`,
      challenges: [
        {
          id: 'm00-l2-c1',
          title: 'Crea tu primera pieza',
          instructions:
            'Crea un archivo nuevo llamado `/src/Saludo.jsx` con un componente que muestre un título con el texto **Bienvenido al curso**. Luego impórtalo en `App.jsx` y úsalo como `<Saludo />`.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  return <p>Aquí irá mi saludo</p>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Crea el archivo con el botón de nuevo archivo y llámalo Saludo.jsx.',
            'Dentro escribe una función Saludo que devuelva un <h1>, y ofrécela con "export default".',
            'En App.jsx añade arriba: import Saludo from \'./Saludo.jsx\' y usa <Saludo /> en lugar del párrafo.',
          ],
          solution: {
            '/src/Saludo.jsx': `export default function Saludo() {
  return <h1>Bienvenido al curso</h1>
}
`,
            '/src/App.jsx': `import Saludo from './Saludo.jsx'

export default function App() {
  return <Saludo />
}
`,
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/Saludo\\.jsx$',
              label: 'Existe el archivo Saludo.jsx',
              message: 'Falta crear el archivo /src/Saludo.jsx.',
            },
            {
              type: 'file-includes',
              path: '/src/App.jsx',
              pattern: 'import\\s+.+?\\s+from\\s+[\'"]\\./Saludo(\\.jsx)?[\'"]',
              message: "Falta la línea import Saludo from './Saludo.jsx' en App.jsx.",
              label: 'App.jsx importa Saludo',
            },
            {
              type: 'role',
              role: 'heading',
              name: 'Bienvenido al curso',
              label: 'Se ve el título "Bienvenido al curso"',
            },
          ],
          xp: 15,
        },
      ],
    },
    {
      id: 'm00-l3',
      title: 'ESLint, tu corrector',
      explanation: `ESLint es como el corrector ortográfico de un procesador de texto, pero para código. Lee lo que escribes y subraya lo que parece un error.

- Un subrayado **rojo** es un error: algo está mal y conviene arreglarlo.
- Un subrayado **amarillo** es un aviso: probablemente sobra o conviene revisar algo.

Pasa el ratón sobre el subrayado para leer el motivo. Dos clásicos: una variable que creaste y nunca usas, y una variable que usas sin haberla creado.

Mientras el código tenga un error, la vista previa mostrará un mensaje en rojo (en inglés). Es normal: desaparece cuando lo arreglas.`,
      challenges: [
        {
          id: 'm00-l3-c1',
          title: 'Deja el código limpio',
          instructions:
            'Este código tiene dos problemas que ESLint subraya. Arréglalos para que no queden errores y la página muestre **Código limpio**.',
          files: {
            '/src/main.jsx': MAIN,
            '/src/App.jsx': `export default function App() {
  const sobrante = 5
  return <h1>{mensaje}</h1>
}
`,
          },
          activeFile: '/src/App.jsx',
          hints: [
            'Una variable se crea con const antes de usarla. Hay una que se usa sin existir.',
            'Otra variable se crea pero nadie la usa: puedes borrarla.',
            'Crea const mensaje = \'Código limpio\' dentro de la función y borra "sobrante".',
          ],
          solution: {
            '/src/App.jsx': `export default function App() {
  const mensaje = 'Código limpio'
  return <h1>{mensaje}</h1>
}
`,
          },
          checks: [
            { type: 'lint-clean', label: 'ESLint no encuentra errores' },
            { type: 'text', match: 'Código limpio', label: 'La página dice "Código limpio"' },
          ],
          xp: 15,
        },
      ],
    },
  ],
}

export default modulo
