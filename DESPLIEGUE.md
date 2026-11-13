# Cómo publicar el curso en internet

La página es "estática": no tiene servidor ni base de datos. Tu progreso se guarda en tu propio navegador.

## Antes de publicar (en esta carpeta)

```bash
npm install
npm test        # todo en verde
npm run build   # crea la carpeta dist/ con la página lista
npm run preview # opcional: ver la versión final en http://localhost:4173
```

## Opción A — Netlify (la más fácil, sin consola)
1. Entra a https://app.netlify.com/drop
2. Arrastra la carpeta `dist/` a la página.
3. Te da un enlace público. El archivo `public/_redirects` ya hace que las direcciones como `/reto/m01-l1-c1` funcionen al recargar.

## Opción B — Vercel (se actualiza solo con cada cambio)
1. Sube este proyecto a un repositorio de GitHub.
2. En https://vercel.com → "Add New Project" → elige el repositorio.
3. Vercel detecta Vite solo (comando `npm run build`, carpeta `dist`). `vercel.json` ya está listo.

## Ojo
- **El progreso no viaja:** se guarda en el navegador de cada dirección. Lo que hiciste en `localhost` no aparece en la versión publicada.
- **Necesita internet** para la vista previa de los retos (Sandpack), igual que en local.
- No hay contraseñas ni claves en el proyecto: no hace falta configurar variables de entorno.
