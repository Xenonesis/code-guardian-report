/**
 * Global type declarations for extended browser APIs and window properties
 */

import type { ToastType } from "@/utils/toastNotifications";

// Toast notification function type - matches showToast signature
type ShowToastFunction = (
  type: ToastType,
  title: string,
  description?: string,
  duration?: number
) => void;

// Toast notifications service interface
interface ToastNotificationsService {
  offline: () => void;
  online: () => void;
  firebaseError: () => void;
  mockDataWarning: () => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  services?: {
    analysisComplete: () => void;
    analysisFailed: (error?: string) => void;
    connectionRestored: () => void;
    connectionLost: () => void;
  };
}

// Extend the Window interface
declare global {
  interface Window {
    // Toast notification extensions
    showToast?: ShowToastFunction;
    toastNotifications?: ToastNotificationsService;

    // Firebase test utilities (development only)
    testFirebaseIntegration?: () => Promise<void>;
    testFirebaseConnection?: () => Promise<boolean>;

    // PWA standalone mode detection (iOS Safari)
    navigator: Navigator & {
      standalone?: boolean;
    };
  }

  // Extend Navigator for userAgentData API
  interface Navigator {
    userAgentData?: {
      platform: string;
      mobile: boolean;
      brands: Array<{ brand: string; version: string }>;
    };
  }

  // Extend NavigatorID for standalone property (iOS Safari)
  interface NavigatorID {
    standalone?: boolean;
  }
}

export {};
