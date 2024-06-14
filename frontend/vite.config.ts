import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from "vite-plugin-vuetify"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@plugins': fileURLToPath(new URL('../plugins', import.meta.url))
    }
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8088",
        ws: true,
        secure: false,
        changeOrigin: false,
        xfwd: true,
      }
    },
    fs: {
      strict: true,
      allow: [
        ".",
        "../node_modules/@mdi/font/fonts"
      ]
    }
  }
})
