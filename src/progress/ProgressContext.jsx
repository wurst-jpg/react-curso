import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { clearAllCode } from './code.js'
import {
  completeChallenge,
  emptyProgress,
  loadProgress,
  markHintUsed,
  markSolutionViewed,
  saveProgress,
} from './progress.js'

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgress)

  // Se guarda en cada cambio (saveProgress nunca lanza errores).
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const complete = useCallback((challenge) => setProgress((p) => completeChallenge(p, challenge)), [])
  const viewSolution = useCallback((id) => setProgress((p) => markSolutionViewed(p, id)), [])
  const recordHint = useCallback((id) => setProgress((p) => markHintUsed(p, id)), [])

  // Borra el avance y también el código guardado de todos los retos.
  const resetAll = useCallback(() => {
    clearAllCode()
    setProgress(emptyProgress())
  }, [])

  const value = useMemo(
    () => ({ progress, complete, viewSolution, recordHint, resetAll }),
    [progress, complete, viewSolution, recordHint, resetAll],
  )
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress() {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('useProgress debe usarse dentro de <ProgressProvider>')
  return value
}
