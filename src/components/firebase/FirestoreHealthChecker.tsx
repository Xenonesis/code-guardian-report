"use client";

// src/components/FirestoreHealthChecker.tsx
import React, { useState, useEffect } from "react";
import { connectionManager } from "../../lib/connection-manager";

interface HealthStatus {
  isOnline: boolean;
  firestoreConnected: boolean;
  lastCheck: Date;
}

export const FirestoreHealthChecker: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    isOnline: true,
    firestoreConnected: true,
    lastCheck: new Date(),
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Listen to connection manager updates
    const unsubscribeConnection = connectionManager.addListener((isOnline) => {
      setHealthStatus((prev) => ({
        ...prev,
        isOnline,
        lastCheck: new Date(),
      }));
    });

    // Initial status check
    setHealthStatus({
      isOnline: connectionManager.isOnline(),
      firestoreConnected: true, // Assume connected initially
      lastCheck: new Date(),
    });

    return () => {
      unsubscribeConnection();
    };
  }, []);

  const getStatusColor = () => {
    if (!healthStatus.isOnline) return "text-red-500";
    if (!healthStatus.firestoreConnected) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusIcon = () => {
    if (!healthStatus.isOnline) return "🔴";
    if (!healthStatus.firestoreConnected) return "🟡";
    return "🟢";
  };

  const getStatusText = () => {
    if (!healthStatus.isOnline) return "Offline";
    if (!healthStatus.firestoreConnected) return "Connecting...";
    return "Connected";
  };

  const handleTestConnection = async () => {
    setShowDetails(true);
    // Connection test functionality removed with debug code
  };

  const handleResetConnection = async () => {
    setShowDetails(true);
    // Connection reset functionality removed with debug code
  };

  // Only show if there are connection issues
  const shouldShow = !healthStatus.isOnline || !healthStatus.firestoreConnected;

  if (!shouldShow) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div className="min-w-[200px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showDetails ? "▼" : "▶"}
          </button>
        </div>

        {showDetails && (
          <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Network:</span>
                <span
                  className={
                    healthStatus.isOnline ? "text-green-600" : "text-red-600"
                  }
                >
                  {healthStatus.isOnline ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Firestore:</span>
                <span
                  className={
                    healthStatus.firestoreConnected
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {healthStatus.firestoreConnected
                    ? "Connected"
                    : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Check:</span>
                <span>{healthStatus.lastCheck.toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleTestConnection}
                className="flex-1 rounded bg-blue-500 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-600"
              >
                Test
              </button>
              <button
                onClick={handleResetConnection}
                className="flex-1 rounded bg-orange-500 px-2 py-1 text-xs text-white transition-colors hover:bg-orange-600"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
