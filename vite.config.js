import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/App.jsx'],
      refresh: true,
    }),
    react(),
  ],
  server: {
        host: '0.0.0.0',  // ← THÊM: Cho phép network access
        hmr: {
            host: '192.168.1.7',  // ← THÊM: IP laptop của bạn
        },
    },
});
