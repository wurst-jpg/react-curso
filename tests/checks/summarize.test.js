import { summarizeResults } from '../../src/checks/summarize.js'

const r = (status) => ({ index: 0, label: 'x', status })

describe('summarizeResults', () => {
  it('pasa solo si todo es pass o manual-done', () => {
    expect(summarizeResults([r('pass'), r('manual-done')])).toEqual({
      passed: true,
      failed: 0,
      total: 2,
    })
  })
  it('cuenta fallos, errores y pendientes', () => {
    expect(
      summarizeResults([r('pass'), r('fail'), r('error'), r('manual-pending')]),
    ).toEqual({ passed: false, failed: 3, total: 4 })
  })
  it('lista vacía no pasa', () => {
    expect(summarizeResults([])).toEqual({ passed: false, failed: 0, total: 0 })
  })
})
