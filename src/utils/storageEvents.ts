/**
 * Custom storage event utilities for same-tab localStorage changes
 */
export const AI_API_KEYS_CHANGED_EVENT = "aiApiKeysChanged";

/**
 * Dispatch a custom event when API keys are changed in the same tab
 */
export function dispatchApiKeysChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AI_API_KEYS_CHANGED_EVENT));
}

/**
 * Enhanced localStorage setItem that dispatches custom events
 */
export function setLocalStorageItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);

  if (key === "aiApiKeys") {
    dispatchApiKeysChanged();
  }
}

/**
 * Enhanced localStorage removeItem that dispatches custom events
 */
export function removeLocalStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);

  if (key === "aiApiKeys") {
    dispatchApiKeysChanged();
  }
}

/**
 * Create a comprehensive storage change listener that handles both
 * cross-tab storage events and same-tab custom events
 */
export function createStorageChangeListener(
  key: string,
  callback: (newValue: string | null) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {}; // No-op cleanup for SSR
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key) {
      callback(event.newValue);
    }
  };

  const handleCustomEvent = () => {
    const newValue = localStorage.getItem(key);
    callback(newValue);
  };

  window.addEventListener("storage", handleStorageChange);

  if (key === "aiApiKeys") {
    window.addEventListener(AI_API_KEYS_CHANGED_EVENT, handleCustomEvent);
  }

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    if (key === "aiApiKeys") {
      window.removeEventListener(AI_API_KEYS_CHANGED_EVENT, handleCustomEvent);
    }
  };
}

/**
 * Hook-like function for React components to listen to storage changes
 */
export function useStorageListener(
  key: string,
  callback: (newValue: string | null) => void
): void {
  if (typeof window === "undefined") return;

  const cleanup = createStorageChangeListener(key, callback);

  return cleanup();
}
