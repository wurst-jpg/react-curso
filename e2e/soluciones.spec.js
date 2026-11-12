import { test, expect } from '@playwright/test'
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

// Verifica que la SOLUCIÓN de cada reto pasa SUS PROPIOS checks en la app real.
//   MODULOS=m01,m02 npx playwright test e2e/soluciones.spec.js   (sin MODULOS: todos)
//
// course.js usa import.meta.glob, que el cargador de Node de Playwright no entiende; por eso aquí
// se cargan los archivos de src/content/modules/*.js directamente con import().
// RESTRICCIÓN: esos archivos solo pueden tener `export default` y NINGÚN import
// (lo vigila tests/content/course.test.js).
const DIR = resolve('src/content/modules')
const archivos = readdirSync(DIR).filter((f) => f.endsWith('.js')).sort()
const modulos = []
for (const f of archivos) modulos.push((await import(pathToFileURL(resolve(DIR, f)).href)).default)

const filtro = (process.env.MODULOS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
const desconocidos = filtro.filter((id) => !modulos.some((m) => m.id === id))
if (desconocidos.length) throw new Error(`MODULOS desconocidos: ${desconocidos.join(', ')}`)

const todos = modulos.flatMap((m) => m.lessons.flatMap((l) => l.challenges.map((c) => ({ c, m }))))

todos.forEach(({ c, m }, i) => {
  if (filtro.length && !filtro.includes(m.id)) return
  test(c.id, async ({ page }) => {
    test.setTimeout(90_000)
    const anteriores = todos.slice(0, i).map((e) => e.c)
    const progreso = {
      completed: Object.fromEntries(anteriores.map((a) => [a.id, {}])),
      xp: anteriores.reduce((n, a) => n + (a.xp ?? 10), 0),
      solutionViewed: {},
      hintsUsed: {},
    }
    await page.goto('/')
    await page.evaluate((p) => {
      localStorage.clear()
      localStorage.setItem('curso-react:progress:v1', JSON.stringify(p))
    }, progreso)

    await page.goto(`/reto/${c.id}`)
    await page.getByRole('button', { name: 'Ver solución' }).click()
    await page.getByRole('button', { name: 'Sí, ver la solución' }).click()

    // La vista previa nueva (con la solución) debe haber cargado: sin el aviso de la plataforma
    // y con contenido dentro del iframe.
    const aviso = page.getByText('Preparando la vista previa')
    await expect(aviso).toHaveCount(0, { timeout: 60_000 })
    await expect
      .poll(() => page.frameLocator('iframe').first().locator('body').innerHTML().catch(() => ''), { timeout: 60_000 })
      .not.toBe('')
    await expect
      .poll(() => page.frameLocator('iframe').first().locator('#root').innerHTML().catch(() => ''), { timeout: 60_000 })
      .not.toBe('')

    const panel = page.getByRole('region', { name: 'Comprobaciones' })
    for (const caja of await panel.getByRole('checkbox').all()) await caja.check()

    await page.getByRole('button', { name: 'Comprobar' }).click()
    const exito = page.getByText('¡Reto superado!')
    try {
      await expect(exito).toBeVisible({ timeout: 20_000 })
    } catch (e) {
      const fallos = await panel.locator('[data-results] li').evaluateAll((lis) =>
        lis.map((li) => li.innerText.replace(/\s+/g, ' ').trim()).filter((t) => !/Bien|Hecho/.test(t)),
      )
      const alerta = await page.getByRole('alert').allInnerTexts()
      throw new Error(
        `La solución de ${c.id} NO pasa sus propios checks.\n  Fallos:\n  - ${fallos.join('\n  - ') || '(ninguno visible)'}\n  Avisos: ${alerta.join(' | ') || '(ninguno)'}`,
        { cause: e },
      )
    }
  })
})
