// src/lib/firestore-error-handler.ts
import { FirestoreError } from 'firebase/firestore';

export interface FirestoreErrorInfo {
  code: string;
  message: string;
  isRetryable: boolean;
  userMessage: string;
  suggestedAction?: string;
}

export function analyzeFirestoreError(error: any): FirestoreErrorInfo {
  // Handle FirestoreError specifically
  if (error?.code) {
    switch (error.code) {
      case 'unavailable':
        return {
          code: error.code,
          message: error.message,
          isRetryable: true,
          userMessage: 'Service temporarily unavailable. Please try again.',
          suggestedAction: 'retry'
        };
      
      case 'permission-denied':
        return {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userMessage: 'Please sign in to save your changes.',
          suggestedAction: 'login'
        };
      
      case 'not-found':
        return {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userMessage: 'The requested data was not found.',
          suggestedAction: 'refresh'
        };
      
      case 'already-exists':
        return {
          code: error.code,
          message: error.message,
          isRetryable: false,
          userMessage: 'This data already exists.',
          suggestedAction: 'update'
        };
      
      case 'resource-exhausted':
        return {
          code: error.code,
          message: error.message,
          isRetryable: true,
          userMessage: 'Service is temporarily overloaded. Please try again later.',
          suggestedAction: 'wait'
        };
      
      case 'deadline-exceeded':
      case 'cancelled':
        return {
          code: error.code,
          message: error.message,
          isRetryable: true,
          userMessage: 'Request timed out. Please check your connection and try again.',
          suggestedAction: 'retry'
        };
      
      default:
        return {
          code: error.code,
          message: error.message,
          isRetryable: true,
          userMessage: 'Something went wrong. Please try again.',
          suggestedAction: 'retry'
        };
    }
  }
  
  // Handle generic errors
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('network') || 
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('transport error') ||
      errorMessage.includes('webchannel') ||
      errorMessage.includes('400') ||
      errorMessage.includes('bad request')) {
    return {
      code: 'network-error',
      message: error.message,
      isRetryable: true,
      userMessage: 'Connection issue detected. Working to restore connection...',
      suggestedAction: 'wait'
    };
  }
  
  if (errorMessage.includes('offline') || errorMessage.includes('no internet')) {
    return {
      code: 'offline',
      message: error.message,
      isRetryable: true,
      userMessage: 'You appear to be offline. Please check your internet connection.',
      suggestedAction: 'check-connection'
    };
  }
  
  if (errorMessage.includes('circuit breaker')) {
    return {
      code: 'circuit-breaker',
      message: error.message,
      isRetryable: false,
      userMessage: 'Service is temporarily unavailable due to connection issues. Please wait a moment.',
      suggestedAction: 'wait'
    };
  }
  
  // Default case
  return {
    code: 'unknown',
    message: error.message || 'Unknown error',
    isRetryable: false,
    userMessage: 'Something went wrong. Please try again.',
    suggestedAction: 'refresh'
  };
}

export function shouldShowErrorToUser(errorInfo: FirestoreErrorInfo): boolean {
  // Don't show network errors immediately - let the connection manager handle them
  if (errorInfo.code === 'network-error' || errorInfo.code === 'unavailable') {
    return false;
  }
  
  // Show permission and not-found errors immediately
  if (errorInfo.code === 'permission-denied' || errorInfo.code === 'not-found') {
    return true;
  }
  
  // Show circuit breaker errors after a delay
  if (errorInfo.code === 'circuit-breaker') {
    return true;
  }
  
  // Default: show error
  return true;
}

export function getErrorRecoveryAction(errorInfo: FirestoreErrorInfo): (() => void) | null {
  switch (errorInfo.suggestedAction) {
    case 'retry':
      return () => window.location.reload();
    
    case 'refresh':
      return () => window.location.reload();
    
    case 'login':
      return () => {
        // Trigger auth modal or redirect to login
        const event = new CustomEvent('show-auth-modal');
        window.dispatchEvent(event);
      };
    
    case 'check-connection':
      return () => {
        // Show connection troubleshooting tips
        const event = new CustomEvent('show-connection-help');
        window.dispatchEvent(event);
      };
    
    default:
      return null;
  }
}