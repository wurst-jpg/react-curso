import { safeRead, safeWrite } from './storage.js'

export const SETTINGS_KEY = 'curso-react:settings:v1'
const DEFAULTS = { autocomplete: true }

/** Ajustes del alumno. Si lo guardado falta, está dañado o no se puede leer: valores por defecto. */
export function loadSettings() {
  const raw = safeRead(SETTINGS_KEY, null)
  const valid = raw !== null && typeof raw === 'object' && !Array.isArray(raw)
  return { autocomplete: valid && typeof raw.autocomplete === 'boolean' ? raw.autocomplete : DEFAULTS.autocomplete }
}

export function saveSettings(settings) {
  return safeWrite(SETTINGS_KEY, { autocomplete: settings.autocomplete !== false })
}
