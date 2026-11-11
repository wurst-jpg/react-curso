import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import ModulePage from '../../src/pages/ModulePage.jsx'
import { ProgressProvider } from '../../src/progress/ProgressContext.jsx'
import { PROGRESS_KEY } from '../../src/progress/progress.js'

function setup(path = '/modulo/m00') {
  return render(
    <ProgressProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/modulo/:moduleId" element={<ModulePage />} />
        </Routes>
      </MemoryRouter>
    </ProgressProvider>,
  )
}

beforeEach(() => localStorage.clear())

test('sin progreso: primer reto con enlace y los demás bloqueados sin enlace', () => {
  setup()
  expect(screen.getByRole('heading', { level: 1, name: /Bienvenida/ })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Di hola/ })).toHaveAttribute('href', '/reto/m00-l1-c1')
  expect(screen.queryByRole('link', { name: /Crea tu primera pieza/ })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Deja el código limpio/ })).not.toBeInTheDocument()
  expect(screen.getAllByText(/Bloqueado/)).toHaveLength(2)
  expect(screen.getByText(/Disponible/)).toBeInTheDocument()
})

test('con el primer reto hecho aparece hecho y se desbloquea el siguiente', () => {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({ completed: { 'm00-l1-c1': { xp: 10, at: 'x' } }, xp: 10, solutionViewed: {}, hintsUsed: {} }),
  )
  setup()
  expect(screen.getByText(/Hecho/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Crea tu primera pieza/ })).toHaveAttribute(
    'href',
    '/reto/m00-l2-c1',
  )
  expect(screen.queryByRole('link', { name: /Deja el código limpio/ })).not.toBeInTheDocument()
})

test('un módulo que no existe muestra un aviso amable', () => {
  setup('/modulo/zzz')
  expect(screen.getByText(/No encontramos ese módulo/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /mapa del curso/i })).toHaveAttribute('href', '/')
})
