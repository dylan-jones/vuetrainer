import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    // Auto-imports only the Vuetify components used, and wires in our Sass settings.
    vuetify({ styles: { configFile: 'src/styles/settings.scss' } }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // `npm run dev:api` serves the Worker API locally; the dev server forwards /api calls to it.
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
  build: {
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
