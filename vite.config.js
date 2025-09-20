import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rebase.energy',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),                    
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🚨 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Proxying request:', req.method, req.url, '→', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📡 Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
