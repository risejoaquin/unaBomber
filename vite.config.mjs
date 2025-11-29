import { defineConfig } from 'vite';

export default defineConfig({
    root: 'client',
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
                app: './client/index.html'
            }
        }
    }
});