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
    
    // ✅ SIMPLIFIED BUILD CONFIG for Netlify compatibility
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1600,
      
      rollupOptions: {
        output: {
          // ✅ Simplified chunking - less complex than function-based
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'charts-vendor': ['recharts']
          }
        }
      },
      
      // ✅ Use esbuild instead of terser for better compatibility
      minify: 'esbuild',
      
      // ✅ Disable source maps for production
      sourcemap: false
    },
    
    // ✅ Add base configuration for proper asset handling
    base: './',
    
    // ✅ Better resolve configuration
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname
      }
    }
  }
})
