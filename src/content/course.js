import m00 from './modules/m00-bienvenida.js'

const course = [m00]

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
