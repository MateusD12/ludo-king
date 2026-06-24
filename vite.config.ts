import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: { enabled: true },
      includeAssets: ['favicon.ico', 'assets/*.png'],
      manifest: {
        name: 'Ludo King',
        short_name: 'Ludo',
        description: 'Premium Ludo Web Game',
        theme_color: '#1a0a00',
        background_color: '#1a0a00',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          { src: 'assets/dice.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'assets/dice.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,ts}'],
      },
    }),
  ],
})
