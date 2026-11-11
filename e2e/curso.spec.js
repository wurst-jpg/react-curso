import { test, expect } from '@playwright/test'

// Cada test empieza sin progreso ni código guardado.
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('recorrido del módulo 0: ver solución, comprobar y conservar el XP', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Curso de React' })).toBeVisible()
  await expect(page.getByRole('banner').getByText('0 XP', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: /Bienvenida/ }).click()
  await expect(page).toHaveURL(/\/modulo\/m00$/)
  await expect(page.getByRole('link', { name: /Crea tu primera pieza/ })).toHaveCount(0)

  await page.getByRole('link', { name: /Di hola/ }).click()
  await expect(page).toHaveURL(/\/reto\/m00-l1-c1$/)

  await page.getByRole('button', { name: 'Ver solución' }).click()
  await page.getByRole('button', { name: 'Sí, ver la solución' }).click()
  // Esperar a que la vista previa nueva (con la solución) cargue antes de comprobar.
  await expect(page.frameLocator('iframe').getByRole('heading', { name: '¡Hola, React!' })).toBeVisible({
    timeout: 40_000,
  })
  await page.getByRole('button', { name: 'Comprobar' }).click()
  await expect(page.getByText('¡Reto superado!')).toBeVisible({ timeout: 20_000 })

  // Con la solución vista, el reto da la mitad de XP (10 -> 5).
  await page.getByRole('link', { name: 'Mapa del curso' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Curso de React' })).toBeVisible()
  const barra = page.getByRole('banner')
  await expect(barra.getByText('5 XP', { exact: true })).toBeVisible()
  await expect(barra.getByText('Nivel 1')).toBeVisible()

  await page.reload()
  await expect(page.getByRole('banner').getByText('5 XP', { exact: true })).toBeVisible()

  await page.goto('/modulo/m00')
  await expect(page.getByRole('link', { name: /Crea tu primera pieza/ })).toContainText('Disponible')
})

test('el código escrito en el editor sobrevive a recargar', async ({ page }) => {
  await page.goto('/reto/m00-l1-c1')
  const editor = page.locator('.cm-content').first()
  await expect(editor).toBeVisible()

  const marca = '// mi nota e2e'
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type(marca)
  await expect(editor).toContainText(marca)

  // El código se guarda ~500 ms después de dejar de escribir.
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('curso-react:code:v1:m00-l1-c1') ?? ''), { timeout: 5000 })
    .toContain(marca)
  await page.reload()

  await expect(page.locator('.cm-content').first()).toContainText(marca)
})
