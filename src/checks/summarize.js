/** `passed` solo si hay resultados y todos son `pass` o `manual-done`. */
export function summarizeResults(results) {
  const total = results.length
  const failed = results.filter((r) => r.status !== 'pass' && r.status !== 'manual-done').length
  return { passed: total > 0 && failed === 0, failed, total }
}
