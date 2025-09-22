import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/rebase': {
          target: 'https://api.rebase.energy',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rebase/, ''),
        },
        '/api/entsoe': {
          target: 'https://web-api.tp.entsoe.eu',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/entsoe/, '/api'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('ENTSO-E proxy error:', err.message);
            });
          }
        },
        '/api/electricitymap': {
          target: 'https://api.electricitymap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/electricitymap/, '/v3'),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              const apiKey = env.VITE_ELECTRICITYMAP_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('auth-token', apiKey);
              } else {
                console.warn('⚠️ ElectricityMap API key not found in environment variables');
              }
            });
            proxy.on('error', (err, req, res) => {
              console.log('ElectricityMap proxy error:', err.message);
            });
          }
        }
        // OpenWeather proxy removed - using direct API calls
      }
    }
  }
})
