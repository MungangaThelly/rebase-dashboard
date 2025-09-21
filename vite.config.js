import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.rebase.energy',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api/, '');
          console.log('🔄 Proxying request:', path, '→', newPath);
          return newPath;
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward the API key from the original request
            const apiKey = req.headers['gl-api-key'];
            if (apiKey) {
              proxyReq.setHeader('GL-API-KEY', apiKey);
              console.log('🔑 API Key forwarded through proxy');
            } else {
              console.log('⚠️ No API key found in request headers');
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📡 Proxy response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
