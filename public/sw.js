// Code Guardian Enterprise - Service Worker
// Version: 4.5.0
// Professional PWA Service Worker with advanced caching strategies

const CACHE_NAME = 'code-guardian-v4.5.0';
const STATIC_CACHE = 'code-guardian-static-v4.5.0';
const DYNAMIC_CACHE = 'code-guardian-dynamic-v4.5.0';
const API_CACHE = 'code-guardian-api-v4.5.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.svg',
  '/favicon-32x32.svg',
  '/favicon-192x192.svg',
  '/favicon-512x512.svg',
  '/apple-touch-icon.svg',
  '/shield-favicon.svg',
  '/home.png',
  '/cc.png'
];

// Runtime caching patterns
const CACHE_STRATEGIES = {
  // Static assets - Cache First
  static: {
    pattern: /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico|webp)$/,
    strategy: 'CacheFirst',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100
  },
  
  // API calls - Network First with fallback
  api: {
    pattern: /\/api\//,
    strategy: 'NetworkFirst',
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50
  },
  
  // HTML pages - Network First
  pages: {
    pattern: /\.html$|\/$/,
    strategy: 'NetworkFirst',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 20
  },
  
  // External resources - Stale While Revalidate
  external: {
    pattern: /^https:\/\/(?!code-guardian-report\.vercel\.app)/,
    strategy: 'StaleWhileRevalidate',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 30
  }
};

// Install event - Cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v4.0.0');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v4.0.0');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;\n  const url = new URL(request.url);\n  \n  // Skip non-GET requests\n  if (request.method !== 'GET') {\n    return;\n  }\n  \n  // Skip chrome-extension and other non-http requests\n  if (!url.protocol.startsWith('http')) {\n    return;\n  }\n  \n  event.respondWith(handleRequest(request));\n});\n\n// Main request handler with caching strategies\nasync function handleRequest(request) {\n  const url = new URL(request.url);\n  \n  try {\n    // Static assets - Cache First\n    if (CACHE_STRATEGIES.static.pattern.test(url.pathname)) {\n      return await cacheFirst(request, STATIC_CACHE);\n    }\n    \n    // API calls - Network First\n    if (CACHE_STRATEGIES.api.pattern.test(url.pathname)) {\n      return await networkFirst(request, API_CACHE);\n    }\n    \n    // HTML pages - Network First\n    if (CACHE_STRATEGIES.pages.pattern.test(url.pathname) || url.pathname === '/') {\n      return await networkFirst(request, DYNAMIC_CACHE);\n    }\n    \n    // External resources - Stale While Revalidate\n    if (CACHE_STRATEGIES.external.pattern.test(url.origin)) {\n      return await staleWhileRevalidate(request, DYNAMIC_CACHE);\n    }\n    \n    // Default - Network with cache fallback\n    return await networkWithCacheFallback(request);\n    \n  } catch (error) {\n    console.error('[SW] Request failed:', error);\n    return await handleOfflineFallback(request);\n  }\n}\n\n// Cache First strategy\nasync function cacheFirst(request, cacheName) {\n  const cache = await caches.open(cacheName);\n  const cachedResponse = await cache.match(request);\n  \n  if (cachedResponse) {\n    return cachedResponse;\n  }\n  \n  const networkResponse = await fetch(request);\n  \n  if (networkResponse.ok) {\n    cache.put(request, networkResponse.clone());\n  }\n  \n  return networkResponse;\n}\n\n// Network First strategy\nasync function networkFirst(request, cacheName) {\n  const cache = await caches.open(cacheName);\n  \n  try {\n    const networkResponse = await fetch(request);\n    \n    if (networkResponse.ok) {\n      cache.put(request, networkResponse.clone());\n    }\n    \n    return networkResponse;\n  } catch (error) {\n    const cachedResponse = await cache.match(request);\n    \n    if (cachedResponse) {\n      return cachedResponse;\n    }\n    \n    throw error;\n  }\n}\n\n// Stale While Revalidate strategy\nasync function staleWhileRevalidate(request, cacheName) {\n  const cache = await caches.open(cacheName);\n  const cachedResponse = await cache.match(request);\n  \n  // Fetch in background to update cache\n  const fetchPromise = fetch(request).then((networkResponse) => {\n    if (networkResponse.ok) {\n      cache.put(request, networkResponse.clone());\n    }\n    return networkResponse;\n  }).catch(() => {\n    // Ignore network errors for background updates\n  });\n  \n  // Return cached version immediately if available\n  if (cachedResponse) {\n    return cachedResponse;\n  }\n  \n  // Wait for network if no cache available\n  return await fetchPromise;\n}\n\n// Network with cache fallback\nasync function networkWithCacheFallback(request) {\n  try {\n    const networkResponse = await fetch(request);\n    \n    if (networkResponse.ok) {\n      const cache = await caches.open(DYNAMIC_CACHE);\n      cache.put(request, networkResponse.clone());\n    }\n    \n    return networkResponse;\n  } catch (error) {\n    const cache = await caches.open(DYNAMIC_CACHE);\n    const cachedResponse = await cache.match(request);\n    \n    if (cachedResponse) {\n      return cachedResponse;\n    }\n    \n    throw error;\n  }\n}\n\n// Offline fallback handler\nasync function handleOfflineFallback(request) {\n  const url = new URL(request.url);\n  \n  // Return offline page for navigation requests\n  if (request.mode === 'navigate') {\n    const cache = await caches.open(STATIC_CACHE);\n    const offlinePage = await cache.match('/index.html');\n    \n    if (offlinePage) {\n      return offlinePage;\n    }\n  }\n  \n  // Return offline image for image requests\n  if (request.destination === 'image') {\n    return new Response(\n      '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\" viewBox=\"0 0 200 200\"><rect width=\"200\" height=\"200\" fill=\"#f3f4f6\"/><text x=\"100\" y=\"100\" text-anchor=\"middle\" dy=\".3em\" fill=\"#9ca3af\" font-family=\"sans-serif\" font-size=\"14\">Offline</text></svg>',\n      {\n        headers: {\n          'Content-Type': 'image/svg+xml',\n          'Cache-Control': 'no-cache'\n        }\n      }\n    );\n  }\n  \n  // Return generic offline response\n  return new Response(\n    JSON.stringify({\n      error: 'Offline',\n      message: 'This content is not available offline'\n    }),\n    {\n      status: 503,\n      statusText: 'Service Unavailable',\n      headers: {\n        'Content-Type': 'application/json',\n        'Cache-Control': 'no-cache'\n      }\n    }\n  );\n}\n\n// Background sync for offline actions\nself.addEventListener('sync', (event) => {\n  console.log('[SW] Background sync:', event.tag);\n  \n  if (event.tag === 'background-analysis') {\n    event.waitUntil(handleBackgroundAnalysis());\n  }\n});\n\n// Handle background analysis sync\nasync function handleBackgroundAnalysis() {\n  try {\n    // Get pending analysis requests from IndexedDB\n    const pendingRequests = await getPendingAnalysisRequests();\n    \n    for (const request of pendingRequests) {\n      try {\n        await fetch('/api/analysis', {\n          method: 'POST',\n          body: JSON.stringify(request.data),\n          headers: {\n            'Content-Type': 'application/json'\n          }\n        });\n        \n        // Remove from pending requests\n        await removePendingAnalysisRequest(request.id);\n      } catch (error) {\n        console.error('[SW] Background analysis failed:', error);\n      }\n    }\n  } catch (error) {\n    console.error('[SW] Background sync failed:', error);\n  }\n}\n\n// Push notification handler\nself.addEventListener('push', (event) => {\n  console.log('[SW] Push received');\n  \n  const options = {\n    body: 'Security analysis complete',\n    icon: '/favicon-192x192.svg',\n    badge: '/favicon-96x96.png',\n    vibrate: [100, 50, 100],\n    data: {\n      dateOfArrival: Date.now(),\n      primaryKey: 1\n    },\n    actions: [\n      {\n        action: 'view',\n        title: 'View Results',\n        icon: '/icons/view.png'\n      },\n      {\n        action: 'close',\n        title: 'Close',\n        icon: '/icons/close.png'\n      }\n    ]\n  };\n  \n  event.waitUntil(\n    self.registration.showNotification('Code Guardian', options)\n  );\n});\n\n// Notification click handler\nself.addEventListener('notificationclick', (event) => {\n  console.log('[SW] Notification clicked:', event.action);\n  \n  event.notification.close();\n  \n  if (event.action === 'view') {\n    event.waitUntil(\n      clients.openWindow('/?tab=results')\n    );\n  }\n});\n\n// Message handler for communication with main thread\nself.addEventListener('message', (event) => {\n  console.log('[SW] Message received:', event.data);\n  \n  if (event.data && event.data.type === 'SKIP_WAITING') {\n    self.skipWaiting();\n  }\n  \n  if (event.data && event.data.type === 'GET_VERSION') {\n    event.ports[0].postMessage({ version: '4.0.0' });\n  }\n});\n\n// Utility functions for IndexedDB operations\nasync function getPendingAnalysisRequests() {\n  // Implementation would use IndexedDB to store/retrieve pending requests\n  return [];\n}\n\nasync function removePendingAnalysisRequest(id) {\n  // Implementation would remove request from IndexedDB\n  console.log('[SW] Removing pending request:', id);\n}\n\n// Cache cleanup on quota exceeded\nself.addEventListener('quotaexceeded', () => {\n  console.log('[SW] Storage quota exceeded, cleaning up caches');\n  \n  caches.keys().then((cacheNames) => {\n    // Keep only the most recent caches\n    const cachesToDelete = cacheNames.filter(name => \n      !name.includes('v4.0.0')\n    );\n    \n    return Promise.all(\n      cachesToDelete.map(name => caches.delete(name))\n    );\n  });\n});\n\nconsole.log('[SW] Service Worker v4.0.0 loaded successfully');"}