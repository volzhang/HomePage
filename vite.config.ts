import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path, { resolve } from 'path'


const toPosix = (id: string) => id.replace(/\\/g, '/')

const isReact = (id: string) => {
    const p = toPosix(id);
    return (
        p.includes('react/') ||
        p.includes('react-dom/') ||
        p.includes('scheduler') ||
        p.includes('idb-keyval') ||
        p.includes('valibot') ||
        p.includes('src/vol_apps/03_utils/createDebouncedSet.ts')
    );
}

const isZustand = (id: string) => {
    const p = toPosix(id);
    return (
        p.includes('zustand') ||
        p.includes('src/vol_apps/tool/createPersistedStore.ts') ||
        p.includes('src/vol_apps/tool/useStoreHydrated.ts')
    );
}

const isMyStore = (id: string) => {
    const p = toPosix(id)
    return (
        p.includes('src/vol_apps/04_persist_atoms/runMigration') ||
        p.includes('src/vol_apps/04_persist_atoms/signal') ||
        p.includes('src/vol_apps/04_persist_atoms')
    )
}

const isVendor = (id: string) => {
    return id.includes('node_modules')
}

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    base: './',

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

    build: {
        reportCompressedSize: true,

        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                privacy: resolve(__dirname, 'privacy.html'),
            },

            output: {
                manualChunks(id: string) {
                    const p = toPosix(id)
                    if (isReact(p)) return 'public'
                    if (isZustand(p)) return 'zustand'
                    if (isMyStore(p)) return 'signal'
                    if (isVendor(p)) return 'vendor'
                    return undefined
                }
            }
        }
    }
})