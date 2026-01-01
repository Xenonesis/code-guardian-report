// Service Worker - Development Mode
// This file auto-unregisters in development to prevent caching issues

self.addEventListener('install', function(event) {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Unregister self in development
  event.waitUntil(
    self.registration.unregister().then(function() {
      // Clear all caches
      return caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
    })
  );
});
