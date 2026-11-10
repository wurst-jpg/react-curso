import { BrowserRouter, Route, Routes } from 'react-router'
import { ProgressProvider } from './progress/ProgressContext.jsx'
import ChallengePage from './pages/ChallengePage.jsx'

function Inicio() {
  return (
    <main className="min-h-screen bg-slate-900 p-8 text-slate-100">
      <h1 className="text-3xl font-bold">Curso de React</h1>
    </main>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/reto/:challengeId" element={<ChallengePage />} />
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  )
}
