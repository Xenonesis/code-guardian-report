// src/lib/auth-utils.ts
import { toast } from "sonner";

// Helper function to show user-friendly messages for auth issues
export const showAuthFallbackMessage = (_provider: "github") => {
  toast.info(
    `GitHub sign-in popup was blocked. Redirecting to GitHub for authentication...`,
    {
      duration: 4000,
      description: "This is normal and helps ensure secure authentication.",
    }
  );
};

// Helper function to detect if we're in a redirect flow
export const isRedirectFlow = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return (
    urlParams.has("state") ||
    urlParams.has("code") ||
    window.location.hash.includes("access_token")
  );
};

// Helper function to show loading message during redirect
export const showRedirectLoadingMessage = () => {
  if (isRedirectFlow()) {
    toast.loading("Completing authentication...", {
      duration: 3000,
      description: "Please wait while we finish signing you in.",
    });
  }
};

// Helper function to handle auth errors gracefully
export const handleAuthError = (error: any, _context: string) => {
  // User-friendly error messages for NextAuth
  const errorMessages: Record<string, string> = {
    "OAuthCallback": "Authentication failed. Please try again.",
    "OAuthCreateAccount": "Failed to create account. Please try again.",
    "EmailCreateAccount": "Failed to create account. Please try again.",
    "Callback": "Authentication callback failed. Please try again.",
    "OAuthAccountNotLinked": "Account not linked. Please sign in with your original method.",
    "EmailSignin": "Failed to send email. Please try again.",
    "CredentialsSignin": "Invalid credentials. Please try again.",
    "SessionRequired": "You must be signed in to access this resource.",
    "Default": "An unexpected error occurred. Please try again.",
  };

  const errorCode = error?.code || error?.name || "Default";
  const userMessage = errorMessages[errorCode] || errorMessages["Default"];

  toast.error("Authentication Error", {
    description: userMessage,
    duration: 5000,
  });

  return userMessage;
};

// Helper function to extract provider info from auth error
export const getProviderFromError = (error: any): string | null => {
  return error?.provider || error?.providerId || null;
};

// Helper function to get email from auth error
export const getEmailFromError = (error: any): string | null => {
  return error?.email || null;
};

// Helper to clean up URL after redirect authentication
export const cleanupRedirectUrl = () => {
  if (isRedirectFlow()) {
    // Clean up the URL by removing auth-related parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("state");
    url.searchParams.delete("code");
    url.hash = "";

    // Replace the current URL without reloading the page
    window.history.replaceState({}, document.title, url.toString());
  }
};
