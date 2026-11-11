import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import ChallengePage from '../../src/pages/ChallengePage.jsx'
import { ProgressProvider } from '../../src/progress/ProgressContext.jsx'
import { PROGRESS_KEY } from '../../src/progress/progress.js'
import { codeKey } from '../../src/progress/code.js'

const runMock = vi.fn()
let previewReady = true

vi.mock('../../src/sandbox/useCheckRunner.js', () => ({
  useCheckRunner: () => ({ run: runMock, ready: previewReady }),
}))

// Sandpack falso: guarda los archivos en estado y ofrece la misma API que usa la página.
vi.mock('@codesandbox/sandpack-react', async () => {
  const React = await import('react')
  const Ctx = React.createContext(null)
  const toEntry = (v) => (typeof v === 'string' ? { code: v } : v)
  function SandpackProvider({ files, options = {}, children }) {
    const [state, setState] = React.useState(() => ({
      files: {
        '/App.js': { code: 'plantilla' },
        '/package.json': { code: '{}' },
        ...Object.fromEntries(Object.entries(files).map(([p, v]) => [p, toEntry(v)])),
      },
      activeFile: options.activeFile ?? Object.keys(files)[0],
    }))
    const sandpack = {
      ...state,
      updateFile: (path, code) =>
        setState((s) => ({ ...s, files: { ...s.files, [path]: { code } } })),
      addFile: (path, code = '') =>
        setState((s) => ({ ...s, files: { ...s.files, [path]: { code } }, activeFile: path })),
      deleteFile: (path) =>
        setState((s) => {
          const next = { ...s.files }
          delete next[path]
          return { ...s, files: next }
        }),
      setActiveFile: (path) => setState((s) => ({ ...s, activeFile: path })),
      openFile: (path) => setState((s) => ({ ...s, activeFile: path })),
    }
    return <Ctx.Provider value={{ sandpack, listen: () => () => {} }}>{children}</Ctx.Provider>
  }
  const useSandpack = () => React.useContext(Ctx)
  function SandpackCodeEditor() {
    const { sandpack } = useSandpack()
    return (
      <textarea
        aria-label="Editor de código"
        value={sandpack.files[sandpack.activeFile]?.code ?? ''}
        onChange={(e) => sandpack.updateFile(sandpack.activeFile, e.target.value)}
      />
    )
  }
  const SandpackPreview = React.forwardRef(function SandpackPreview(_props, ref) {
    React.useImperativeHandle(ref, () => ({ getClient: () => null, clientId: 'x' }))
    return <div data-testid="preview" />
  })
  return { SandpackProvider, useSandpack, SandpackCodeEditor, SandpackPreview }
})

function renderAt(path) {
  return render(
    <ProgressProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/reto/:challengeId" element={<ChallengePage />} />
          <Route path="/" element={<p>Mapa del curso</p>} />
        </Routes>
      </MemoryRouter>
    </ProgressProvider>,
  )
}

const storedProgress = () => JSON.parse(localStorage.getItem(PROGRESS_KEY))

beforeEach(() => {
  localStorage.clear()
  runMock.mockReset()
  previewReady = true
})

test('muestra el título y las instrucciones de m00-l1-c1', () => {
  renderAt('/reto/m00-l1-c1')
  expect(screen.getByRole('heading', { name: 'Di hola' })).toBeInTheDocument()
  expect(screen.getByText(/cambia el texto del título/)).toBeInTheDocument()
  // markdown: **¡Hola, React!** se muestra en negrita
  expect(screen.getByText('¡Hola, React!', { selector: 'strong' })).toBeInTheDocument()
})

test('"Pista" revela solo la primera pista y la marca como usada', async () => {
  const user = userEvent.setup()
  renderAt('/reto/m00-l1-c1')
  expect(screen.queryByText('El texto está entre las etiquetas <h1> y </h1>.')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /pista/i }))
  expect(screen.getByText('El texto está entre las etiquetas <h1> y </h1>.')).toBeInTheDocument()
  expect(screen.queryByText(/Borra "Texto por cambiar"/)).not.toBeInTheDocument()
  expect(storedProgress().hintsUsed['m00-l1-c1']).toBe(true)
})

test('"Comprobar" con todo pass muestra "¡Reto superado!" y guarda 10 XP', async () => {
  const user = userEvent.setup()
  runMock.mockResolvedValue([{ index: 0, label: 'La página dice "¡Hola, React!"', status: 'pass' }])
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText('¡Reto superado!')).toBeInTheDocument()
  expect(runMock).toHaveBeenCalledWith([expect.objectContaining({ type: 'text', match: '¡Hola, React!' })])
  expect(storedProgress().xp).toBe(10)
  expect(storedProgress().completed['m00-l1-c1']).toBeTruthy()
  expect(screen.getByRole('link', { name: /siguiente reto/i })).toHaveAttribute('href', '/reto/m00-l2-c1')
})

test('"Comprobar" con un fail muestra el mensaje y no suma XP', async () => {
  const user = userEvent.setup()
  runMock.mockResolvedValue([
    { index: 0, label: 'La página dice "¡Hola, React!"', status: 'fail', message: 'No encontré ese texto.' },
  ])
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText('No encontré ese texto.')).toBeInTheDocument()
  expect(screen.queryByText('¡Reto superado!')).not.toBeInTheDocument()
  expect(storedProgress()?.xp ?? 0).toBe(0)
})

test('"Comprobar" con la vista previa sin cargar avisa y no culpa al código', async () => {
  const user = userEvent.setup()
  previewReady = false
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(
    await screen.findByText(
      'La vista previa todavía se está preparando. Espera a que aparezca tu página y pulsa "Comprobar" otra vez.',
    ),
  ).toBeInTheDocument()
  expect(runMock).not.toHaveBeenCalled()
  expect(storedProgress()?.xp ?? 0).toBe(0)
})

test('reto bloqueado sin progreso muestra el aviso y un enlace al mapa', () => {
  renderAt('/reto/m00-l2-c1')
  expect(screen.getByText(/todavía está bloqueado/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /mapa/i })).toHaveAttribute('href', '/')
  expect(screen.queryByRole('button', { name: 'Comprobar' })).not.toBeInTheDocument()
})

test('/src/main.jsx no tiene botón borrar; App.jsx sí', () => {
  renderAt('/reto/m00-l1-c1')
  const tabs = screen.getByRole('navigation', { name: /archivos/i })
  expect(within(tabs).getByRole('button', { name: 'main.jsx' })).toBeInTheDocument()
  expect(within(tabs).queryByRole('button', { name: /borrar main\.jsx/i })).not.toBeInTheDocument()
  expect(within(tabs).getByRole('button', { name: /borrar App\.jsx/i })).toBeInTheDocument()
  // Los archivos de la plantilla de Sandpack no aparecen como pestañas
  expect(within(tabs).queryByRole('button', { name: 'App.js' })).not.toBeInTheDocument()
})

test('mezcla comprobaciones de página y de vista previa en su orden original', async () => {
  const user = userEvent.setup()
  // m00-l2-c1 queda desbloqueado al completar m00-l1-c1
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({ completed: { 'm00-l1-c1': { xp: 10 } }, xp: 10, solutionViewed: {}, hintsUsed: {} }),
  )
  runMock.mockResolvedValue([{ index: 0, label: 'título', status: 'fail', message: 'Falta el título.' }])
  renderAt('/reto/m00-l2-c1')
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText('Falta el título.')).toBeInTheDocument()
  // Solo se mandan a la vista previa las del iframe (la de role, posición 2 en la lista original)
  expect(runMock).toHaveBeenCalledWith([expect.objectContaining({ type: 'role' })])
  const items = screen.getAllByRole('listitem').filter((li) => li.closest('[data-results]'))
  expect(items.map((li) => li.textContent)).toEqual([
    expect.stringContaining('Existe el archivo Saludo.jsx'),
    expect.stringContaining('App.jsx importa Saludo'),
    expect.stringContaining('Se ve el título "Bienvenido al curso"'),
  ])
})

test('"Nuevo archivo" crea /src/Saludo.jsx y rechaza nombres no válidos', async () => {
  const user = userEvent.setup()
  renderAt('/reto/m00-l1-c1')
  const tabs = screen.getByRole('navigation', { name: /archivos/i })

  await user.click(screen.getByRole('button', { name: 'Nuevo archivo' }))
  const input = screen.getByLabelText(/nombre del archivo/i)
  await user.click(screen.getByRole('button', { name: 'Crear' }))
  expect(screen.getByRole('alert')).toHaveTextContent(/escribe un nombre/i)

  await user.type(input, 'notas.txt')
  await user.click(screen.getByRole('button', { name: 'Crear' }))
  expect(screen.getByRole('alert')).toHaveTextContent(/\.jsx/)

  await user.clear(input)
  await user.type(input, 'App.jsx')
  await user.click(screen.getByRole('button', { name: 'Crear' }))
  expect(screen.getByRole('alert')).toHaveTextContent(/ya existe/i)

  await user.clear(input)
  await user.type(input, 'Saludo.jsx')
  await user.click(screen.getByRole('button', { name: 'Crear' }))
  expect(within(tabs).getByRole('button', { name: 'Saludo.jsx' })).toBeInTheDocument()
  expect(screen.queryByLabelText(/nombre del archivo/i)).not.toBeInTheDocument()
})

test('"Ver solución" pide confirmación en pantalla, aplica la solución y la marca como vista', async () => {
  const user = userEvent.setup()
  const confirmSpy = vi.spyOn(window, 'confirm')
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Ver solución' }))
  expect(screen.getByLabelText('Editor de código')).toHaveValue(
    'export default function App() {\n  return <h1>Texto por cambiar</h1>\n}\n',
  )
  await user.click(screen.getByRole('button', { name: /sí, ver la solución/i }))
  expect(screen.getByLabelText('Editor de código')).toHaveValue(
    'export default function App() {\n  return <h1>¡Hola, React!</h1>\n}\n',
  )
  expect(storedProgress().solutionViewed['m00-l1-c1']).toBe(true)
  expect(confirmSpy).not.toHaveBeenCalled()
  confirmSpy.mockRestore()
})

test('guarda el código del alumno ~500 ms después de dejar de escribir', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  try {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderAt('/reto/m00-l1-c1')
    const editor = screen.getByLabelText('Editor de código')
    await user.clear(editor)
    await user.type(editor, 'hola')
    await vi.advanceTimersByTimeAsync(600)
    const saved = JSON.parse(localStorage.getItem(codeKey('m00-l1-c1')))
    expect(saved['/src/App.jsx']).toBe('hola')
    expect(Object.keys(saved).sort()).toEqual(['/src/App.jsx', '/src/main.jsx'])
  } finally {
    vi.useRealTimers()
  }
})

test('abrir un reto sin escribir no guarda nada', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  try {
    renderAt('/reto/m00-l1-c1')
    await vi.advanceTimersByTimeAsync(1000)
    expect(localStorage.getItem(codeKey('m00-l1-c1'))).toBeNull()
  } finally {
    vi.useRealTimers()
  }
})

test('al cerrar la página (pagehide) se guarda lo pendiente sin esperar', async () => {
  const user = userEvent.setup()
  renderAt('/reto/m00-l1-c1')
  const editor = screen.getByLabelText('Editor de código')
  await user.clear(editor)
  await user.type(editor, 'x')
  window.dispatchEvent(new Event('pagehide'))
  const saved = JSON.parse(localStorage.getItem(codeKey('m00-l1-c1')))
  expect(saved['/src/App.jsx']).toBe('x')
})

test('si la comprobación falla por un error inesperado, avisa y el botón vuelve a estar disponible', async () => {
  const user = userEvent.setup()
  runMock.mockRejectedValue(new Error('boom'))
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText(/algo salió mal al comprobar/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Comprobar' })).toBeEnabled()
  expect(screen.queryByText('¡Reto superado!')).not.toBeInTheDocument()
})
