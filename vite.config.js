import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: '../dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'antd-vendor': ['antd'],
          'reactflow-vendor': ['reactflow'],
          'vendor': ['react-router-dom', 'zustand', 'dagre']
        }
      }
    }
  },
  publicDir: 'assets',
  server: {
    host: true, // Listen on all network interfaces
  },
})
