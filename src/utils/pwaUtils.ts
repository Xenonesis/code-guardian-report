// PWA Utility Functions

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const isPWAInstalled = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as any).standalone === true
  );
};

export const isPWASupported = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined")
    return false;
  return "serviceWorker" in navigator && "PushManager" in window;
};

export const canInstallPWA = (): boolean => {
  if (typeof window === "undefined") return false;
  return !isPWAInstalled() && isPWASupported();
};

export const getInstallationInstructions = (): string => {
  if (typeof navigator === "undefined") return "";
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
    return "Click the install button in the address bar or use the menu → Install Code Guardian";
  } else if (userAgent.includes("firefox")) {
    return "Click the home icon in the address bar to add to home screen";
  } else if (userAgent.includes("safari")) {
    return 'Tap the share button and select "Add to Home Screen"';
  } else if (userAgent.includes("edg")) {
    return "Click the install button in the address bar or use Settings → Apps → Install this site as an app";
  }

  return 'Look for an install or "Add to Home Screen" option in your browser menu';
};

export const registerForPushNotifications = async (): Promise<
  string | null
> => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new Error("Push notifications not supported in this environment");
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications not supported");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  const registration = await navigator.serviceWorker.ready;
  const appServerKey = urlBase64ToUint8Array("your-vapid-public-key-here");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: appServerKey,
  });

  return JSON.stringify(subscription);
};

function urlBase64ToUint8Array(base64String: string): BufferSource {
  if (typeof window === "undefined") {
    return new ArrayBuffer(0);
  }
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export const scheduleBackgroundSync = async (tag: string): Promise<void> => {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  const SWReg = (window as unknown as Record<string, unknown>).ServiceWorkerRegistration as { prototype?: object } | undefined;
  if (
    "serviceWorker" in navigator &&
    SWReg?.prototype &&
    "sync" in SWReg.prototype
  ) {
    const registration = await navigator.serviceWorker.ready;
    await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
  }
};

export const getCacheSize = async (): Promise<number> => {
  if (typeof window === "undefined" || !("caches" in window)) return 0;

  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
};

export const clearAppCache = async (): Promise<void> => {
  if (typeof window === "undefined" || !("caches" in window)) return;

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
