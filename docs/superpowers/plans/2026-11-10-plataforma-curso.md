# Plataforma del Curso React + Tailwind — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir la plataforma (motor de retos multi-archivo, verificación automática, progreso gamificado, ESLint en vivo) con el Módulo 0 como primer contenido real.

**Architecture:** SPA Vite+React. El contenido del curso son datos JS (`src/content/`). Cada reto se ejecuta en Sandpack; la plataforma inyecta archivos ocultos (entrada, arnés de comprobación, `index.html` con Tailwind) y se comunica con la vista previa por `postMessage` para correr comprobaciones de DOM dentro del iframe. Las comprobaciones de archivos y de lint corren en la página principal. Progreso y código se guardan en `localStorage`.

**Tech Stack:** Vite, React 19, React Router 7, Tailwind CSS 4 (`@tailwindcss/vite`), `@codesandbox/sandpack-react`, `react-markdown`, `eslint-linter-browserify` + `@codemirror/lint`, Vitest + Testing Library + jsdom, Playwright, ESLint 9 (flat config, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`).

**Spec:** `docs/superpowers/specs/2026-11-10-curso-react-design.md`

**Alcance:** Este plan cubre la plataforma + Módulo 0. Los módulos 1–11 van en planes de contenido posteriores (uno por grupo de módulos), que solo añaden archivos en `src/content/modules/` usando el formato definido aquí.

## Global Constraints

- JavaScript (no TypeScript). Todo texto visible en español sencillo, sin jerga sin explicar.
- Uso personal, local (`npm run dev`). Sin login, backend ni despliegue.
- Sandpack necesita internet; la plataforma en sí carga sin internet y muestra un aviso amable si la vista previa no carga.
- Una fase no está terminada sin `npm test`, `npm run lint` y (desde la Tarea 10) `npm run e2e` en verde.
- Verificación: preferir comportamiento/resultado sobre texto exacto del código; nunca rechazar por diferencias de mayúsculas, acentos o espacios en textos visibles.
- Retos multi-archivo desde la Lección 2 del Módulo 0 (anti-objetivo: todo en un archivo).
- `/src/main.jsx` no se puede borrar desde la UI (es la entrada que importa el arnés).
- `localStorage` siempre envuelto en try/catch; si falla o está corrupto, se empieza de cero sin romper.

## Review Focus

1. Código del alumno que lanza error o se cuelga → "Comprobar" no debe quedarse esperando: tras 5000 ms, las comprobaciones de DOM salen `error` con "La vista previa no respondió. Revisa si hay errores en tu código." (test en Tarea 8).
2. `localStorage` corrupto, de otra versión o bloqueado → progreso vacío, sin excepción (test en Tarea 3).
3. Progreso guardado que menciona retos que ya no existen, o contenido nuevo insertado antes de retos ya superados → ids desconocidos se ignoran; lo superado sigue accesible (test en Tarea 3).
4. Pulsar "Comprobar" antes de que la vista previa termine de cargar → se espera al mensaje `harness-ready` (dentro del mismo límite de 5000 ms) antes de enviar (test en Tarea 8).
5. Textos con acentos, mayúsculas o espacios distintos ("¡hola,  react!" vs "¡Hola, React!") → cuentan como iguales (test en Tarea 5).

## Estructura de archivos

```
src/
  main.jsx, App.jsx, index.css          # arranque, rutas, Tailwind
  content/
    course.js                           # ensambla módulos en orden
    schema.js                           # validateCourse()
    modules/m00-bienvenida.js           # Módulo 0
  progress/
    storage.js                          # safeRead/safeWrite localStorage
    progress.js                         # XP, completados, desbloqueo, logros (puro)
    code.js                             # guardado de código por reto, archivos iniciales
    ProgressContext.jsx                 # proveedor React + hook useProgress()
  checks/
    normalize.js                        # normalizeText()
    domRunner.js                        # runDomChecks() — AUTOCONTENIDO, sin imports
    fileChecks.js                       # runFileChecks()
    summarize.js                        # summarizeResults()
  sandbox/
    buildSandbox.js                     # buildSandboxSetup()
    harness.js                          # código del arnés (string) que corre en el iframe
    useCheckRunner.js                   # puente postMessage con timeout
  lint/
    lintSource.js                       # lintSource(), mensajes en español
    lintExtension.js                    # extensión CodeMirror para el editor
  pages/
    CourseMap.jsx, ModulePage.jsx, ChallengePage.jsx
  components/
    Instructions.jsx, Workspace.jsx, FileTabsBar.jsx, CheckPanel.jsx,
    HintBox.jsx, XpBar.jsx, Celebration.jsx
tests/  (espejo de src/, *.test.js[x])
e2e/curso.spec.js
```

## Modelo de datos (lo usan todas las tareas)

```js
// Módulo
{ id: 'm00', title, summary, lessons: [Lesson] }
// Lección
{ id: 'm00-l1', title, explanation /* markdown */, challenges: [Challenge] }
// Reto
{
  id: 'm00-l1-c1', title, instructions /* markdown */,
  files: { '/src/main.jsx': '...', '/src/App.jsx': '...' },  // visibles y editables
  activeFile: '/src/App.jsx',
  hints: ['...'], solution: { '/src/App.jsx': '...' },        // solution = archivos que cambian
  checks: [Check], xp: 10,                                     // xp opcional, por defecto 10
  startFrom: 'previous',        // opcional: arranca con el código guardado del reto anterior (proyecto final)
  dependencies: { 'react-router-dom': '^7.0.0' },              // opcional
}
```

Tipos de `Check` (`label` siempre obligatorio, en español, lo que ve el alumno):

| type | campos | dónde corre |
|------|--------|-------------|
| `text` | `match` | iframe |
| `role` | `role` (`button`,`heading`,`textbox`,`list`,`listitem`,`link`,`img`,`form`,`checkbox`), `name?`, `min?` (=1) | iframe |
| `count` | `selector`, `min?`, `max?` | iframe |
| `class` | `selector`, `pattern` (regex string) — algún elemento que cumpla `selector` tiene una clase que cumple `pattern` | iframe |
| `interaction` | `steps: [{action:'click', role, name?} \| {action:'type', role, name?, value}]`, `expect: Check(text\|role\|count\|class)` | iframe |
| `file-exists` | `pattern` (regex sobre la ruta) | página |
| `file-includes` | `path?` (si falta: cualquier archivo), `pattern` | página |
| `file-count` | `min` (cuenta archivos `.jsx`/`.js` visibles) | página |
| `lint-clean` | — (sin errores de severidad 2 en ningún archivo) | página |
| `manual` | — (casilla que marca el alumno) | página |

`CheckResult`: `{ index: number, label: string, status: 'pass'|'fail'|'error'|'manual-pending'|'manual-done', message?: string }`.

Protocolo `postMessage` (siempre con `source: 'curso-react'`):
- iframe → página: `{ source, type: 'harness-ready' }` al cargar.
- página → iframe: `{ source, type: 'run-checks', runId, checks }` (solo checks de iframe).
- iframe → página: `{ source, type: 'check-results', runId, results }`.

---

### Task 1: Esqueleto del proyecto y herramientas de calidad

**Agente:** react-specialist

**Files:**
- Create: `package.json`, `vite.config.js`, `eslint.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`, `tests/setup.js`, `.gitignore`
- Test: `tests/App.test.jsx`

**Interfaces:**
- Produces: scripts `npm run dev`, `npm test` (vitest run), `npm run lint` (eslint .), `npm run e2e` (playwright test, se configura en Tarea 10). `App` exporta default y envuelve las rutas (por ahora solo `/` con título).

- [ ] **Step 1:** Crear proyecto con `npm create vite@latest . -- --template react`, instalar `tailwindcss @tailwindcss/vite`, `vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`, `react-router`. Configurar Vitest (`environment: 'jsdom'`, `setupFiles: 'tests/setup.js'`, `include: ['tests/**/*.test.{js,jsx}']`) dentro de `vite.config.js`. `src/index.css` = `@import "tailwindcss";`. `eslint.config.js` debe ignorar `dist`, `playwright-report`, `test-results`.
- [ ] **Step 2: Test que falla** — `tests/App.test.jsx`:
```jsx
test('muestra el título del curso', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Curso de React')
})
```
- [ ] **Step 3:** `npm test` → FAIL (el template no tiene ese título).
- [ ] **Step 4:** `App.jsx` con `BrowserRouter` y ruta `/` que muestra `<h1>Curso de React</h1>` (fondo oscuro, Tailwind).
- [ ] **Step 5:** `npm test` → PASS; `npm run lint` → 0 problemas.
- [ ] **Step 6:** Commit `chore: esqueleto Vite + React + Tailwind + Vitest + ESLint`.

---

### Task 2: Formato del curso, validación y Módulo 0

**Agentes:** react-specialist (esquema) + content-writer (textos del Módulo 0, en la misma rama, secuencial)

**Files:**
- Create: `src/content/schema.js`, `src/content/course.js`, `src/content/modules/m00-bienvenida.js`
- Test: `tests/content/schema.test.js`, `tests/content/course.test.js`

**Interfaces:**
- Produces: `validateCourse(modules: Module[]) => string[]` (lista de errores en español; vacía = válido). `course: Module[]` (default export de `course.js`). `flattenChallenges(modules) => Array<{ challenge, lesson, module, index }>` en orden. `findChallenge(modules, id) => { challenge, lesson, module, index } | null`. `CHECK_TYPES` (los 10 tipos de la tabla) e `IFRAME_CHECK_TYPES = ['text','role','count','class','interaction']`.

- [ ] **Step 1: Tests que fallan** — `schema.test.js`: `validateCourse` devuelve error si: ids repetidos (en cualquier nivel); un reto no tiene checks; un reto no tiene `/src/main.jsx` en `files` y no usa `startFrom: 'previous'`; `activeFile` no está en `files`; un check tiene `type` desconocido o no tiene `label`; `startFrom: 'previous'` en el primer reto del curso. Devuelve `[]` para un curso mínimo válido. `course.test.js`: `expect(validateCourse(course)).toEqual([])`; `flattenChallenges(course)[0].challenge.id === 'm00-l1-c1'`; `findChallenge(course, 'nope') === null`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar `schema.js` y `course.js`.
- [ ] **Step 4: Módulo 0** (`m00-bienvenida.js`), tono cotidiano, explicaciones cortas (máx. ~8 líneas por lección):
  - **L1 "Las partes de un proyecto"** (`index.html`, `main.jsx`, `App.jsx`, qué hace cada uno con una analogía). Reto `m00-l1-c1`: cambiar el texto de `App.jsx` para que diga "¡Hola, React!". Checks: `text` match `¡Hola, React!`.
  - **L2 "Un archivo para cada pieza"**. Reto `m00-l2-c1`: crear `/src/Saludo.jsx` que exporte un componente con un título "Bienvenido al curso" y usarlo en `App.jsx`. Checks: `file-exists` `^/src/Saludo\.jsx$`; `file-includes` path `/src/App.jsx` pattern `import\s+\w+\s+from\s+['"]\./Saludo(\.jsx)?['"]`; `role` heading name `Bienvenido al curso`.
  - **L3 "ESLint, tu corrector"** (qué es, cómo leer los subrayados). Reto `m00-l3-c1`: archivo inicial con una variable sin usar y una variable sin definir; dejar el código sin errores y mostrando "Código limpio". Checks: `lint-clean`; `text` match `Código limpio`.
  - Cada reto: 2–3 pistas, `solution` completa.
- [ ] **Step 5:** `npm test` → PASS; `npm run lint` → 0.
- [ ] **Step 6:** Commit `feat: formato del curso, validación y módulo 0`.

---

### Task 3: Progreso, desbloqueo y logros

**Agente:** react-specialist

**Files:**
- Create: `src/progress/storage.js`, `src/progress/progress.js`
- Test: `tests/progress/storage.test.js`, `tests/progress/progress.test.js`

**Interfaces:**
- Consumes: `flattenChallenges` (Tarea 2).
- Produces:
  - `safeRead(key, fallback)`, `safeWrite(key, value) => boolean` (JSON, try/catch).
  - `PROGRESS_KEY = 'curso-react:progress:v1'`.
  - `emptyProgress() => { completed: {}, xp: 0, solutionViewed: {}, hintsUsed: {} }` donde `completed[id] = { xp, at }`.
  - `loadProgress() => Progress`, `saveProgress(p)`.
  - `completeChallenge(p, challenge) => Progress` (puro; si ya estaba completado, devuelve `p` igual; xp = `challenge.xp ?? 10`, la mitad redondeada hacia abajo si `solutionViewed[id]`).
  - `markSolutionViewed(p, id)`, `markHintUsed(p, id)` (puros).
  - `isChallengeUnlocked(p, modules, id) => boolean`: true si está completado, o es el primero, o el anterior en `flattenChallenges` está completado.
  - `moduleStats(p, module) => { done, total, unlocked }`.
  - `achievements(p, modules) => Array<{ id, title }>` con: `primer-reto` ("¡Primer reto!"), `modulo:<id>` ("Módulo completo: <title>"), `sin-ayuda:<moduleId>` (módulo completo sin pistas ni soluciones).

- [ ] **Step 1: Tests que fallan:** `safeRead` devuelve fallback si el valor es `"{no json"`, si `localStorage.getItem` lanza (espiar con `vi.spyOn(Storage.prototype,'getItem').mockImplementation(() => { throw new Error() })`), o si falta la clave. `loadProgress` con objeto sin `completed` → `emptyProgress()`. `completeChallenge` suma 10; con solución vista suma 5; dos veces no duplica XP. Desbloqueo: primer reto true, segundo false hasta completar el primero; un id completado que no existe en el curso no rompe `moduleStats` ni `achievements`; si se inserta un reto nuevo antes de uno ya completado, el completado sigue desbloqueado. Logros según la definición de arriba.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test` → PASS; `npm run lint` → 0.
- [ ] **Step 5:** Commit `feat: progreso, desbloqueo y logros`.

---

### Task 4: Guardado de código y archivos iniciales

**Agente:** react-specialist

**Files:**
- Create: `src/progress/code.js`
- Test: `tests/progress/code.test.js`

**Interfaces:**
- Consumes: `safeRead/safeWrite` (Tarea 3), `flattenChallenges` (Tarea 2).
- Produces:
  - `codeKey(id) => 'curso-react:code:v1:' + id`.
  - `saveCode(id, files)`, `loadCode(id) => files | null`, `clearCode(id)`.
  - `initialFiles(modules, id) => files`: código guardado si existe; si no, y el reto tiene `startFrom: 'previous'`, el código guardado del reto anterior (o, si no hay, `files` del anterior mezclado con su `solution`); si no, `challenge.files`.
  - `cleanStartFiles(modules, id) => files`: para `startFrom: 'previous'`, `{...prev.files, ...prev.solution}` del reto anterior (la "versión limpia"); si no, `challenge.files`.
  - `solutionFiles(challenge, currentFiles) => files` = `{ ...currentFiles, ...challenge.solution }`.

- [ ] **Step 1: Tests que fallan:** cubrir cada rama de `initialFiles` y `cleanStartFiles`; `loadCode` con JSON corrupto → `null`; `clearCode` y luego `initialFiles` devuelve los iniciales.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test` → PASS; lint 0.
- [ ] **Step 5:** Commit `feat: guardado de código por reto`.

---

### Task 5: Motor de comprobaciones

**Agente:** react-specialist

**Files:**
- Create: `src/checks/normalize.js`, `src/checks/domRunner.js`, `src/checks/fileChecks.js`, `src/checks/summarize.js`
- Test: `tests/checks/domRunner.test.js`, `tests/checks/fileChecks.test.js`, `tests/checks/summarize.test.js`

**Interfaces:**
- Consumes: `IFRAME_CHECK_TYPES` (Tarea 2); `lintSource` (Tarea 7) para `lint-clean` → **para no depender del orden**, `runFileChecks` recibe el linter inyectado.
- Produces:
  - `normalizeText(s) => string`: minúsculas, sin diacríticos (NFD + quitar `\p{M}`), espacios colapsados, recortado.
  - `runDomChecks(checks, root = document.body) => Promise<CheckResult[]>`. **`domRunner.js` no puede tener imports** (se inyecta como texto en el iframe): incluye su propia copia de `normalizeText` y solo exporta `runDomChecks`.
  - `runFileChecks(checks, files, { lint }) => CheckResult[]` para `file-*`, `lint-clean`; `manual` → `manual-pending` (o `manual-done` si `manualDone[index]`, pasado como 4.º arg `{ manualDone }`). `index` = posición en la lista original de checks del reto.
  - `summarizeResults(results) => { passed: boolean, failed: number, total: number }` — `passed` solo si todo es `pass` o `manual-done`.

- [ ] **Step 1: Tests que fallan (domRunner, jsdom):** `text` pasa con `<p>¡hola,   REACT!</p>` y `match: '¡Hola, React!'`; falla con mensaje en español si no está. `role` button por `<button>` y por `[role=button]`, `name` contra textContent/`aria-label`/`value` normalizados; `min: 2`. `heading` = h1–h6; `textbox` = input text/email/number/sin type y textarea. `count` con `min`/`max`. `class` con `pattern: 'bg-blue-\\d+'`. `interaction`: un contador React real montado en `root` (usar `react-dom/client` en el test) — click en "Sumar" y `expect` text "1"; `type` en un input controlado de React (asignar valor con el setter nativo de `HTMLInputElement.prototype` y despachar `input` con `bubbles: true`) actualiza el texto mostrado. Esperar el re-render (~50 ms o `requestAnimationFrame` + microtask) antes de evaluar `expect`. Un check que lanza excepción → `status: 'error'` sin cortar los demás.
- [ ] **Step 2 (fileChecks/summarize):** `file-exists` por regex de ruta; `file-includes` con y sin `path`; `file-count` solo `.js/.jsx`; `lint-clean` usa el `lint` inyectado (`(code) => [{ severity: 2 }]` → fail); manual pendiente/hecho; `summarizeResults` según definición.
- [ ] **Step 3:** `npm test` → FAIL.
- [ ] **Step 4:** Implementar. Mensajes de fallo amables: p. ej. `No encontré el texto "¡Hola, React!" en tu página.`, `No encontré un botón que diga "Sumar".`
- [ ] **Step 5:** `npm test` → PASS; lint 0.
- [ ] **Step 6:** Commit `feat: motor de comprobaciones`.

---

### Task 6: Armado del sandbox (archivos ocultos y arnés)

**Agente:** react-specialist

**Files:**
- Create: `src/sandbox/buildSandbox.js`, `src/sandbox/harness.js`
- Test: `tests/sandbox/buildSandbox.test.js`, `tests/sandbox/harness.test.js`

**Interfaces:**
- Consumes: `domRunner.js` como texto (`import runnerSource from '../checks/domRunner.js?raw'`).
- Produces:
  - `HIDDEN_PATHS = ['/src/__entry__.js', '/src/__harness__.js', '/src/__runner__.js', '/public/index.html']`.
  - `buildSandboxSetup(files, dependencies = {}) => { files, customSetup }` donde `files` = archivos del alumno + ocultos (`{ code, hidden: true }`), y `customSetup = { entry: '/src/__entry__.js', dependencies: { react: '^19', 'react-dom': '^19', ...dependencies } }`.
  - `/src/__entry__.js` = `import './main.jsx'; import './__harness__.js';`
  - `/public/index.html` con `<div id="root"></div>` y `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>`.
  - `HARNESS_SOURCE` (string, en `harness.js`): importa `runDomChecks` de `./__runner__.js`; al cargar envía `harness-ready` a `window.parent`; escucha `run-checks` (solo si `data.source === 'curso-react'`), espera ~300 ms a que React pinte y responde `check-results` con el mismo `runId`.
  - `studentFiles(files) => files` sin `HIDDEN_PATHS` (para guardar y para comprobaciones de archivos).

- [ ] **Step 1: Tests que fallan:** `buildSandboxSetup` añade los 4 ocultos con `hidden: true`, no pisa archivos del alumno, mezcla `dependencies`; `/src/__runner__.js` contiene `runDomChecks` y no contiene `import `; `studentFiles` quita los ocultos. `harness.test.js`: evaluar `HARNESS_SOURCE` en jsdom (reemplazando el import por la función real, p. ej. con `new Function`) y comprobar que envía `harness-ready` y que responde `run-checks` con `runId` correcto e ignora mensajes sin `source: 'curso-react'`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test` → PASS; lint 0.
- [ ] **Step 5: Spike de verificación manual** (requiere internet): página temporal con `SandpackProvider template="react"` + `buildSandboxSetup` del reto `m00-l1-c1` y la `solution` aplicada; confirmar en navegador que se ve el texto con estilos Tailwind y que en consola de la página llegan `harness-ready` y `check-results` (pass). Si `template="react"` no respeta `customSetup.entry` o la ruta `/public/index.html`, ajustar aquí y documentar en un comentario. Borrar la página temporal.
- [ ] **Step 6:** Commit `feat: armado del sandbox con arnés de comprobación`.

---

### Task 7: ESLint en el navegador

**Agente:** react-specialist

**Files:**
- Create: `src/lint/lintSource.js`, `src/lint/lintExtension.js`
- Test: `tests/lint/lintSource.test.js`

**Interfaces:**
- Produces:
  - `lintSource(code: string) => Array<{ line, column, endLine, endColumn, severity: 1|2, ruleId, message }>` con `Linter` de `eslint-linter-browserify`, config: ESM, JSX, globals de navegador, reglas `no-undef: 2`, `no-unused-vars: 1` (con `varsIgnorePattern: '^[A-Z]'` para no marcar componentes importados usados en JSX… si genera falsos positivos, usar `eslint-plugin-react`'s `jsx-uses-vars` o la regla equivalente), `no-dupe-keys: 2`, `no-unreachable: 1`; `message` traducido al español para esas reglas (p. ej. `'x' no está definida. ¿La escribiste bien o falta importarla?`); otras reglas, mensaje original.
  - `createLintExtension() => Extension[]` (`linter` + `lintGutter` de `@codemirror/lint`) para `SandpackCodeEditor extensions`. Usar la misma versión de `@codemirror/*` que trae Sandpack (revisar `npm ls @codemirror/state`; deduplicar si hay dos).

- [ ] **Step 1: Tests que fallan:** variable sin definir → severidad 2 y mensaje en español con el nombre; variable sin usar → severidad 1; componente importado y usado solo en JSX → sin avisos; error de sintaxis → un resultado severidad 2 con mensaje "Hay un error de escritura en el código" + línea.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test` → PASS; lint 0.
- [ ] **Step 5:** Commit `feat: ESLint en el navegador con mensajes en español`.

---

### Task 8: Página del reto (instrucciones | editor | vista previa)

**Agente:** react-specialist

**Files:**
- Create: `src/sandbox/useCheckRunner.js`, `src/progress/ProgressContext.jsx`, `src/pages/ChallengePage.jsx`, `src/components/{Instructions,Workspace,FileTabsBar,CheckPanel,HintBox}.jsx`
- Modify: `src/App.jsx` (ruta `/reto/:challengeId`, `ProgressProvider`)
- Test: `tests/sandbox/useCheckRunner.test.js`, `tests/pages/ChallengePage.test.jsx`

**Interfaces:**
- Consumes: Tareas 2–7.
- Produces:
  - `useProgress() => { progress, complete(challenge), viewSolution(id), recordHint(id) }` (guarda en cada cambio).
  - `useCheckRunner(getIframe: () => HTMLIFrameElement | null, { timeoutMs = 5000 }) => { run(checks) => Promise<CheckResult[]> }`: espera `harness-ready` (si no llegó ya), envía `run-checks`, acepta solo mensajes cuyo `event.source === iframe.contentWindow` y `runId` coincida; al vencer el tiempo devuelve cada check `error` con "La vista previa no respondió. Revisa si hay errores en tu código.".
- UI: tres paneles (en pantallas estrechas, apilados). Editor = `SandpackCodeEditor` con `extensions={createLintExtension()}`, pestañas de archivos con botón "Nuevo archivo" (pide ruta, la normaliza a `/src/...`, rechaza nombres vacíos, repetidos o fuera de `.js/.jsx/.css`) y "Borrar" (no disponible para `/src/main.jsx`). Botones: "Comprobar", "Pista" (revela de una en una), "Ver solución" (confirmación en pantalla, sin `window.confirm`; aplica `solutionFiles`, marca vista), "Reiniciar reto", y "Empezar desde versión limpia" solo si `startFrom: 'previous'`. Código del alumno guardado (`saveCode(id, studentFiles(files))`) con espera de ~500 ms tras dejar de escribir. Al pasar: `complete`, `Celebration` y botón "Siguiente reto". Reto bloqueado → mensaje y enlace al mapa. Aviso si la vista previa no carga en ~15 s ("Necesitas internet para ver el resultado").

- [ ] **Step 1: Tests que fallan (`useCheckRunner`, con iframe falso y `window.postMessage` simulado):** resuelve con resultados del `runId` correcto; ignora otros `runId` y otras fuentes; espera `harness-ready` antes de enviar; con temporizadores falsos, a los 5000 ms devuelve todo `error` con el mensaje exacto.
- [ ] **Step 2: Tests que fallan (`ChallengePage`, Sandpack mockeado con `vi.mock('@codesandbox/sandpack-react')` y `useCheckRunner` mockeado):** muestra título e instrucciones de `m00-l1-c1`; "Pista" revela solo la primera; "Comprobar" con resultados `pass` → aparece "¡Reto superado!" y XP 10 en el progreso guardado; con un `fail` → muestra el mensaje del check y no suma XP; reto bloqueado (`m00-l2-c1` sin progreso) → mensaje de bloqueado; `/src/main.jsx` no tiene botón borrar.
- [ ] **Step 3:** `npm test` → FAIL.
- [ ] **Step 4:** Implementar.
- [ ] **Step 5:** `npm test` → PASS; lint 0. Prueba manual en `npm run dev` resolviendo `m00-l1-c1` a mano.
- [ ] **Step 6:** Commit `feat: página del reto con editor multi-archivo y comprobación`.

---

### Task 9: Mapa del curso, XP y logros visibles

**Agente:** ui-polisher (con react-specialist si hace falta lógica)

**Files:**
- Create: `src/pages/CourseMap.jsx`, `src/pages/ModulePage.jsx`, `src/components/XpBar.jsx`, `src/components/Celebration.jsx`
- Modify: `src/App.jsx` (rutas `/`, `/modulo/:moduleId`; cabecera con `XpBar`)
- Test: `tests/pages/CourseMap.test.jsx`, `tests/pages/ModulePage.test.jsx`

**Interfaces:**
- Consumes: `useProgress`, `moduleStats`, `achievements`, `isChallengeUnlocked`.
- UI: mapa tipo videojuego (tema oscuro), una tarjeta por módulo con barra `done/total`, candado si bloqueado; página de módulo con lecciones y retos (✅ hecho, ▶ disponible, 🔒 bloqueado); `XpBar` con XP total y nivel (`nivel = 1 + floor(xp / 100)`); sección de logros; botón "Reiniciar todo mi progreso" con confirmación en pantalla. `Celebration` respeta `prefers-reduced-motion`.

- [ ] **Step 1: Tests que fallan:** sin progreso, el Módulo 0 aparece disponible y su primer reto con enlace a `/reto/m00-l1-c1`, los demás retos bloqueados sin enlace; con `m00-l1-c1` completado la cabecera muestra "10 XP" y "Nivel 1" y el logro "¡Primer reto!"; reiniciar (tras confirmar) vuelve a 0 XP.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** `npm test` → PASS; lint 0.
- [ ] **Step 5:** Commit `feat: mapa del curso, XP y logros`.

---

### Task 10: Recorrido de punta a punta

**Agente:** playwright-expert

**Files:**
- Create: `playwright.config.js` (`webServer: npm run dev`, Chromium, timeout de test 60 s por Sandpack), `e2e/curso.spec.js`
- Modify: `package.json` (script `e2e`), `.gitignore`

- [ ] **Step 1: Test** `e2e/curso.spec.js` (requiere internet): abrir `/`, entrar al Módulo 0, abrir `m00-l1-c1`, "Ver solución" → confirmar, "Comprobar" → ver "¡Reto superado!"; volver al mapa y ver "10 XP"; recargar y seguir viendo "10 XP"; `m00-l2-c1` ahora disponible. Segundo test: en `m00-l1-c1` escribir en el editor y recargar → el texto escrito sigue ahí.
- [ ] **Step 2:** `npm run e2e` → PASS (si falla, depurar con superpowers:systematic-debugging antes de tocar código).
- [ ] **Step 3:** `npm test && npm run lint && npm run e2e` todo en verde.
- [ ] **Step 4:** Commit `test: recorrido e2e del módulo 0`.

---

## Orden y ramas

- Tarea 1 → Tarea 2 (secuenciales, base de todo).
- Luego en paralelo, cada una en su worktree/rama: **3+4** (`feat/progreso`), **5** (`feat/comprobaciones`), **7** (`feat/lint`). Ninguna toca archivos de otra.
- Tarea 6 tras 5. Tarea 8 tras 3,4,6,7. Tarea 9 tras 8. Tarea 10 al final.
- Cada rama: pruebas y lint verificados por el orquestador con salida real + revisión de `code-reviewer`; unir a `main` solo con OK del usuario.
