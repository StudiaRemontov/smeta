import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      mode: 'development',
      base: '/',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['favicon.ico'],
      strategies: 'injectManifest',
      manifest: {
        name: 'Manifest',
        short_name: 'm',
        theme_color: '#ffffff',
        start_url: '/',
        background_color: '#ffffff',
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html}', 'assets/*'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: [
          `@import "./src/assets/variables";@import "./src/assets/mixins";`,
        ],
      },
    },
  },
})
