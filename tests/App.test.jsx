import { render, screen } from '@testing-library/react'
import App from '../src/App.jsx'

test('muestra el título del curso', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Curso de React')
})
