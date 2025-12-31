"use client";

// components/ConnectionStatus.tsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Database, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/utils/logger';

interface ConnectionStatusProps {
  className?: string;
}

type ConnectionState = 'online' | 'offline' | 'firebase-error';

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className }) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>('online');
  const [showStatus, setShowStatus] = useState(false);
  const [firebaseConnected, setFirebaseConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionState('online');
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
      
      // Re-enable Firebase network
      enableNetwork(db).catch((err) => logger.warn('Failed to re-enable Firebase network', err));
    };

    const handleOffline = () => {
      setConnectionState('offline');
      setShowStatus(true);
      
      // Disable Firebase network to prevent connection attempts
      disableNetwork(db).catch((err) => logger.warn('Failed to disable Firebase network', err));
    };

    // Monitor Firebase connection errors
    const monitorFirebaseErrors = () => {
      // Note: In production, Firebase errors are handled by the logger
      // This is a lightweight monitor for connection state only
      const checkFirebaseHealth = setInterval(() => {
        // Firebase health is monitored via connection-manager
      }, 10000);
      
      return () => {
        clearInterval(checkFirebaseHealth);
      };
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const cleanupFirebaseMonitor = monitorFirebaseErrors();

    // Show status initially if offline
    if (!navigator.onLine) {
      setConnectionState('offline');
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanupFirebaseMonitor();
    };
  }, []);

  if (!showStatus) return null;

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'online':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          secondIcon: <Wifi className="h-4 w-4 text-green-600" />,
          message: 'Connection restored',
          className: 'border-green-500 bg-green-50',
          textClassName: 'text-green-800'
        };
      case 'offline':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          secondIcon: <WifiOff className="h-4 w-4 text-red-600" />,
          message: 'Connection lost - working offline',
          className: 'border-red-500 bg-red-50',
          textClassName: 'text-red-800'
        };
      case 'firebase-error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
          secondIcon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
          message: 'Database connection issues - retrying...',
          className: 'border-yellow-500 bg-yellow-50',
          textClassName: 'text-yellow-800'
        };
      default:
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          secondIcon: <Database className="h-4 w-4 text-green-600" />,
          message: 'Connected',
          className: 'border-green-500 bg-green-50',
          textClassName: 'text-green-800'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <Alert className={`${config.className} transition-all duration-300`}>
        <div className="flex items-center gap-2">
          {config.icon}
          {config.secondIcon}
          <AlertDescription className={config.textClassName}>
            {config.message}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};