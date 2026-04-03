import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // ✅ ADD THIS
  server: {
    proxy: {
      "/analyze-finance": "http://localhost:5000",
      "/advisor": "http://localhost:5000",
    },
  },
})