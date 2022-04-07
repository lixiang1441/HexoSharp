import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/frontend',
  server: { proxy: { '/api': 'http://127.0.0.1:8787' } },
  build: { outDir: '../../dist', emptyOutDir: true },
  resolve: { alias: { 'node-fetch': 'isomorphic-fetch' } },
  plugins: [
    react(),
    VitePWA({
      mode: 'production',
      base: '/',
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/testingcf\.jsdelivr\.net\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vditor-assets',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: { name: 'Hexo#', short_name: 'Hexo#', lang: 'zh_CN', start_url: '' },
    }),
  ],
});
