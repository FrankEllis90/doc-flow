import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue()
  ],
  server: {
    port: 3000,
    host: 'localhost',
    // Enable HMR for better development experience
    hmr: {
      port: 3001
    },
    // Prevent Vite from clearing terminal on restart
    clearScreen: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vue-vendor';
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdf-vendor';
            }
            if (id.includes('@fortawesome')) {
              return 'ui-vendor';
            }
            if (id.includes('marked') || id.includes('file-saver') || id.includes('sortablejs')) {
              return 'utils-vendor';
            }
            return 'vendor';
          }
          
          // Split large application components
          if (id.includes('HomeView.vue')) {
            return 'home-view';
          }
          if (id.includes('DocumentProcessor.vue')) {
            return 'document-processor';
          }
          if (id.includes('ContentChunkBuilder.vue')) {
            return 'content-builder';
          }
          if (id.includes('src/utils/')) {
            return 'app-utils';
          }
          if (id.includes('src/stores/')) {
            return 'app-stores';
          }
        }
      }
    },
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize asset inlining threshold
    assetsInlineLimit: 4096,
    // Set performance budgets
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: false, // Disable for smaller bundles
    // Minimize CSS
    cssMinify: true,
    // Enable tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  css: {
    // Enable CSS preprocessing optimizations
    devSourcemap: false
  }
})