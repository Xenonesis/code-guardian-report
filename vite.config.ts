import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// Production configuration
const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

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
  // Preview server configuration (production-like)
  preview: {
    port: 4173,
    host: true,
    cors: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  // Professional production build configuration
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    outDir: 'dist',
    emptyOutDir: true,
    minify: isProduction ? 'terser' : 'esbuild',
    terserOptions: isProduction ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info', 'console.trace'],
        passes: 2,
        ecma: 2020,
        module: true,
        toplevel: true,
        unsafe_arrows: true,
        unsafe_methods: true
      },
      mangle: {
        safari10: true,
        properties: false
      },
      format: {
        comments: false,
        ecma: 2020
      },
      safari10: true
    } : undefined,
    sourcemap: isProduction ? false : 'inline',
    chunkSizeWarningLimit: 500, // Strict limit for performance
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        // Conservative chunk splitting to avoid circular dependencies on Vercel
        manualChunks: {
          // Core React libraries - loaded first
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // UI libraries
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-slot', 'sonner'],
          // Chart libraries
          'charts': ['recharts'],
          // Icons and animations
          'icons': ['lucide-react', 'framer-motion'],
          // Firebase
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics', 'firebase/performance'],
          // PDF generation
          'pdf-vendor': ['jspdf', 'html2canvas'],
          // Syntax parsing
          'parser-vendor': ['@babel/parser', '@babel/traverse', '@babel/types', 'esprima', 'esquery', 'acorn', 'web-tree-sitter']
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
    }
  },
  // Dependency optimization for faster dev startup
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
  // Environment variables - Production safe
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '9.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __IS_PRODUCTION__: isProduction,
    __COMMIT_HASH__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || 'local')
  },
  // ESBuild configuration
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
    minifyIdentifiers: isProduction,
    minifySyntax: true,
    minifyWhitespace: true,
    keepNames: true, // Preserve function names for React error boundaries
    sourcemap: !isProduction,
    treeShaking: true
  },
  // Production-specific JSON handling
  json: {
    stringify: true // Better performance for large JSON imports
  },
  // Worker configuration
  worker: {
    format: 'es'
  }
}) satisfies UserConfig;
