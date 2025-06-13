import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip'
          ],
          'chart-vendor': ['recharts'],
          'icons-vendor': ['lucide-react']
        },
      },
    },
    chunkSizeWarningLimit: 300,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: false,
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'sonner'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
}));
