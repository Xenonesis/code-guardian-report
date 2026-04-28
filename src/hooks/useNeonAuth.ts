"use client";

import { useState, useEffect } from "react";

interface NeonAuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  github_username?: string;
}

interface UseNeonAuthReturn {
  user: NeonAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * useNeonAuth Hook
 *
 * Checks if user is authenticated via Neon Auth by looking for the session cookie.
 *
 * Note: Neon Auth sets an `ory_session_xxx` cookie when authenticated.
 */
export function useNeonAuth(): UseNeonAuthReturn {
  const [user, setUser] = useState<NeonAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for Neon Auth session cookie
        const hasSessionCookie = document.cookie.includes("ory_session_");

        if (!hasSessionCookie) {
          setIsLoading(false);
          return;
        }

        // Get session info from Neon Auth
        const authUrl =
          process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEON_AUTH_URL;

        if (!authUrl) {
          setError("Neon Auth URL not configured");
          setIsLoading(false);
          return;
        }

        // Fetch session from Neon Auth
        const response = await fetch(`${authUrl}/sessions/whoami`, {
          credentials: "include",
        });

        if (response.ok) {
          const session = await response.json();

          // Extract user info from session
          const identity = session?.identity;
          if (identity) {
            setUser({
              id: identity.id,
              email: identity.traits?.email || "",
              name: identity.traits?.name || identity.traits?.username,
              avatar_url: identity.traits?.avatar_url,
              github_username: identity.traits?.username,
            });
          }
        }
      } catch (err) {
        console.error("Failed to check Neon Auth session:", err);
        setError("Failed to check authentication status");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

/**
 * Check if Neon Auth is configured
 */
export function isNeonAuthConfigured(): boolean {
  if (typeof window === "undefined") return false;

  const authUrl =
    process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEON_AUTH_URL;
  return !!authUrl;
}
