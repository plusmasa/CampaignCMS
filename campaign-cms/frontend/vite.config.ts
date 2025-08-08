import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
  port: 3000,
  strictPort: true,
    open: true,
    // Proxy API calls to backend in development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: '../dist',
  },
  // Define global constants for environment handling
  define: {
    __IS_CODESPACES__: JSON.stringify(!!process.env.CODESPACE_NAME),
  }
})
