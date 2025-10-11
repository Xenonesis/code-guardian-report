// Import polyfills first to fix React scheduler issues
import '../polyfills';
import '../pwa-init';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// Import base styles first
import '../styles/base.css';
// Then try importing other styles incrementally
// import '../styles/enhanced-ui.css';
// import '../styles/about-page-enhancements.css';
// import '../styles/sidebar-fix.css';
// import '../styles/sidebar-position-fix.css';
// import '../index.css';

// Performance monitoring
if ('performance' in window && 'mark' in window.performance) {
  performance.mark('app-start');
}

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // In production, send to error reporting service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(event.error);
  }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // In production, send to error reporting service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(event.reason);
  }
});

// Service Worker registration is handled by PWA integration (src/pwa-init.ts)

// Initialize app with error boundary and performance monitoring
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

// Render app with React StrictMode for development checks
root.render(
  <StrictMode>
      <App />
  </StrictMode>
);

// Performance measurement
if ('performance' in window && 'measure' in window.performance) {
  window.addEventListener('load', () => {
    performance.mark('app-end');
    performance.measure('app-load-time', 'app-start', 'app-end');
    
    // Log performance metrics in development
    if (import.meta.env.DEV) {
      const measure = performance.getEntriesByName('app-load-time')[0];
      console.log(`App load time: ${measure.duration.toFixed(2)}ms`);
    }
  });
}

// Web Vitals reporting (for production)
if (import.meta.env.PROD) {
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(console.log);
    onFID(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
  }).catch(() => {
    // Gracefully handle if web-vitals is not available
  });
}
