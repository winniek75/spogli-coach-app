import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    cors: true
  },
  define: {
    // Make process.env available for Firebase SDK compatibility
    'process.env': process.env
  },
  optimizeDeps: {
    // Exclude Firebase modules from pre-bundling to avoid issues
    exclude: ['firebase/app', 'firebase/auth', 'firebase/database']
  }
})
