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
  // User-friendly error messages
  const errorMessages: Record<string, string> = {
    "auth/popup-blocked":
      "Popup was blocked by your browser. We'll redirect you instead.",
    "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
    "auth/network-request-failed":
      "Network error. Please check your connection and try again.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password":
      "Password is too weak. Please choose a stronger password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/account-exists-with-different-credential":
      "An account with this email already exists with a different sign-in method.",
  };

  const userMessage =
    errorMessages[error.code] ||
    "An unexpected error occurred. Please try again.";

  // Don't show error toast for popup-blocked and account-exists since we handle them specially
  if (
    error.code !== "auth/popup-blocked" &&
    error.code !== "auth/account-exists-with-different-credential"
  ) {
    toast.error("Authentication Error", {
      description: userMessage,
      duration: 5000,
    });
  }

  return userMessage;
};

// Helper function to extract provider info from Firebase auth error
export const getProviderFromError = (error: any): string | null => {
  if (error.customData?.providerId) {
    return error.customData.providerId;
  }
  if (error.credential?.providerId) {
    return error.credential.providerId;
  }
  return null;
};

// Helper function to get email from Firebase auth error
export const getEmailFromError = (error: any): string | null => {
  return error.customData?.email || error.email || null;
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
