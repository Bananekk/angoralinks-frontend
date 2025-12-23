// vite.config.js - ZOPTYMALIZOWANY
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // 🚀 Optymalizacja build
  build: {
    // Generuj source maps tylko dla produkcji (debugowanie)
    sourcemap: false,
    
    // Minifikacja
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Usuń console.log w produkcji
        drop_debugger: true
      }
    },
    
    // 🔥 Code Splitting - rozbicie na mniejsze chunki
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - biblioteki zewnętrzne
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-utils': ['axios', 'react-hot-toast'],
          
          // Lucide icons - osobny chunk (duża biblioteka)
          'vendor-icons': ['lucide-react'],
          
          // hCaptcha - ładowane tylko na Unlock page
          'vendor-captcha': ['@hcaptcha/react-hcaptcha'],
        },
        
        // Nazwy chunków z hash dla cache
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    
    // Limit rozmiaru chunka (ostrzeżenie jeśli > 500kb)
    chunkSizeWarningLimit: 500,
    
    // Target nowoczesnych przeglądarek
    target: 'es2020'
  },
  
  // 🚀 Optymalizacja dev server
  server: {
    port: 5173,
    strictPort: true,
    // Pre-bundle dependencies
    warmup: {
      clientFiles: [
        './src/pages/Home.jsx',
        './src/pages/Login.jsx',
        './src/pages/Dashboard.jsx'
      ]
    }
  },
  
  // 🚀 Optymalizacja zależności
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-hot-toast'
    ],
    // Exclude heavy deps that are lazy loaded
    exclude: ['@hcaptcha/react-hcaptcha']
  },
  
  // 🚀 Resolve aliases dla czystszych importów
  resolve: {
    alias: {
      '@': '/src',
      '@pages': '/src/pages',
      '@api': '/src/api',
      '@components': '/src/components',
      '@hooks': '/src/hooks'
    }
  }
})