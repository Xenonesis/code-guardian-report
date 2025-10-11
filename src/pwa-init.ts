// PWA Initialization
// Initialize all PWA services when the app starts

import { pwaIntegrationService } from './services/pwa/pwaIntegration';

export async function initializePWA() {
  try {
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

// Auto-initialize when this module is imported (production only)
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePWA);
  } else {
    initializePWA();
  }
}