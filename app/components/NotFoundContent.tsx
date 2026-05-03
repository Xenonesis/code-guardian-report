"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft, Terminal } from "lucide-react";

export default function NotFoundContent() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              hsl(var(--foreground)) 2px,
              hsl(var(--foreground)) 4px
            )`,
          }}
        />
      </div>

      {/* Hex dump background pattern */}
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 overflow-hidden font-mono text-[10px] leading-none opacity-[0.02] select-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap">
            {Array.from({ length: 32 }).map((_, j) => (
              <span key={j}>
                {Math.floor(Math.random() * 16)
                  .toString(16)
                  .toUpperCase()}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Terminal Error Card */}
        <div className="border-border bg-card relative overflow-hidden rounded-lg border-2 shadow-2xl">
          {/* Header bar */}
          <div className="border-border bg-muted/50 border-b px-6 py-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <Terminal className="text-primary h-4 w-4" />
              <span className="text-muted-foreground">ERROR_TERMINAL</span>
              <span className="text-primary/60 ml-auto animate-pulse">●</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* 404 Display */}
            <div className="mb-8 text-center">
              <div className="text-primary font-mono text-9xl font-bold tracking-tighter opacity-20">
                404
              </div>
              <div className="-mt-12 font-mono text-6xl font-bold tracking-tight uppercase">
                NOT_FOUND
              </div>
            </div>

            {/* Error Details */}
            <div className="border-primary/30 mb-8 space-y-2 border-l-2 pl-4 font-mono text-sm">
              <p className="text-muted-foreground">{`> REQUESTED_RESOURCE: NULL`}</p>
              <p className="text-muted-foreground">{`> STATUS: MISSING`}</p>
              <p className="text-muted-foreground">{`> ACTION_REQUIRED: REDIRECT`}</p>
              <p className="text-primary animate-pulse">{`> _`}</p>
            </div>

            {/* Action Buttons - Terminal Style */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="group border-border hover:border-primary bg-background hover:bg-primary/5 relative flex items-center justify-center gap-2 border-2 px-6 py-3 font-mono text-sm transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                <span>RETURN_HOME</span>
                <ArrowLeft className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <button
                onClick={() =>
                  typeof window !== "undefined" && window.history.back()
                }
                className="group border-border hover:border-primary bg-background hover:bg-primary/5 relative flex items-center justify-center gap-2 border-2 px-6 py-3 font-mono text-sm transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>GO_BACK</span>
              </button>
            </div>

            {/* Quick Links - Terminal Menu */}
            <div className="bg-muted/30 border-border rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2 font-mono text-xs tracking-wider uppercase">
                <Search className="h-3 w-3" />
                <span>AVAILABLE_DESTINATIONS</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { label: "UPLOAD", href: "/?tab=upload" },
                  { label: "GITHUB", href: "/github-analysis" },
                  { label: "REPORTS", href: "/?tab=reports" },
                  { label: "HELP", href: "/help" },
                  { label: "ABOUT", href: "/about" },
                ].map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group border-border hover:border-primary/50 bg-background hover:bg-primary/5 flex items-center gap-2 rounded border px-3 py-2 font-mono text-xs transition-all duration-200"
                  >
                    <span className="text-muted-foreground/50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Footer status bar */}
          <div className="border-border bg-muted/30 border-t px-6 py-3">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">
                SYSTEM_STATUS: ERROR
              </span>
              <span className="text-primary/60">
                [{new Date().getFullYear()}]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
