"use client";

// This component is now a passthrough since Layout is handled globally in MainLayout.
// We keep it for backward compatibility with pages that use it until they are refactored.

interface PageShellProps {
  children: React.ReactNode;
}

/**
 * PageShell - Passthrough component (deprecated)
 */
export function PageShell({ children }: PageShellProps) {
  return <>{children}</>;
}
