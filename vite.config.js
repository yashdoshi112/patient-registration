// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // ⚠️ Don’t pre-bundle PGlite
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  // ⚠️ Keep your multi-tab worker as an ES module
  worker: {
    format: 'es',
  },
})
