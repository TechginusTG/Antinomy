import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://syncro.tg-antinomy.kro.kr',
    }),
    visualizer({ filename: './dist/stats.html' })
  ],
  root: 'client',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@ant-design/icons')) {
              return 'vendor_ant-icons';
            }
            if (id.includes('antd')) {
              return 'vendor_antd';
            }
            if (id.includes('reactflow')) {
                return 'vendor_reactflow';
            }
            if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor_react';
            }
            return 'vendor_others';
          }
        }
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