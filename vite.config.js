import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('🔧 Vite Config Loading...');
  console.log('🔧 Mode:', mode);
  console.log('🔧 Rebase API Key from env:', env.VITE_REBASE_API_KEY ? 'Found' : 'Missing');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/rebase': {
          target: 'https://api.rebase.energy',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rebase/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📤 Proxying Rebase Request:', req.method, req.url);
              console.log('📤 Target URL:', proxyReq.path);
              
              const apiKey = env.VITE_REBASE_API_KEY;
              console.log('🔑 API Key Check:', apiKey ? 'FOUND' : 'MISSING');
              
              if (apiKey) {
                // Try multiple header formats
                proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
                proxyReq.setHeader('X-API-Key', apiKey);
                proxyReq.setHeader('GL-API-KEY', apiKey);
                proxyReq.setHeader('API-Key', apiKey);
                proxyReq.setHeader('apikey', apiKey);
                console.log('✅ Added multiple API key header formats');
                console.log('📋 Headers set:', {
                  'Authorization': `Bearer ${apiKey.substring(0, 8)}...`,
                  'X-API-Key': `${apiKey.substring(0, 8)}...`,
                  'GL-API-KEY': `${apiKey.substring(0, 8)}...`
                });
              }
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('📥 Rebase Response:', proxyRes.statusCode, req.url);
              if (proxyRes.statusCode === 401) {
                console.log('🚨 401 Unauthorized - Check API key or endpoint');
              }
              if (proxyRes.statusCode === 302) {
                console.log('🔄 Redirect to:', proxyRes.headers.location);
              }
            });
          }
        },
        '/api/electricitymap': {
          target: 'https://api.electricitymap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/electricitymap/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              const apiKey = env.VITE_ELECTRICITYMAP_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('auth-token', apiKey);
              }
              console.log('📤 ElectricityMap Request:', req.url);
            });
          }
        },
        '/api/entsoe': {
          target: 'https://transparency.entsoe.eu/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/entsoe/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📤 ENTSO-E Request:', req.url);
            });
          }
        },
        '/api/openweather': {
          target: 'https://api.openweathermap.org/data',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/openweather/, ''),
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📤 OpenWeather Request:', req.url);
            });
          }
        }
      }
    }
  }
})
