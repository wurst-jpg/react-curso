/** Minúsculas, sin acentos, espacios colapsados y recortado. */
export function normalizeText(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
