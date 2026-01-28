"use client";

import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="from-background via-background to-muted/30 flex min-h-screen items-center justify-center bg-gradient-to-br">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          {/* Outer ring */}
          <div className="border-primary/20 absolute inset-0 h-20 w-20 animate-ping rounded-full border-2" />

          {/* Spinning ring */}
          <div className="border-t-primary border-r-primary/50 h-20 w-20 animate-spin rounded-full border-2 border-transparent" />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2 text-center">
          <h2 className="text-foreground text-lg font-semibold">
            Loading Code Guardian
          </h2>
          <p className="text-muted-foreground animate-pulse text-sm">
            Initializing security analysis engine...
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-muted h-1 w-48 overflow-hidden rounded-full">
          <div className="loading-bar-animation h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        </div>
      </div>

      {/* CSS for loading animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .loading-bar-animation {
            animation: loading-bar 1.5s ease-in-out infinite;
          }
          @keyframes loading-bar {
            0% {
              width: 0%;
              margin-left: 0%;
            }
            50% {
              width: 60%;
              margin-left: 20%;
            }
            100% {
              width: 0%;
              margin-left: 100%;
            }
          }
        `,
        }}
      />
    </div>
  );
}
