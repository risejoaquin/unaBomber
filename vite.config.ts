import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // ESTE BLOQUE ES VITAL PARA PHASER + VITE
    define: {
        global: 'window',
    },
})