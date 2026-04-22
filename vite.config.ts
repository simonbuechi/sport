/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['web-app-manifest-192x192.png', 'web-app-manifest-512x512.png'],
      manifest: {
        id: 'sport',
        name: 'Sport Amigo',
        short_name: 'Sport Amigo',
        description: 'A journal and technique tracker for sports.',
        theme_color: '#ffffff',
        background_color: '#a02197',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'en-US',
        dir: 'ltr',
        categories: ['sports', 'health', 'fitness'],
        icons: [
          {
            "src": "web-app-manifest-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": "web-app-manifest-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
          }
        ]
      }
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@mui/x-charts')) return 'vendor_mui_x';
            if (id.includes('@mui/icons-material')) return 'vendor_mui_icons';
            if (id.includes('@mui')) return 'vendor_mui';
            if (id.includes('firebase')) return 'vendor_firebase';
            if (id.includes('@hello-pangea/dnd')) return 'vendor_dnd';
            if (id.includes('react-router-dom') || id.includes('@remix-run')) return 'vendor_router';
            return 'vendor';
          }
        }
      }
    }
  }
})
