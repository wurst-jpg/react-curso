import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import CourseMap from '../../src/pages/CourseMap.jsx'
import XpBar from '../../src/components/XpBar.jsx'
import { ProgressProvider } from '../../src/progress/ProgressContext.jsx'
import { PROGRESS_KEY } from '../../src/progress/progress.js'
import { codeKey } from '../../src/progress/code.js'

function setup() {
  return render(
    <ProgressProvider>
      <MemoryRouter initialEntries={['/']}>
        <XpBar />
        <Routes>
          <Route path="/" element={<CourseMap />} />
        </Routes>
      </MemoryRouter>
    </ProgressProvider>,
  )
}

const done = { xp: 10, at: 'x' }
const withProgress = (completed, xp) =>
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({ completed, xp, solutionViewed: {}, hintsUsed: {} }),
  )

beforeEach(() => localStorage.clear())

test('sin progreso muestra 0 XP, Nivel 1 y el Módulo 0 disponible', () => {
  setup()
  expect(screen.getByText('0 XP')).toBeInTheDocument()
  expect(screen.getByText('Nivel 1')).toBeInTheDocument()
  const card = screen.getByRole('link', { name: /Bienvenida/ })
  expect(card).toHaveAttribute('href', '/modulo/m00')
  expect(within(card).getByText('0 de 3 retos')).toBeInTheDocument()
})

test('sin progreso todos los módulos están abiertos, sin candado ni aviso de bloqueo', () => {
  setup()
  expect(screen.getAllByRole('link', { name: /Módulo \d+/ }).length).toBeGreaterThan(1)
  expect(screen.queryByText(/Bloqueado/)).not.toBeInTheDocument()
  expect(screen.queryByText('🔒')).not.toBeInTheDocument()
  expect(document.body.textContent).not.toContain('🔒')
  expect(screen.getByText(/dentro de cada módulo los retos se abren en orden/)).toBeInTheDocument()
})

test('con un reto hecho: 10 XP, Nivel 1 y logro "¡Primer reto!"', () => {
  withProgress({ 'm00-l1-c1': done }, 10)
  setup()
  expect(screen.getByText('10 XP')).toBeInTheDocument()
  expect(screen.getByText('Nivel 1')).toBeInTheDocument()
  expect(screen.getByText('¡Primer reto!')).toBeInTheDocument()
})

test('a los 100 XP sube al Nivel 2', () => {
  withProgress({ 'm00-l1-c1': done }, 100)
  setup()
  expect(screen.getByText('Nivel 2')).toBeInTheDocument()
})

test('reiniciar pide confirmación en pantalla y borra progreso y código guardado', async () => {
  withProgress({ 'm00-l1-c1': done }, 10)
  localStorage.setItem(codeKey('m00-l1-c1'), JSON.stringify({ '/App.js': 'x' }))
  localStorage.setItem('otra-cosa', 'queda')
  const user = userEvent.setup()
  setup()
  await user.click(screen.getByRole('button', { name: 'Reiniciar todo mi progreso' }))
  expect(screen.getByText('10 XP')).toBeInTheDocument() // todavía no se borró
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))
  expect(screen.getByText('10 XP')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Reiniciar todo mi progreso' }))
  await user.click(screen.getByRole('button', { name: 'Sí, borrar todo' }))
  expect(screen.getByText('0 XP')).toBeInTheDocument()
  expect(screen.queryByText('¡Primer reto!')).not.toBeInTheDocument()
  expect(localStorage.getItem(codeKey('m00-l1-c1'))).toBeNull()
  expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)).xp).toBe(0)
  expect(localStorage.getItem('otra-cosa')).toBe('queda')
})
