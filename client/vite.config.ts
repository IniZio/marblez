import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 1234,
  },
  plugins: [
    reactRefresh(),
    VitePWA({
      registerType: "autoUpdate",
      srcDir: "src",
      filename: "service-worker.ts",
      base: "/",
      strategies: "injectManifest",
      includeAssets: ["/logo.svg"],
      manifest: {
        "name": "Marblez",
        "short_name": "Marblez",
        "start_url": "./",
        "theme_color": "#FFF",
        "icons": [
          {
            src: "/manifest-icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/manifest-icon-512.png",
            sizes: "512x512",
            type: "image/png",
          }
        ]
      },
    }),
  ]
})
