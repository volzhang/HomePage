import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  resolve: {
    alias: {"@": path.resolve(__dirname, "./src"),},
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // 根据模块 ID 返回 chunk 名称
          if (id.includes('node_modules')) {
            // 1. React 核心
            if (id.includes('/react/') || id.includes('/react-dom/')) {
              return 'react-vendor'
            }

            // 2. Radix UI 组件库
            if (id.includes('@radix-ui')) {
              return 'ui-components'
            }

            // 3. dnd-kit 拖拽库
            if (id.includes('@dnd-kit')) {
              return 'drag-drop'
            }

            // 4. 国际化相关
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n'
            }

            // 5. 其他第三方库
            return 'vendor'
          }
        }
      }
    },
    // 提高警告阈值，避免频繁警告
    // chunkSizeWarningLimit: 800
  }

})
