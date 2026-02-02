import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import {
  Serwist,
  NetworkFirst,
  StaleWhileRevalidate,
  CacheFirst,
  ExpirationPlugin,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }: { request: Request }) =>
        request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    {
      matcher: ({ request }: { request: Request }) =>
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "font",
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    {
      matcher: ({ request }: { request: Request }) =>
        request.destination === "image",
      handler: new CacheFirst({
        cacheName: "image-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    {
      matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 5 * 60,
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    const cacheName = event.data.cacheName;
    if (cacheName) {
      caches.delete(cacheName);
    } else {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  }

  if (event.data && event.data.type === "PRELOAD_ROUTES") {
    const routes = event.data.routes as string[];
    routes.forEach((route) => {
      fetch(route).catch(() => {});
    });
  }
});

self.addEventListener("push", (event) => {
  if (event.data) {
    const payload = event.data.json();
    const title = payload.title || "Code Guardian";
    const options = {
      body: payload.body || "New notification",
      icon: payload.icon || "/favicon-192x192.svg",
      badge: payload.badge || "/favicon-192x192.svg",
      data: payload.data,
      actions: payload.actions,
      tag: payload.tag || "code-guardian-notification",
      requireInteraction: payload.requireInteraction || false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === "view" || !action) {
    const urlToOpen = data?.url || "/";
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then(async (clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            await client.focus();
            return;
          }
        }

        if (self.clients.openWindow) {
          await self.clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-uploads") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "PROCESS_UPLOAD_QUEUE" });
        });
      })
    );
  }

  if (event.tag === "sync-offline-data") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_OFFLINE_DATA" });
        });
      })
    );
  }

  if (event.tag === "sync-analytics") {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_ANALYTICS" });
        });
      })
    );
  }
});
