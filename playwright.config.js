import { defineConfig, devices } from '@playwright/test'

// Puerto configurable (E2E_PORT) para poder correr varias suites a la vez en worktrees distintos.
const PORT = Number(process.env.E2E_PORT) || 5199

// Requiere internet: las vistas previas de Sandpack descargan el empaquetador (la primera
// tarda ~15-18 s), por eso el tiempo de cada test es de 90 s.
export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
