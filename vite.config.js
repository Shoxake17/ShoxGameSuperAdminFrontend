import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Build vaqtida environment o'zgaruvchilarini yuklash
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    
    // Environment o'zgaruvchilarini kod ichida global qilish
    define: {
  'process.env.VITE_BACKEND_URL': JSON.stringify(env.VITE_BACKEND_URL),
  'process.env.VITE_SUPER_BACKEND_URL': JSON.stringify(env.VITE_SUPER_BACKEND_URL),
},


    plugins: [
      react(),
      VitePWA({
        devOptions: {
          enabled: false,
          type: 'module',
        },
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'ShoxPay Super Admin',
          short_name: 'SuperAdmin',
          description: 'ShoxPay tizimini to\'liq boshqarish',
          theme_color: '#091020',
          background_color: '#091020',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],

    // ── SERVER SOZLAMALARI (Development uchun) ──
    server: {
      port: 5176,
      strictPort: true,
      host: '0.0.0.0',
      cors: true,
      hmr: {
        protocol: 'wss',
        host: 'dev-super.shoxpro.uz',
        clientPort: 443,
        path: '@vite-hmr'
      }
    },

    // ── BUILD SOZLAMALARI (Production uchun optimallashtirilgan) ──
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    }
  };
});