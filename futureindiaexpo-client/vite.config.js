import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API = process.env.VITE_PROXY_TARGET || 'http://localhost:5000'

// The storefront and the admin panel were two PHP layouts loading incompatible theme bundles
// (Bootstrap 4 + jQuery for Molla, Bootstrap 5 for DASHMIN). They stay two separate documents
// here for the same reason, so navigating between them is a real page load, as it was before.
function adminEntry() {
  return {
    name: 'admin-entry',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path] = (req.url || '').split('?')
        if (path === '/login/future-admin-access' || path === '/admin' || path.startsWith('/admin/')) {
          req.url = '/admin.html'
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), adminEntry()],
  server: {
    proxy: {
      '/api': API,
      // Theme CSS/JS and every product image come from the copied assets tree the API serves.
      '/assets': API,
    },
  },
  build: {
    // /assets belongs to the original theme and uploads (served by the API), so the bundle
    // goes elsewhere.
    assetsDir: 'static',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },
})
