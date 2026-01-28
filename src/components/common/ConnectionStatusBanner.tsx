"use client";

import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConnectionStatusBannerProps {
  show?: boolean;
  message?: string;
  type?: "offline" | "firebase-error" | "mock-data";
  onDismiss?: () => void;
}

export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  show = false,
  message,
  type = "offline",
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const config = {
    offline: {
      icon: WifiOff,
      className:
        "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
      iconClassName: "text-orange-600 dark:text-orange-400",
      textClassName: "text-orange-800 dark:text-orange-200",
      defaultMessage:
        "You are currently offline. Some features may be limited.",
    },
    "firebase-error": {
      icon: AlertTriangle,
      className:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      iconClassName: "text-red-600 dark:text-red-400",
      textClassName: "text-red-800 dark:text-red-200",
      defaultMessage:
        "Unable to connect to Firebase. Using local storage only.",
    },
    "mock-data": {
      icon: AlertTriangle,
      className:
        "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      iconClassName: "text-yellow-600 dark:text-yellow-400",
      textClassName: "text-yellow-800 dark:text-yellow-200",
      defaultMessage: "Displaying sample data. Connect to see your real data.",
    },
  };

  const {
    icon: Icon,
    className,
    iconClassName,
    textClassName,
    defaultMessage,
  } = config[type];

  return (
    <div className="animate-in slide-in-from-top fixed top-0 right-0 left-0 z-50 duration-300">
      <Alert className={`rounded-none border-x-0 border-t-0 ${className}`}>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${iconClassName}`} />
            <AlertDescription className={textClassName}>
              {message || defaultMessage}
            </AlertDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};

// Hook to manage connection status
export const useConnectionStatus = () => {
  const [status, setStatus] = useState<{
    online: boolean;
    firebaseConnected: boolean;
    usingMockData: boolean;
  }>({
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
    firebaseConnected: true,
    usingMockData: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setStatus((prev) => ({ ...prev, online: true }));
    const handleOffline = () =>
      setStatus((prev) => ({ ...prev, online: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setFirebaseStatus = (connected: boolean) => {
    setStatus((prev) => ({ ...prev, firebaseConnected: connected }));
  };

  const setMockDataStatus = (usingMock: boolean) => {
    setStatus((prev) => ({ ...prev, usingMockData: usingMock }));
  };

  return {
    ...status,
    setFirebaseStatus,
    setMockDataStatus,
  };
};
