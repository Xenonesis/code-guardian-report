"use client";

import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { RefreshCw, X, Sparkles, ArrowRight } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";

export function PWAUpdateNotification() {
  const { isUpdateAvailable, updateApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  if (!isUpdateAvailable || dismissed) {
    return null;
  }

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateApp();
    } catch {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="fixed top-4 right-4 z-50 max-w-sm p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0 shadow-2xl animate-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
            Update Available
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/20">
              NEW
            </span>
          </h3>
          <p className="text-xs text-white/90 mb-3">
            A new version of Code Guardian is ready with improvements and bug
            fixes
          </p>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-white text-green-600 hover:bg-white/90"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Update Now
                  <ArrowRight className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-white hover:bg-white/20"
              disabled={isUpdating}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
