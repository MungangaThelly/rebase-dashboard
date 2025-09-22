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
    },
    
    // ✅ ADD BUILD OPTIMIZATION
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      
      rollupOptions: {
        output: {
          // ✅ Manual chunk splitting for better performance
          manualChunks: (id) => {
            // Vendor libraries
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              return 'vendor';
            }
            
            // API modules
            if (id.includes('/api/')) {
              return 'api-modules';
            }
            
            // Components
            if (id.includes('/components/') && !id.includes('Dashboard.jsx')) {
              return 'dashboard-components';
            }
          }
        }
      },
      
      // ✅ Production optimizations
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true
        }
      }
    }
  }
})
