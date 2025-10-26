import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // React SWC plugin with optimized configuration
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@services': path.resolve(__dirname, './src/services'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@types': path.resolve(__dirname, './src/types'),
      '@config': path.resolve(__dirname, './src/config')
    },
    dedupe: ['react', 'react-dom', 'scheduler']
  },
  // Development server optimizations
  server: {
    port: 5173,
    host: true,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    cors: true
  },
  // Professional build configuration
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Conservative chunk splitting to avoid circular dependencies on Vercel
        manualChunks: {
          // Core React libraries - loaded first
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // UI libraries
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-slot'],
          // Chart libraries
          'charts': ['recharts'],
          // Icons and animations
          'icons': ['lucide-react', 'framer-motion']
        },

        // Professional file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^.]*$/, '')
            : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/i.test(assetInfo.name || '')) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
      // External dependencies optimization
      external: [],
      // Tree shaking optimization - conservative settings for Vercel
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: true,
        unknownGlobalSideEffects: true
      }
    },
    // CSS optimization - use esbuild for Vercel compatibility
    cssMinify: 'esbuild'
  },
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'scheduler',
      'lucide-react',
      'recharts',
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast'
    ],
    exclude: ['@vite/client', '@vite/env'],
    esbuildOptions: {
      sourcemap: false // Disable source maps during dependency pre-bundling
    }
  },
  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '4.5.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  // ESBuild configuration
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
    minifyIdentifiers: false, // Prevent React scheduler mangling
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: true, // Preserve function names for React
    sourcemap: false // Disable source maps to avoid corrupted map files
  }
});
