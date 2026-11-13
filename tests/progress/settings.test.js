import { loadSettings, saveSettings, SETTINGS_KEY } from '../../src/progress/settings.js'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('settings', () => {
  it('la clave es curso-react:settings:v1', () => {
    expect(SETTINGS_KEY).toBe('curso-react:settings:v1')
  })
  it('por defecto el autocompletado está activado', () => {
    expect(loadSettings()).toEqual({ autocomplete: true })
  })
  it('guarda y lee el valor', () => {
    saveSettings({ autocomplete: false })
    expect(JSON.parse(localStorage.getItem(SETTINGS_KEY))).toEqual({ autocomplete: false })
    expect(loadSettings()).toEqual({ autocomplete: false })
  })
  it('con JSON corrupto vuelve al valor por defecto', () => {
    localStorage.setItem(SETTINGS_KEY, '{no json')
    expect(loadSettings()).toEqual({ autocomplete: true })
  })
  it('con datos de otro tipo vuelve al valor por defecto', () => {
    for (const bad of ['null', '5', '"x"', '[]', '{"autocomplete":"no"}']) {
      localStorage.setItem(SETTINGS_KEY, bad)
      expect(loadSettings()).toEqual({ autocomplete: true })
    }
  })
  it('con localStorage bloqueado no lanza y usa el valor por defecto', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado')
    })
    expect(loadSettings()).toEqual({ autocomplete: true })
    expect(() => saveSettings({ autocomplete: false })).not.toThrow()
  })
})
