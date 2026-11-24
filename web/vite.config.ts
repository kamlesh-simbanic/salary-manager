import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Dev: the API runs on :3000 and is proxied so the browser sees a single origin (no CORS).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3000' } },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], globals: false },
})
