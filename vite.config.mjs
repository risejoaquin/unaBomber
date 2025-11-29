// risejoaquin/unabomber/unaBomber-77c2e36d24c38837281eea16a22c0e274059b7fc/vite.config.mjs

import { defineConfig } from 'vite';

export default defineConfig({
    // CAMBIO CLAVE: Cambiar la raíz a la carpeta principal (donde está index.html de React)
    root: '.',
    base: './',
    server: {
        port: 8080,
        open: true,
        cors: true,
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                // El archivo principal de la aplicación es index.html en la raíz
                app: './index.html'
            }
        }
    }
});