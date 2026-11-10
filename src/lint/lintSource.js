import { Linter } from 'eslint-linter-browserify'

// Variables globales del navegador que el código de los alumnos puede usar sin importar.
const BROWSER_GLOBALS = [
  'window', 'document', 'console', 'navigator', 'location', 'history', 'localStorage',
  'sessionStorage', 'fetch', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
  'requestAnimationFrame', 'cancelAnimationFrame', 'alert', 'confirm', 'prompt', 'URL',
  'URLSearchParams', 'FormData', 'Event', 'CustomEvent', 'AbortController', 'Promise',
  'Intl', 'JSON', 'Math', 'Date', 'Map', 'Set', 'WeakMap', 'WeakSet', 'Symbol',
  'structuredClone', 'queueMicrotask', 'HTMLElement', 'Element', 'Node', 'performance',
  'crypto', 'matchMedia', 'getComputedStyle', 'IntersectionObserver', 'ResizeObserver',
  'MutationObserver', 'Image', 'Audio', 'Blob', 'File', 'FileReader', 'WebSocket',
  'TextEncoder', 'TextDecoder', 'atob', 'btoa', 'Headers', 'Request', 'Response',
]

// Regla mínima: marca como "usado" lo que aparece como <Componente /> en JSX
// (equivale a jsx-uses-vars de eslint-plugin-react, que aún no soporta ESLint 10).
const jsxUsesVars = {
  meta: { type: 'problem', schema: [] },
  create(context) {
    return {
      JSXOpeningElement(node) {
        let name = node.name
        while (name.type === 'JSXMemberExpression') name = name.object
        if (name.type !== 'JSXIdentifier') return
        // Las etiquetas en minúscula (div, span) son HTML, no variables.
        if (/^[a-z]/.test(name.name)) return
        context.sourceCode.markVariableAsUsed(name.name, node)
      },
    }
  },
}

const config = [
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: { local: { rules: { 'jsx-uses-vars': jsxUsesVars } } },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: Object.fromEntries(BROWSER_GLOBALS.map((g) => [g, 'readonly'])),
    },
    rules: {
      'local/jsx-uses-vars': 2,
      'no-undef': 2,
      'no-unused-vars': 1,
      'no-dupe-keys': 2,
      'no-unreachable': 1,
    },
  },
]

const TRANSLATIONS = {
  'no-undef': (m) => `'${m.messageData?.name ?? name(m)}' no está definida. ¿La escribiste bien o falta importarla?`,
  'no-unused-vars': (m) => `'${m.messageData?.varName ?? name(m)}' se creó pero nunca se usa.`,
  'no-dupe-keys': (m) => `La clave '${m.messageData?.name ?? name(m)}' está repetida en el objeto; solo la última cuenta.`,
  'no-unreachable': () => 'Este código nunca se ejecuta porque hay un return (o similar) antes.',
}

// Respaldo: el primer texto entre comillas del mensaje original.
const name = (m) => /'([^']+)'/.exec(m.message)?.[1] ?? '?'

const linter = new Linter()

export function lintSource(code) {
  const messages = linter.verify(String(code ?? ''), config, { filename: 'archivo.jsx' })
  return messages.map((m) => {
    if (m.fatal) {
      return {
        line: m.line ?? 1,
        column: m.column ?? 1,
        endLine: m.endLine ?? m.line ?? 1,
        endColumn: m.endColumn ?? (m.column ?? 1) + 1,
        severity: 2,
        ruleId: null,
        message: `Hay un error de escritura en el código (línea ${m.line ?? 1}). Revisa paréntesis, llaves y comillas.`,
      }
    }
    const translate = TRANSLATIONS[m.ruleId]
    return {
      line: m.line,
      column: m.column,
      endLine: m.endLine ?? m.line,
      endColumn: m.endColumn ?? m.column + 1,
      severity: m.severity,
      ruleId: m.ruleId,
      message: translate ? translate(m) : m.message,
    }
  })
}
