import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/Nestbau/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Duisburg Wohn-Straßen',
        short_name: 'WohnMap',

        // WICHTIG für GitHub Pages (Repo-Unterpfad):
        start_url: '/Nestbau/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1b3a4b',

        // WICHTIG: KEIN führender Slash, sonst wird von Domain-Root geladen (und 404t)
        icons: [
          {
            src: 'icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ]
});
