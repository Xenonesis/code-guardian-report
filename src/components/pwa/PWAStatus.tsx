// PWA Status Component
// Production-ready component for PWA feature integration

import React from 'react';
import { usePWA } from '../../hooks/usePWA';

export function PWAStatus() {
  const { status, promptInstall, enableNotifications } = usePWA();

  return (
    <div className="pwa-status">
      {/* Install prompt */}
      {status.installPromptAvailable && !status.isInstalled && (
        <button 
          onClick={promptInstall}
          className="install-button"
          aria-label="Install app"
        >
          Install App
        </button>
      )}

      {/* Notification permission */}
      {!status.hasNotificationPermission && (
        <button 
          onClick={enableNotifications}
          className="notification-button"
          aria-label="Enable notifications"
        >
          Enable Notifications
        </button>
      )}

      {/* Offline indicator */}
      {!status.isOnline && (
        <div className="offline-indicator" role="status" aria-live="polite">
          Offline - Changes will sync when connection is restored
        </div>
      )}
    </div>
  );
}