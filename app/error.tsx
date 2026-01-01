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
    // Log error to monitoring service in production
    console.error("Application Error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send this to an error monitoring service
    // Example: Sentry, LogRocket, Datadog, etc.
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="max-w-lg w-full">
        {/* Error Card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 p-6 border-b border-border/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Something Went Wrong
                </h1>
                <p className="text-sm text-muted-foreground">
                  An unexpected error occurred
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              We apologize for the inconvenience. Our team has been notified and
              is working to fix the issue. Please try again or return to the
              home page.
            </p>

            {/* Error Details (collapsible in production) */}
            {process.env.NODE_ENV === "development" && (
              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  Technical Details
                </summary>
                <div className="mt-3 p-4 rounded-lg bg-muted/50 border border-border/50 overflow-auto max-h-48">
                  <p className="text-xs font-mono text-red-500 dark:text-red-400 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs font-mono text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </details>
            )}

            {/* Error Digest for Support */}
            {error.digest && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                <Bug className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="text-xs">
                  <span className="text-muted-foreground">
                    Error Reference:{" "}
                  </span>
                  <code className="font-mono text-foreground">
                    {error.digest}
                  </code>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={reset}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-muted/50 text-foreground font-medium hover:bg-muted transition-all border border-border/50 active:scale-[0.98]"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-muted/20 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link
                href="/help"
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}
