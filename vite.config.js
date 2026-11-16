import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            '/donki-api': {
                target: 'https://ccmc.gsfc.nasa.gov',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/donki-api/, '/DONKI-API'),
            },
        },
    },
});
