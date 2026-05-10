import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Change 'kenaz-frontend' to match your GitHub repo name exactly
  base: '/kenaz-frontend/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          xlsx: ['xlsx'],
        },
      },
    },
  },
})
