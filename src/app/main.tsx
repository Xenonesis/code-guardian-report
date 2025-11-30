// Import polyfills first to fix React scheduler issues
import '../polyfills';
import '../pwa-init';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// Import styles - base.css for Tailwind v4 theme and index.css for additional component styles
import '../styles/base.css';
import '../index.css';
import '../styles/enhanced-ui.css';
import '../styles/about-page-enhancements.css';

// Production-grade utilities
import { logger } from '../utils/logger';
import { env } from '../utils/envValidator';
import { ErrorBoundary } from '../utils/errorBoundary';
import '../utils/errorHandler'; // Initialize global error handlers
import { setupGlobalToast } from '../utils/toastNotifications';
import { runProductionHealthChecks } from '../utils/healthCheck';

// Setup global toast notifications
setupGlobalToast();

// Validate environment on app start (production only)
try {
  env.validate();
} catch (error) {
  logger.error('Environment validation failed', error);
  if (env.isProd()) {
    // In production, log but don't crash for missing optional vars
    logger.warn('Some environment variables are missing, features may be limited');
  }
}

// Performance monitoring
if ('performance' in globalThis && 'mark' in globalThis.performance) {
  performance.mark('app-start');
}

// Initialize app with error boundary and performance monitoring
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);

// Render app with React StrictMode and ErrorBoundary
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Performance measurement
if ('performance' in globalThis && 'measure' in globalThis.performance) {
  globalThis.addEventListener('load', () => {
    performance.mark('app-end');
    performance.measure('app-load-time', 'app-start', 'app-end');
    
    // Log performance metrics
    const measure = performance.getEntriesByName('app-load-time')[0];
    logger.info(`App load time: ${measure.duration.toFixed(2)}ms`);
  });
}

// Web Vitals reporting (for production monitoring)
if (env.isProd()) {
  void (async () => {
    try {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');
      
      // Send vitals to analytics or logging service
      const sendToAnalytics = (metric: { name: string; value: number; id: string; rating: string }) => {
        logger.info(`Web Vital: ${metric.name}`, { 
          value: metric.value,
          id: metric.id,
          rating: metric.rating 
        });
        
        // Send to Vercel Analytics (automatically integrated)
        // or custom analytics endpoint
      };

      onCLS(sendToAnalytics);
      onINP(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    } catch (error) {
      logger.warn('Web Vitals not available', error);
    }
  })();

  // Run production health checks after initial render
  setTimeout(() => {
    runProductionHealthChecks().catch((error) => {
      logger.warn('Health check failed', error);
    });
  }, 3000);
}

