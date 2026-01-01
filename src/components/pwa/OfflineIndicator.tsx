"use client";

import React from "react";
import { Card } from "../ui/card";
import { WifiOff, Wifi } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOffline, setShowOffline] = React.useState(false);
  const [showOnline, setShowOnline] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setShowOnline(false);
    } else {
      setShowOffline(false);
      if (showOffline) {
        setShowOnline(true);
        setTimeout(() => setShowOnline(false), 3000);
      }
    }
  }, [isOnline, showOffline]);

  if (!showOffline && !showOnline) {
    return null;
  }

  return (
    <Card
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 border-0 shadow-lg animate-in slide-in-from-top-2 ${
        showOffline
          ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {showOffline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">You're offline</span>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Back online</span>
          </>
        )}
      </div>
    </Card>
  );
}
