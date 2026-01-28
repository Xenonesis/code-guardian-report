"use client";

// src/components/FirestoreStatus.tsx
import React, { useState, useEffect } from "react";
import { connectionManager } from "../../lib/connection-manager";
import { Wifi, WifiOff } from "lucide-react";

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
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-3 shadow-lg ${
        isOnline
          ? "border border-green-200 bg-green-100 text-green-800"
          : "border border-red-200 bg-red-100 text-red-800"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Connection restored</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            Connection issues detected
          </span>
        </>
      )}
    </div>
  );
};
