import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
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
        start_url: '/sport/',
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
  base: '/sport/',
})
