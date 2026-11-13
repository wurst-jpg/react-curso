import { safeRead, safeWrite } from '../../src/progress/storage.js'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('safeRead', () => {
  it('devuelve el valor guardado', () => {
    localStorage.setItem('k', JSON.stringify({ a: 1 }))
    expect(safeRead('k', null)).toEqual({ a: 1 })
  })
  it('devuelve el fallback si falta la clave', () => {
    expect(safeRead('nada', 'fb')).toBe('fb')
  })
  it('devuelve el fallback si el JSON está corrupto', () => {
    localStorage.setItem('k', '{no json')
    expect(safeRead('k', 'fb')).toBe('fb')
  })
  it('devuelve el fallback si getItem lanza', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error()
    })
    expect(safeRead('k', 'fb')).toBe('fb')
  })
})

describe('safeWrite', () => {
  it('guarda y devuelve true', () => {
    expect(safeWrite('k', { a: 2 })).toBe(true)
    expect(JSON.parse(localStorage.getItem('k'))).toEqual({ a: 2 })
  })
  it('devuelve false si setItem lanza', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error()
    })
    expect(safeWrite('k', 1)).toBe(false)
  })
})
