import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // On GitHub Actions, base path is the repo name '/FutureSelector/', otherwise '/'
  base: process.env.GITHUB_ACTIONS ? '/FutureSelector/' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
