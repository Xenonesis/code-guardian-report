// src/components/FirestoreStatus.tsx
import React, { useState, useEffect } from 'react';
import { connectionManager } from '../lib/connection-manager';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

export const FirestoreStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = connectionManager.addListener((online) => {
      setIsOnline(online);
      setShowStatus(!online); // Only show when offline
      
      if (online) {
        // Hide status after 3 seconds when back online
        setTimeout(() => setShowStatus(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!showStatus) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg flex items-center gap-2 ${
      isOnline 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Connection restored</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Connection issues detected</span>
        </>
      )}
    </div>
  );
};