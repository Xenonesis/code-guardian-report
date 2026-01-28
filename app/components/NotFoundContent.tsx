"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFoundContent() {
  return (
    <div className="from-background via-background to-muted/30 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="w-full max-w-lg text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl" />
          </div>

          {/* Icon */}
          <div className="relative flex justify-center">
            <div className="border-border/30 flex h-24 w-24 items-center justify-center rounded-2xl border bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20 backdrop-blur-sm">
              <FileQuestion className="text-primary h-12 w-12" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8 space-y-4">
          <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-7xl font-bold text-transparent">
            404
          </h1>
          <h2 className="text-foreground text-2xl font-semibold">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mx-auto max-w-md leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Check the URL or navigate back to safety.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() =>
              typeof window !== "undefined" && window.history.back()
            }
            className="bg-muted/50 text-foreground hover:bg-muted border-border/50 inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 font-medium transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-card/50 border-border/30 rounded-xl border p-4 backdrop-blur-sm">
          <p className="text-muted-foreground mb-3 text-sm">
            <Search className="mr-1 inline h-4 w-4" />
            Popular destinations
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Upload Analysis", href: "/?tab=upload" },
              { label: "GitHub Analysis", href: "/github-analysis" },
              { label: "Reports", href: "/?tab=reports" },
              { label: "Help", href: "/help" },
              { label: "About", href: "/about" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
