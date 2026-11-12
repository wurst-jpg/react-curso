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

test('autocompletar: sugiere useState y clases de Tailwind, Tab elige y el interruptor no recarga nada', async ({ page }) => {
  await page.goto('/reto/m00-l1-c1')
  const editor = page.locator('.cm-content').first()
  await expect(editor).toBeVisible()
  const lista = page.locator('.cm-tooltip-autocomplete')

  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('useS')
  await expect(lista).toContainText('useState')
  await page.waitForTimeout(300) // CodeMirror ignora Enter/Tab justo al abrirse la lista
  await page.keyboard.press('Tab')
  await expect(editor).toContainText('useState')
  await expect(lista).toHaveCount(0)

  // Plantilla: el nombre del componente se escribe en los dos sitios a la vez.
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('comp')
  await expect(lista).toContainText('Plantilla: un componente nuevo')
  await page.waitForTimeout(300) // CodeMirror ignora Enter/Tab justo al abrirse la lista
  await page.keyboard.press('Enter')
  await page.keyboard.type('Hola')
  await expect(editor).toContainText('function Hola()')
  await expect(editor).toContainText('export default Hola')

  // Solo dentro de className aparecen las clases de Tailwind.
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('const x = <div className="bg-bl')
  await expect(lista).toContainText('bg-blue-500')
  // La lista es oscura (a juego con el editor) y la opción elegida va en azul cielo.
  expect(await lista.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(15, 23, 42)')
  expect(await lista.locator('li[aria-selected]').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(2, 132, 199)')

  // En texto suelto de JSX no se sugiere nada.
  await page.keyboard.press('Escape')
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('<p>Hola useS')
  await page.waitForTimeout(600)
  await expect(lista).toHaveCount(0)
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('const x = <div className="bg-bl')
  await expect(lista).toContainText('bg-blue-500')

  // El interruptor: sin recargar la vista previa ni perder el código.
  await page.keyboard.press('Escape')
  await page.locator('iframe').first().evaluate((el) => el.setAttribute('data-marca', 'igual'))
  const texto = await editor.innerText()
  const boton = page.getByRole('button', { name: /autocompletar/i })
  await boton.click()
  await expect(boton).toHaveAttribute('aria-pressed', 'false')
  await expect(editor).toContainText('bg-bl')
  expect(await editor.innerText()).toBe(texto)
  await expect(page.locator('iframe').first()).toHaveAttribute('data-marca', 'igual')

  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('useS')
  await page.waitForTimeout(600)
  await expect(lista).toHaveCount(0)

  // Se recuerda al recargar.
  await page.reload()
  await expect(page.getByRole('button', { name: /autocompletar/i })).toHaveAttribute('aria-pressed', 'false')
})
