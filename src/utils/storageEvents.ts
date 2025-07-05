/**
 * Custom storage event utilities for same-tab localStorage changes
 */

// Custom event for API key changes
export const AI_API_KEYS_CHANGED_EVENT = 'aiApiKeysChanged';

/**
 * Dispatch a custom event when API keys are changed in the same tab
 */
export function dispatchApiKeysChanged(): void {
  window.dispatchEvent(new CustomEvent(AI_API_KEYS_CHANGED_EVENT));
}

/**
 * Enhanced localStorage setItem that dispatches custom events
 */
export function setLocalStorageItem(key: string, value: string): void {
  localStorage.setItem(key, value);
  
  // Dispatch custom event for same-tab changes
  if (key === 'aiApiKeys') {
    dispatchApiKeysChanged();
  }
}

/**
 * Enhanced localStorage removeItem that dispatches custom events
 */
export function removeLocalStorageItem(key: string): void {
  localStorage.removeItem(key);
  
  // Dispatch custom event for same-tab changes
  if (key === 'aiApiKeys') {
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
  // Handle cross-tab storage changes
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === key) {
      callback(event.newValue);
    }
  };

  // Handle same-tab custom events
  const handleCustomEvent = () => {
    const newValue = localStorage.getItem(key);
    callback(newValue);
  };

  // Add listeners
  window.addEventListener('storage', handleStorageChange);
  
  if (key === 'aiApiKeys') {
    window.addEventListener(AI_API_KEYS_CHANGED_EVENT, handleCustomEvent);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    if (key === 'aiApiKeys') {
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
  // This would be used in a useEffect hook in React components
  const cleanup = createStorageChangeListener(key, callback);
  
  // Return cleanup function (to be called in useEffect cleanup)
  return cleanup;
}
