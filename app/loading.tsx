"use client";

import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <div className="relative">
          {/* Outer ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-primary/20 animate-ping" />
          
          {/* Spinning ring */}
          <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-primary border-r-primary/50 animate-spin" />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            Loading Code Guardian
          </h2>
          <p className="text-sm text-muted-foreground animate-pulse">
            Initializing security analysis engine...
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full loading-bar-animation" />
        </div>
      </div>

      {/* CSS for loading animation */}
      <style dangerouslySetInnerHTML={{
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
        `
      }} />
    </div>
  );
}
