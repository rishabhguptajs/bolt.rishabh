import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@heroicons/react/24/outline']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'heroicons': ['@heroicons/react/24/outline']
        }
      }
    }
  }
}) 