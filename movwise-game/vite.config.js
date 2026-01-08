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
    port: 3010,
    strictPort: false,  // ポートが使用中の場合は別のポートを試行
    cors: true,
    open: false
    // https: true  // 一旦HTTPSを無効化（別の方法で対応）
  },
  define: {
    // Make process.env available for Firebase SDK compatibility
    'process.env': process.env
  },
  optimizeDeps: {
    // Exclude Firebase modules from pre-bundling to avoid issues
    exclude: ['firebase/app', 'firebase/auth', 'firebase/database']
  },
  build: {
    // Production optimizations for Vercel
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    },
    // Vercel optimization
    outDir: 'dist',
    emptyOutDir: true,
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          'vendor': [
            'vue',
            'vue-router',
            'pinia'
          ],
          'firebase': [
            'firebase/app',
            'firebase/auth',
            'firebase/database'
          ],
          'ui': [
            '@heroicons/vue',
            'lucide-vue-next'
          ],
          'games': [
            'gsap',
            'pixi.js',
            'three'
          ]
        },
        // Asset naming for better caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]'
          }
          if (/\.(mp3|wav|ogg)$/.test(name ?? '')) {
            return 'audio/[name]-[hash][extname]'
          }
          if (/\.css$/.test(name ?? '')) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging
    sourcemap: false,
    // Asset inlining threshold
    assetsInlineLimit: 4096
  }
})
