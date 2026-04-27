"use client";

// components/ConnectionStatus.tsx
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectionStatusProps {
  className?: string;
}

type ConnectionState = "online" | "offline";

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className,
}) => {
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("online");
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionState("online");
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setConnectionState("offline");
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show status initially if offline
    if (!navigator.onLine) {
      setConnectionState("offline");
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  const getStatusConfig = () => {
    switch (connectionState) {
      case "online":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          secondIcon: <Wifi className="h-4 w-4 text-green-600" />,
          message: "Connection restored",
          className: "border-green-500 bg-green-50",
          textClassName: "text-green-800",
        };
      case "offline":
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-600" />,
          secondIcon: <WifiOff className="h-4 w-4 text-red-600" />,
          message: "Connection lost - working offline",
          className: "border-red-500 bg-red-50",
          textClassName: "text-red-800",
        };
      default:
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600" />,
          secondIcon: <Wifi className="h-4 w-4 text-green-600" />,
          message: "Connected",
          className: "border-green-500 bg-green-50",
          textClassName: "text-green-800",
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
