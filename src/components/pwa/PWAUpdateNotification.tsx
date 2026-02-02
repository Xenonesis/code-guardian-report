"use client";

import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { RefreshCw, X, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { usePWA } from "../../hooks/usePWA";

export function PWAUpdateNotification() {
  const { isUpdateAvailable, updateApp, metrics } = usePWA();
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
    <Card
      role="status"
      aria-live="polite"
      className="animate-in zoom-in-95 fixed bottom-6 left-1/2 z-50 mx-4 w-full max-w-md -translate-x-1/2 border-0 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 p-4 text-white shadow-2xl duration-300 sm:right-8 sm:bottom-8 sm:left-auto sm:mx-0 sm:translate-x-0"
    >
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" />
      <div className="relative space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="rounded-2xl bg-white/15 p-2.5 ring-1 ring-white/25 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                Update Available
                <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                  New
                </span>
              </h3>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
                className="text-white/80 hover:bg-white/15 hover:text-white"
                disabled={isUpdating}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-1 text-xs text-white/90">
              A fresh build of Code Guardian is ready with smoother performance,
              upgraded security rules, and refined visuals.
            </p>

            <div className="mt-3 space-y-2 text-xs text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white/80" />
                Faster analysis loads and smarter caching
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white/80" />
                Updated detection rules for new threats
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white/80" />
                Cleaner dashboards and motion polish
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-white/85">
              <span className="rounded-full bg-white/15 px-2.5 py-1 ring-1 ring-white/20">
                Cached assets: {metrics.cacheSizeFormatted}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 ring-1 ring-white/20">
                Pending syncs: {metrics.pendingSyncs}
              </span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 ring-1 ring-white/20">
                Offline records: {metrics.offlineDataCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-white text-emerald-700 hover:bg-white/90"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Update Now
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="text-white/90 hover:bg-white/15 hover:text-white"
            disabled={isUpdating}
          >
            Remind Me Later
          </Button>
        </div>
      </div>
    </Card>
  );
}
