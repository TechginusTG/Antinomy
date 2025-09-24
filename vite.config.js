import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://syncro.tg-antinomy.kro.kr',
    }),
  ],
  root: 'client',
  build: {
    chunkSizeWarningLimit: 1000,
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
      }
    }
  },
  // publicDir의 기본값 'public'을 사용하도록 해당 라인을 제거합니다.
  // publicDir: 'assets', 
  server: {
    host: true, // Listen on all network interfaces
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
})