// PWA Initialization
// Initialize all PWA services when the app starts

import { pwaIntegrationService } from './services/pwa/pwaIntegration';

// Unregister all service workers in development to prevent stale caching issues
async function unregisterServiceWorkersInDev() {
  if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      // Clear all caches to ensure fresh start
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch {
      // Silently fail
    }
  }
}

export async function initializePWA() {
  try {
    // In development, unregister any existing service workers
    if (process.env.NODE_ENV === 'development') {
      await unregisterServiceWorkersInDev();
      return true; // Skip PWA initialization in development
    }
    
    // Initialize the main PWA integration service
    // This will automatically initialize all sub-services
    await pwaIntegrationService.init();
    
    // Preload critical routes for better offline experience
    const criticalRoutes = [
      '/',
      '/analyze',
      '/reports',
      '/manifest.json'
    ];
    
    await pwaIntegrationService.preloadRoutes(criticalRoutes);
    
    return true;
  } catch {
    return false;
  }
}

// Auto-initialize when this module is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePWA);
  } else {
    initializePWA();
  }
}