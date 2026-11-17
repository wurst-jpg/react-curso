import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Instructions from '../../src/components/Instructions.jsx'

const lesson = { title: 'Lección uno', explanation: 'Explicación de **JSX**.' }
const challenge = { id: 'c1', instructions: 'Cambia el título de la página.' }
const lesson2 = { title: 'Lección dos', explanation: 'Otra explicación.' }
const challenge2 = { id: 'c2', instructions: 'Haz un botón.' }

test('por defecto muestra la pestaña Reto con las instrucciones', () => {
  render(<Instructions lesson={lesson} challenge={challenge} />)
  expect(screen.getByRole('tablist')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Reto' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'Lección' })).toHaveAttribute('aria-selected', 'false')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Cambia el título de la página.')
  expect(screen.queryByText('Otra explicación.')).not.toBeInTheDocument()
  expect(screen.queryByText(/Explicación de/)).not.toBeInTheDocument()
})

test('al pulsar Lección muestra la explicación y oculta la misión', async () => {
  const user = userEvent.setup()
  render(<Instructions lesson={lesson} challenge={challenge} />)
  await user.click(screen.getByRole('tab', { name: 'Lección' }))
  expect(screen.getByRole('tab', { name: 'Lección' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Explicación de JSX.')
  expect(screen.getByRole('heading', { name: 'Lección uno' })).toBeInTheDocument()
  expect(screen.queryByText('Cambia el título de la página.')).not.toBeInTheDocument()
  const tab = screen.getByRole('tab', { name: 'Lección' })
  expect(screen.getByRole('tabpanel')).toHaveAttribute('id', tab.getAttribute('aria-controls'))
})

test('las flechas izquierda y derecha cambian de pestaña', async () => {
  const user = userEvent.setup()
  render(<Instructions lesson={lesson} challenge={challenge} />)
  screen.getByRole('tab', { name: 'Reto' }).focus()
  await user.keyboard('{ArrowRight}')
  expect(screen.getByRole('tab', { name: 'Lección' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'Lección' })).toHaveFocus()
  await user.keyboard('{ArrowLeft}')
  expect(screen.getByRole('tab', { name: 'Reto' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'Reto' })).toHaveFocus()
})

test('el aviso para principiantes abre la pestaña Lección', async () => {
  const user = userEvent.setup()
  render(<Instructions lesson={lesson} challenge={challenge} />)
  await user.click(screen.getByRole('button', { name: /necesitas repasar/i }))
  expect(screen.getByRole('tab', { name: 'Lección' })).toHaveAttribute('aria-selected', 'true')
})

test('al cambiar de reto vuelve a la pestaña Reto', async () => {
  const user = userEvent.setup()
  const { rerender } = render(<Instructions lesson={lesson} challenge={challenge} />)
  await user.click(screen.getByRole('tab', { name: 'Lección' }))
  rerender(<Instructions lesson={lesson2} challenge={challenge2} />)
  expect(screen.getByRole('tab', { name: 'Reto' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent('Haz un botón.')
})
