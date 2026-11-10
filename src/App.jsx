import { BrowserRouter, Route, Routes } from 'react-router'

function Inicio() {
  return (
    <main className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <h1 className="text-3xl font-bold">Curso de React</h1>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  )
}
