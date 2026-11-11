import { BrowserRouter, Route, Routes } from 'react-router'
import { ProgressProvider } from './progress/ProgressContext.jsx'
import XpBar from './components/XpBar.jsx'
import CourseMap from './pages/CourseMap.jsx'
import ModulePage from './pages/ModulePage.jsx'
import ChallengePage from './pages/ChallengePage.jsx'

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-900">
          <XpBar />
          <Routes>
            <Route path="/" element={<CourseMap />} />
            <Route path="/modulo/:moduleId" element={<ModulePage />} />
            <Route path="/reto/:challengeId" element={<ChallengePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ProgressProvider>
  )
}
