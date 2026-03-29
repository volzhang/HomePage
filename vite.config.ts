import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path, {resolve} from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  base: './',
  resolve: {
    alias: {"@": path.resolve(__dirname, "./src"),},
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'), // 新增
      },
      output: {
        manualChunks(id: string) {
          // 根据模块 ID 返回 chunk 名称
          if (id.includes('node_modules')) {
            // 1. React 核心
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react'
            }
            // 2. Radix UI 组件库
            if (id.includes('@radix') || id.includes('@shadcn')) {
              return 'ui'
            }
            // 3. codemirror
            if (id.includes('@codemirror')) {
              return 'cm'
            }
            // 3. 其他库
            return 'vendor'
          }
        }
      }
    },
    // 提高警告阈值，避免频繁警告
    // chunkSizeWarningLimit: 500
  }

})
