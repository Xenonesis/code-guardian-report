"use client";

import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || isInstalled || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (!success) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl animate-in slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="p-2 bg-white/20 rounded-lg">
            <Download className="h-5 w-5" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Install Code Guardian</h3>
          <p className="text-xs text-white/90 mb-3">
            Get faster access and work offline with our app
          </p>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1 text-xs">
              <Smartphone className="h-3 w-3" />
              <span>Mobile</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Monitor className="h-3 w-3" />
              <span>Desktop</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleInstall}
              className="flex-1 bg-white text-blue-600 hover:bg-white/90"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
