"use client";

import React from "react";
import { Button } from "../ui/button";
import {
  Download,
  X,
  Smartphone,
  Zap,
  Shield,
  WifiOff,
  Bell,
} from "lucide-react";
import { usePWA } from "../../hooks/usePWA";
import { cn } from "@/lib/utils";

export function PWAMobileBanner() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  // Check if on mobile and show banner after a delay
  React.useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasBeenDismissed = localStorage.getItem("pwa-banner-dismissed");

    if (isMobile && isInstallable && !isInstalled && !hasBeenDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isInstallable, isInstalled]);

  if (!isVisible || dismissed || isInstalled || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  const features = [
    { icon: Zap, text: "Faster Loading" },
    { icon: WifiOff, text: "Works Offline" },
    { icon: Bell, text: "Push Notifications" },
  ];

  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 z-50",
        "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600",
        "text-white shadow-2xl",
        "transform transition-transform duration-500 ease-out",
        "safe-bottom", // For iOS safe area
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Decorative top border */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-blue-400" />

      <div className="relative px-4 py-4 sm:px-6">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 rounded-full p-1.5 transition-colors hover:bg-white/20"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* App Icon and Info */}
          <div className="flex flex-1 items-center gap-3">
            <div className="relative">
              <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -right-1 -bottom-1 rounded-full bg-green-500 p-1">
                <Smartphone className="h-3 w-3" />
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-base leading-tight font-bold sm:text-lg">
                Install Code Guardian
              </h3>
              <p className="mt-0.5 text-xs text-white/80 sm:text-sm">
                Add to home screen for the best experience
              </p>
            </div>
          </div>

          {/* Features - Hidden on very small screens */}
          <div className="hidden items-center gap-4 px-4 sm:flex">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 text-xs text-white/90"
              >
                <feature.icon className="h-3.5 w-3.5" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Install Button */}
          <Button
            onClick={handleInstall}
            className="w-full bg-white font-semibold text-blue-600 shadow-lg hover:bg-white/90 sm:w-auto"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Install App
          </Button>
        </div>

        {/* Features for mobile - Shown only on small screens */}
        <div className="mt-3 flex items-center justify-center gap-4 border-t border-white/20 pt-3 sm:hidden">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-xs text-white/80"
            >
              <feature.icon className="h-3 w-3" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PWAMobileBanner;
