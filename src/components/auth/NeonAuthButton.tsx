"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
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
      <Github className="h-4 w-4" />
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
