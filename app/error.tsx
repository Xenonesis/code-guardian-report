"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  RefreshCcw,
  Home,
  Bug,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error in development only
    if (process.env.NODE_ENV === "development") {
      console.error("Application Error:", {
        message: error.message,
        digest: error.digest,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }

    // In production, send to error monitoring service
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      // Send to analytics/monitoring
      try {
        fetch("/api/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: error.message,
            digest: error.digest,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Silently fail if logging fails
        });
      } catch {
        // Silently fail
      }
    }
  }, [error]);

  return (
    <div className="from-background via-background to-muted/30 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-lg">
        {/* Error Card */}
        <div className="bg-card/80 border-border/50 overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="border-border/30 border-b bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 shadow-lg">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-foreground text-xl font-bold">
                  Something Went Wrong
                </h1>
                <p className="text-muted-foreground text-sm">
                  An unexpected error occurred
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            <p className="text-muted-foreground leading-relaxed">
              We apologize for the inconvenience. Our team has been notified and
              is working to fix the issue. Please try again or return to the
              home page.
            </p>

            {/* Error Details (collapsible in production) */}
            {process.env.NODE_ENV === "development" && (
              <details className="group">
                <summary className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors">
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  Technical Details
                </summary>
                <div className="bg-muted/50 border-border/50 mt-3 max-h-48 overflow-auto rounded-lg border p-4">
                  <p className="font-mono text-xs break-all text-red-500 dark:text-red-400">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-muted-foreground mt-2 font-mono text-xs">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </details>
            )}

            {/* Error Digest for Support */}
            {error.digest && (
              <div className="bg-muted/30 border-border/30 flex items-center gap-2 rounded-lg border p-3">
                <Bug className="text-muted-foreground h-4 w-4 shrink-0" />
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    Error Reference:{" "}
                  </span>
                  <code className="text-foreground font-mono">
                    {error.digest}
                  </code>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={reset}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98]"
              >
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="bg-muted/50 text-foreground hover:bg-muted border-border/50 inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-5 py-3 font-medium transition-all active:scale-[0.98]"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/20 border-border/30 border-t p-4 text-center">
            <p className="text-muted-foreground text-xs">
              Need help?{" "}
              <Link
                href="/help"
                className="text-primary font-medium hover:underline"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-red-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-500/5 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
