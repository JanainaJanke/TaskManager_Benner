import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'custom-html-middleware',
      configureServer(server) {
        server.middlewares.use('/', (req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            const htmlPath = path.resolve(__dirname, 'public/index.html')
            const htmlContent = fs.readFileSync(htmlPath, 'utf-8')
            
            // Processa o HTML através do Vite
            server.transformIndexHtml(req.url!, htmlContent).then(html => {
              res.setHeader('Content-Type', 'text/html')
              res.end(html)
            }).catch(next)
            return
          }
          next()
        })
      }
    }
  ],
  server: {
    port: 3000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  }
})