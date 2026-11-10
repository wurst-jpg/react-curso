# Curso interactivo de React + Tailwind — Diseño

Fecha: 2026-11-10

## Intención y por qué

El usuario pagó un curso en gamecode.me y le gusta que se aprenda **practicando, como jugando**: retos cortos, código en vivo, avance por niveles. El problema: allá todo se trabaja en **un solo archivo**, y así no se trabaja en un proyecto React real. Quiere su propia página, con la misma sensación de juego, pero donde desde la primera lección se trabaje con **varios archivos** (componentes separados, imports/exports, carpetas) como en un proyecto profesional.

Es una herramienta **personal**: solo la usa el propio usuario, corriendo en local (`npm run dev`) en su computadora. No se vende ni se publica.

## Alumno

El propio usuario. Sabe programación básica (variables, condicionales, funciones) y quiere aprender React como framework y Tailwind CSS para estilos. No es técnico avanzado: todo el texto de las lecciones va en español sencillo, con ejemplos cotidianos.

## Meta de éxito

Al terminar el último módulo, el alumno construyó por su cuenta una **aplicación completa**: una app de **gastos personales** (registrar gastos, verlos por categoría, filtrar, varias páginas).

## Objetivos

- Lecciones prácticas: cada lección = explicación breve + 1 a 3 retos.
- Editor multi-archivo con pestañas (ej. `App.jsx`, `Boton.jsx`, `Tarjeta.jsx`), posibilidad de crear archivos en retos que lo pidan.
- Vista previa en vivo del resultado.
- Verificación automática de cada reto (pasa / no pasa, con mensaje claro de qué falta).
- Pistas por reto (reveladas de a una) y solución visible tras varios intentos o a petición.
- Gamificación: XP por reto, barra de progreso por módulo y global, módulos que se desbloquean en orden, logros simples.
- Progreso guardado en el navegador (localStorage), con opción de reiniciar.
- Tailwind disponible dentro de la vista previa de los retos.

## No-objetivos

- Cuentas de usuario, login, pagos, backend, base de datos.
- Publicarla en internet / despliegue.
- Multi-idioma (solo español).
- Funcionar sin internet (ver decisión del editor).

## Anti-objetivos (sería un fracaso aunque "funcione")

- Que las lecciones sean muros de teoría en vez de práctica.
- Que los retos se hagan en un solo archivo (justo lo que se quiere evitar), salvo el primer contacto si es estrictamente necesario.
- Verificaciones frágiles que rechacen soluciones correctas escritas de otra forma, o mensajes de error crípticos.
- Jerga técnica sin explicar.

## Decisiones tomadas por el usuario

- **Editor/ejecución: Sandpack** (`@codesandbox/sandpack-react`), opción A. Acepta que necesita internet para el empaquetado del código del alumno.
- **Proyecto final:** app de gastos personales.
- **Construcción:** con el equipo de agentes (una rama por fase, TDD, revisión de código antes de unir, el usuario confirma antes de unir a `main`).

## Estructura de módulos

| # | Módulo | Contenido |
|---|--------|-----------|
| 0 | Bienvenida | Anatomía de un proyecto React: carpetas, archivos, `main.jsx`, `App.jsx`, cómo usar el editor |
| 1 | Componentes | JSX, crear componentes, separarlos en archivos, import/export |
| 2 | Props | Pasar datos, children, props por defecto |
| 3 | Estado y eventos | `useState`, onClick/onChange, actualizar estado |
| 4 | Listas y condiciones | `map`, `key`, renderizado condicional |
| 5 | Tailwind básico | Colores, espaciado, tipografía, bordes, hover |
| 6 | Tailwind avanzado | Flex, grid, responsive, dark mode |
| 7 | Formularios | Inputs controlados, submit, validación |
| 8 | Datos externos | `useEffect`, fetch, cargando/error |
| 9 | Organización pro | Hooks propios, Context, estructura de carpetas |
| 10 | Navegación | React Router, varias páginas, parámetros |
| 11 | Proyecto final | App de gastos por etapas, cada etapa un reto grande |

Cada módulo: ~3 a 6 lecciones. Las lecciones se definen como **datos** (no código de la plataforma), para poder añadir contenido sin tocar el motor.

## Decisiones técnicas (llamadas mías, el usuario no las discutió)

- Plataforma: Vite + React + Tailwind CSS (la propia página también usa Tailwind), JavaScript (no TypeScript) para mantenerlo accesible al usuario si quiere leer el código.
- Pruebas: Vitest + Testing Library para unidades/componentes; Playwright para un recorrido de punta a punta.
- Tailwind en la vista previa: vía el script CDN de Tailwind inyectado en el HTML del sandbox.
- Verificación de retos: cada reto declara comprobaciones (p. ej. sobre el DOM renderizado en la vista previa y/o sobre los archivos: "existe `Boton.jsx`", "`App.jsx` importa `Boton`", "hay un botón con texto X", "al hacer clic el contador sube"). El mecanismo concreto queda al constructor (ver abajo), pero debe preferir comprobar **comportamiento/resultado** sobre texto exacto del código.
- Ubicación: `~/proyectos/curso-react`.

## Lo que queda a criterio del constructor

- Mecanismo exacto de verificación (tests de Sandpack, mensajes desde el iframe, análisis del código, o combinación).
- Diseño visual concreto (tema oscuro tipo videojuego sugerido), animaciones, logros específicos, cantidad de XP.
- Formato del archivo de datos de lecciones.
- Contenido exacto de cada lección y reto, respetando la tabla de módulos y el tono sencillo.

## Fases de construcción sugeridas

1. Motor: layout de lección (instrucciones | editor con pestañas | vista previa), carga de lecciones desde datos, verificación de retos.
2. Gamificación y progreso: XP, desbloqueo, guardado, mapa de módulos.
3. Contenido: módulos 0–11 (pueden repartirse en varias ramas, una por grupo de módulos).
4. E2E y revisión final.
