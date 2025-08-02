// src/lib/auth-utils.ts
import { toast } from 'sonner';

// Helper function to show user-friendly messages for auth issues
export const showAuthFallbackMessage = (provider: 'google' | 'github') => {
  toast.info(
    `${provider === 'google' ? 'Google' : 'GitHub'} sign-in popup was blocked. Redirecting to ${provider === 'google' ? 'Google' : 'GitHub'} for authentication...`,
    {
      duration: 4000,
      description: 'This is normal and helps ensure secure authentication.'
    }
  );
};

// Helper function to detect if we're in a redirect flow
export const isRedirectFlow = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('state') || urlParams.has('code') || window.location.hash.includes('access_token');
};

// Helper function to show loading message during redirect
export const showRedirectLoadingMessage = () => {
  if (isRedirectFlow()) {
    toast.loading('Completing authentication...', {
      duration: 3000,
      description: 'Please wait while we finish signing you in.'
    });
  }
};

// Helper function to handle auth errors gracefully
export const handleAuthError = (error: any, context: string) => {
  // User-friendly error messages
  const errorMessages: Record<string, string> = {
    'auth/popup-blocked': 'Popup was blocked by your browser. We\'ll redirect you instead.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
    'auth/invalid-email': 'Please enter a valid email address.',
  };

  const userMessage = errorMessages[error.code] || 'An unexpected error occurred. Please try again.';
  
  // Don't show error toast for popup-blocked since we handle it with redirect
  if (error.code !== 'auth/popup-blocked') {
    toast.error('Authentication Error', {
      description: userMessage,
      duration: 5000
    });
  }
  
  return userMessage;
};

// Helper to clean up URL after redirect authentication
export const cleanupRedirectUrl = () => {
  if (isRedirectFlow()) {
    // Clean up the URL by removing auth-related parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('state');
    url.searchParams.delete('code');
    url.hash = '';
    
    // Replace the current URL without reloading the page
    window.history.replaceState({}, document.title, url.toString());
  }
};