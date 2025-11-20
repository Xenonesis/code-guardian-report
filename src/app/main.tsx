// Import polyfills first to fix React scheduler issues
import '../polyfills';
import '../pwa-init';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// Import base styles first
import '../styles/base.css';

// Production-grade utilities
import { logger } from '../utils/logger';
import { env } from '../utils/envValidator';
import { ErrorBoundary } from '../utils/errorBoundary';
import '../utils/errorHandler'; // Initialize global error handlers

// Validate environment on app start (production only)
try {
  env.validate();
} catch (error) {
  logger.error('Environment validation failed', error);
  if (env.isProd()) {
    throw error; // Stop app in production if env is invalid
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
      const sendToAnalytics = (metric: { name: string; value: number }) => {
        logger.info(`Web Vital: ${metric.name}`, { value: metric.value });
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
}

