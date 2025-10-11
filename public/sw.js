// Code Guardian Enterprise - Enhanced Service Worker
// Version: 7.3.0
// Professional PWA Service Worker with advanced caching strategies and enhanced features

const CACHE_NAME = 'code-guardian-v7.3.0';
const STATIC_CACHE = 'code-guardian-static-v7.3.0';
const DYNAMIC_CACHE = 'code-guardian-dynamic-v7.3.0';
const API_CACHE = 'code-guardian-api-v7.3.0';
const UPLOAD_CACHE = 'code-guardian-uploads-v7.3.0';

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
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
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

// Push notification event
self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    event.waitUntil(handleEnhancedPush(payload));
  } else {
    event.waitUntil(handleEnhancedPush({
      title: 'Code Guardian',
      body: 'New notification received'
    }));
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  } else if (event.action === 'update') {
    event.waitUntil(
      clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'UPDATE_APP' });
        });
      })
    );
  }
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Analytics data collection
let analyticsData = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  offlineRequests: 0,
  backgroundSyncs: 0,
  pushNotifications: 0,
  installEvents: 0,
  updateEvents: 0
};

// Main request handler with caching strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Determine caching strategy
    let strategy = 'NetworkFirst';
    let cacheName = DYNAMIC_CACHE;
    let maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Static assets - Cache First
    if (CACHE_STRATEGIES.static.pattern.test(url.pathname)) {
      strategy = 'CacheFirst';
      cacheName = STATIC_CACHE;
      maxAge = CACHE_STRATEGIES.static.maxAge;
    }
    // API calls - Network First
    else if (CACHE_STRATEGIES.api.pattern.test(url.pathname)) {
      strategy = 'NetworkFirst';
      cacheName = API_CACHE;
      maxAge = CACHE_STRATEGIES.api.maxAge;
    }
    // External resources - Stale While Revalidate
    else if (CACHE_STRATEGIES.external.pattern.test(url.href)) {
      strategy = 'StaleWhileRevalidate';
      cacheName = DYNAMIC_CACHE;
      maxAge = CACHE_STRATEGIES.external.maxAge;
    }
    
    return await executeStrategy(request, strategy, cacheName, maxAge);
  } catch (_cacheError) {
    globalThis.console?.debug?.('Falling back to offline handler due to fetch failure', _cacheError);
    return await handleOfflineRequest(request);
  }
}

function isCacheableResponse(request, response) {
  if (!response) return false;
  if (request.method !== 'GET') return false;
  if (!response.ok) return false;
  return response.type === 'basic' || response.type === 'cors';
}

async function safeCachePut(cache, request, response) {
  if (!isCacheableResponse(request, response)) return;
  try {
    await cache.put(request, response.clone());
  } catch (error) {
    globalThis.console?.warn?.('Cache.put skipped', error);
  }
}

// Execute caching strategy
async function executeStrategy(request, strategy, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  
  switch (strategy) {
    case 'CacheFirst':
      return await cacheFirst(request, cache, maxAge);
    case 'NetworkFirst':
      return await networkFirst(request, cache, maxAge);
    case 'StaleWhileRevalidate':
      return await staleWhileRevalidate(request, cache, maxAge);
    default:
      return await networkFirst(request, cache, maxAge);
  }
}

// Cache First strategy
async function cacheFirst(request, cache, maxAge) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    analyticsData.cacheHits++;
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    analyticsData.networkRequests++;
    
    await safeCachePut(cache, request, networkResponse);
    
    return networkResponse;
  } catch (_networkError) {
    analyticsData.offlineRequests++;
    if (cachedResponse) {
      return cachedResponse;
    }
    throw _networkError;
  }
}

// Network First strategy
async function networkFirst(request, cache, _maxAge) {
  try {
    const networkResponse = await fetch(request);
    analyticsData.networkRequests++;
    
    await safeCachePut(cache, request, networkResponse);

    return networkResponse;
  } catch (_networkErr) {
    analyticsData.offlineRequests++;
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      analyticsData.cacheHits++;
      return cachedResponse;
    }
    
    analyticsData.cacheMisses++;
    globalThis.console?.debug?.('Network-first strategy falling back to offline', _networkErr);
    return await handleOfflineRequest(request);
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request, cache, _maxAge) {
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    analyticsData.networkRequests++;
    return safeCachePut(cache, request, networkResponse).then(() => networkResponse);
  }).catch(() => {
    analyticsData.offlineRequests++;
    return null;
  });
  
  if (cachedResponse) {
    analyticsData.cacheHits++;
    return cachedResponse;
  }
  
  analyticsData.cacheMisses++;
  const networkResult = await fetchPromise;
  if (networkResult) {
    return networkResult;
  }
  return await handleOfflineRequest(request);
}

// Handle offline requests
async function handleOfflineRequest(request) {
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    return await cache.match('/') || new Response('Offline', { status: 503 });
  }
  
  // Return placeholder for images
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Offline', { status: 503 });
}

// Check if cached response is expired
function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const date = new Date(dateHeader);
  return Date.now() - date.getTime() > maxAge;
}

// Handle background sync
async function handleBackgroundSync(tag) {
  analyticsData.backgroundSyncs++;
  // Notify main thread about background sync
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'BACKGROUND_SYNC', tag });
  });
}

// Enhanced background sync handlers
async function handleFileUploadSync() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'PROCESS_UPLOAD_QUEUE' });
    });
  } catch (_syncError) {
    globalThis.console?.debug?.('Background file upload sync failed', _syncError);
  }
}

async function handleOfflineSync() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_OFFLINE_DATA' });
    });
  } catch (_syncError) {
    globalThis.console?.debug?.('Offline sync failed', _syncError);
  }
}

async function handleAnalyticsSync() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_ANALYTICS' });
    });
  } catch (_syncError) {
    globalThis.console?.debug?.('Analytics sync failed', _syncError);
  }
}

// Enhanced background sync event handler
self.addEventListener('sync', (event) => {
  switch (event.tag) {
    case 'file-upload':
      event.waitUntil(handleFileUploadSync());
      break;
    case 'offline-sync':
      event.waitUntil(handleOfflineSync());
      break;
    case 'analytics-data':
      event.waitUntil(handleAnalyticsSync());
      break;
    default:
      if (event.tag.startsWith('background-sync-')) {
        event.waitUntil(handleBackgroundSync(event.tag));
      }
  }
});

// Enhanced push notification with rich features
async function handleEnhancedPush(payload) {
  analyticsData.pushNotifications++;
  
  const defaultOptions = {
    body: payload.body || 'Code Guardian notification',
    icon: payload.icon || '/favicon-192x192.svg',
    badge: payload.badge || '/favicon-192x192.svg',
    image: payload.image,
    data: payload.data || {},
    tag: payload.tag || 'code-guardian',
    requireInteraction: payload.requireInteraction || false,
    vibrate: payload.vibrate || [200, 100, 200],
    timestamp: Date.now(),
    actions: payload.actions || [
      { action: 'view', title: 'View', icon: '/favicon-192x192.svg' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  // Add custom data for analytics
  defaultOptions.data.timestamp = Date.now();
  defaultOptions.data.source = 'service-worker';
  
  await self.registration.showNotification(payload.title || 'Code Guardian', defaultOptions);
  
  // Track notification in analytics
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ 
      type: 'PUSH_NOTIFICATION_RECEIVED',
      payload: payload
    });
  });
}

// Enhanced message handling
self.addEventListener('message', (event) => {
  const { data } = event;
  
  if (!data) return;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_ANALYTICS':
      event.ports[0].postMessage(getAnalyticsData());
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: '7.3.0' });
      break;
      
    case 'CLEAR_CACHE':
      clearSpecificCache(data.cacheName);
      break;
      
    case 'PRELOAD_ROUTES':
      preloadRoutes(data.routes);
      break;
      
    default:
      // Unknown message type - silently ignore
  }
});

// Cache management utilities
async function clearSpecificCache(cacheName) {
  try {
    await caches.delete(cacheName);
  } catch (error) {
    globalThis.console?.debug?.('Failed to clear cache', cacheName, error);
  }
}

async function preloadRoutes(routes) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(routes);
  } catch (error) {
    globalThis.console?.debug?.('Failed to preload routes', routes, error);
  }
}

// Enhanced quota management
self.addEventListener('quotaexceeded', async () => {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => !name.includes('v7.3.0'));
    
    await Promise.all(oldCaches.map(name => caches.delete(name)));
    
    // Clear old entries from remaining caches
    for (const cacheName of [DYNAMIC_CACHE, API_CACHE]) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      // Keep only the 50 most recent entries
      if (requests.length > 50) {
        const toDelete = requests.slice(0, requests.length - 50);
        await Promise.all(toDelete.map(request => cache.delete(request)));
      }
    }
  } catch (error) {
    globalThis.console?.debug?.('Quota exceeded handling failed', error);
  }
});

// Get analytics data
function getAnalyticsData() {
  return {
    ...analyticsData,
    timestamp: Date.now(),
    cacheNames: [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, UPLOAD_CACHE],
    version: '7.3.0'
  };
}

// Enhanced Service Worker v7.3.0 loaded successfully"}