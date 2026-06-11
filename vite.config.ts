import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/ai-chat': {
          target: 'http://127.0.0.1:5001/printhiveph-20at26/us-central1',
          changeOrigin: true,
          rewrite: () => '/aiChat',
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            firebaseAuth: ['firebase/app', 'firebase/auth'],
            firebaseData: ['firebase/firestore', 'firebase/storage', 'firebase/analytics'],
            react: ['react', 'react-dom', 'react-router-dom'],
            icons: ['lucide-react'],
            animation: ['motion', 'framer-motion'],
            charts: ['recharts'],
            scanner: ['html5-qrcode', 'react-barcode'],
            ai: ['react-markdown'],
          },
        },
      },
    },
  };
});
