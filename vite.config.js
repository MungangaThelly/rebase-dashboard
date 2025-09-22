import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/rebase/weather': {
          target: 'https://api.rebase.energy/weather/v2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rebase\/weather/, ''),
          headers: {
            'Origin': 'https://api.rebase.energy'
          }
        },
        '/api/rebase': {
          target: 'https://api.rebase.energy',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/rebase/, ''),
          headers: {
            'Origin': 'https://api.rebase.energy'
          }
        },
        '/api/entsoe': {
          target: 'https://web-api.tp.entsoe.eu',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/entsoe/, '/api')
        },
        '/api/electricitymap': {
          target: 'https://api.electricitymap.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/electricitymap/, '/v3')
        }
      }
    }
  }
})
