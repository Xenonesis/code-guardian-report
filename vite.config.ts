import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-toast', '@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-checkbox'],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          'icons-vendor': ['lucide-react'],
          // Feature chunks
          'analytics': ['src/components/AnalyticsDashboard.tsx', 'src/components/EnhancedAnalyticsDashboard.tsx'],
          'export': ['src/components/DataExport.tsx'],
          'search': ['src/components/AdvancedSearch.tsx'],
          'performance': ['src/components/PerformanceMonitor.tsx'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'recharts',
      'lucide-react'
    ],
  },
}));
