# Guía para escribir módulos del curso

## Archivos y ids

- Un módulo = un archivo `src/content/modules/mNN-slug.js` (por ejemplo `m03-estado.js`). Se descubre solo: no hay que registrarlo en ningún sitio.
- El orden del curso es el orden alfabético del nombre de archivo (`m00-…`, `m01-…`, … `m11-…`).
- Ids: módulo `mNN`, lección `mNN-lK`, reto `mNN-lK-cJ` (ej. `m03`, `m03-l2`, `m03-l2-c1`). El id del módulo DEBE coincidir con el prefijo del archivo (un test lo comprueba).
- Formato: copia la estructura de `src/content/modules/m00-bienvenida.js`.
- **Sin `import` dentro de los archivos de módulo.** Solo `export default`. Las cadenas compartidas (como `MAIN`, el `main.jsx` de arranque) se definen dentro del propio archivo. Motivo: `e2e/soluciones.spec.js` los carga con `import()` desde Node. Un test falla si encuentra un `import`.
  (Los `import` que van dentro de las cadenas de código de los retos están bien: son texto.)

## Estructura

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

## Tipos de `Check`

`label` siempre es obligatorio, en español: es lo que ve el alumno.

| type | campos | dónde corre |
|------|--------|-------------|
| `text` | `match` | iframe |
| `role` | `role` (`button`,`heading`,`textbox`,`list`,`listitem`,`link`,`img`,`form`,`checkbox`), `name?`, `min?` (=1) | iframe |
| `count` | `selector`, `min?`, `max?` | iframe |
| `class` | `selector`, `pattern` (regex string): algún elemento que cumpla `selector` tiene una clase que cumple `pattern` | iframe |
| `interaction` | `steps: [{action:'click', role, name?} \| {action:'type', role, name?, value}]`, `expect: Check(text\|role\|count\|class)` | iframe |
| `file-exists` | `pattern` (regex sobre la ruta) | página |
| `file-includes` | `path?` (si falta: cualquier archivo), `pattern` | página |
| `file-count` | `min` (cuenta archivos `.jsx`/`.js` visibles) | página |
| `lint-clean` | sin campos (sin errores de severidad 2 en ningún archivo) | página |
| `manual` | sin campos (casilla que marca el alumno) | página |

## Cómo probar tu módulo

1. Pruebas unitarias (validan esquema, ids, que la solución cumpla los checks de archivos y lint):
   `npm test`
2. Comprobar que la solución de CADA reto pasa sus propios checks en la app real (necesita internet; ~25-45 s por reto). Usa un puerto propio, distinto de 5173 y del de los demás autores:

   ```bash
   MODULOS=mNN E2E_PORT=<puerto> npx playwright test e2e/soluciones.spec.js
   ```

   `MODULOS` admite varios ids separados por comas (`MODULOS=m01,m02`); sin él se prueban todos. Si un reto falla, el mensaje lista los checks que no pasaron.
   Cada reto se prueba con todos los anteriores del curso marcados como completados.
3. `npm run lint`.
