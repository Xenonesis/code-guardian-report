"use client";

import { Button } from "@/components/ui/button";
// Github icon: inline SVG — lucide-react v1 removed brand icons
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import { useState } from "react";

interface NeonAuthButtonProps {
  mode?: "login" | "register";
  redirectTo?: string;
}

/**
 * Neon Auth Button Component
 *
 * This button redirects users to Neon Auth for GitHub OAuth authentication.
 *
 * Prerequisites:
 * 1. Neon Auth must be enabled in your Neon project
 * 2. GitHub OAuth must be configured in Neon Auth settings
 * 3. NEON_AUTH_URL must be set in .env.local
 */
export function NeonAuthButton({
  mode = "login",
  redirectTo = "/dashboard",
}: NeonAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = () => {
    const authUrl =
      process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEON_AUTH_URL;

    if (!authUrl) {
      console.error("NEON_AUTH_URL not configured");
      alert(
        "Neon Auth is not configured. Please check your environment variables."
      );
      return;
    }

    setIsLoading(true);

    // Construct the Neon Auth URL with GitHub provider
    const flow = mode === "login" ? "login" : "registration";
    const returnTo = encodeURIComponent(redirectTo);

    // Redirect to Neon Auth
    const neonAuthUrl = `${authUrl}/self-service/${flow}/browser?return_to=${returnTo}`;

    window.location.href = neonAuthUrl;
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={isLoading}
      variant="outline"
      className="flex w-full items-center gap-2"
    >
      <GithubIcon className="h-4 w-4" />
      {isLoading
        ? mode === "login"
          ? "Connecting..."
          : "Signing up..."
        : mode === "login"
          ? "Continue with GitHub"
          : "Sign up with GitHub"}
    </Button>
  );
}

/**
 * Neon Auth Status Component
 * Shows authentication status and logout button for Neon Auth
 */
export function NeonAuthStatus() {
  const handleLogout = () => {
    const authUrl =
      process.env.NEXT_PUBLIC_NEON_AUTH_URL || process.env.NEON_AUTH_URL;

    if (!authUrl) {
      console.error("NEON_AUTH_URL not configured");
      return;
    }

    // Redirect to Neon Auth logout
    const returnTo = encodeURIComponent(window.location.origin);
    window.location.href = `${authUrl}/self-service/logout/browser?return_to=${returnTo}`;
  };

  return (
    <Button onClick={handleLogout} variant="ghost" size="sm">
      Logout
    </Button>
  );
}
