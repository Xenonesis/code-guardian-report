"use client";

import { createAuthClient } from "@neondatabase/auth/next";

// createAuthClient() from @neondatabase/auth/next already bundles BetterAuthReactAdapter
// It auto-resolves the auth URL via the Next.js API proxy route (/api/auth/[...path])
// The server-side proxy (lib/auth/server.ts) forwards to NEON_AUTH_BASE_URL
export const neonAuth = createAuthClient();

// Types for Neon Auth user
export interface NeonAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
