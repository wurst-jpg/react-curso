// Descubre solo los módulos: cada archivo `src/content/modules/mNN-slug.js` exporta un módulo
// por defecto. El orden del curso es el orden alfabético de la ruta (m00-…, m01-…, … m11-…).
const found = import.meta.glob('./modules/*.js', { eager: true, import: 'default' })

const course = Object.keys(found)
  .sort()
  .map((path) => found[path])

export function flattenChallenges(modules) {
  const out = []
  for (const module of modules) {
    for (const lesson of module.lessons) {
      for (const challenge of lesson.challenges) {
        out.push({ challenge, lesson, module, index: out.length })
      }
    }
  }
  return out
}

export function findChallenge(modules, id) {
  return flattenChallenges(modules).find((e) => e.challenge.id === id) ?? null
}

export default course
