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
    <Card className="animate-in zoom-in-95 fixed top-1/2 left-1/2 z-50 mx-4 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 border-0 bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white shadow-2xl duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
            Update Available
            <span className="inline-flex items-center rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-medium">
              NEW
            </span>
          </h3>
          <p className="mb-3 text-xs text-white/90">
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
                  <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-4 w-4" />
                  Update Now
                  <ArrowRight className="ml-1 h-3 w-3" />
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
