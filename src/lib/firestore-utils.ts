// src/lib/firestore-utils.ts
import { 
  getDoc, 
  setDoc, 
  DocumentReference, 
  PartialWithFieldValue, 
  DocumentData,
  SetOptions
} from 'firebase/firestore';
import { connectionManager } from './connection-manager';
import { analyzeFirestoreError, shouldShowErrorToUser } from './firestore-error-handler';

// Retry configuration - more conservative approach
const RETRY_ATTEMPTS = 1; // Single retry to avoid connection storms
const RETRY_DELAY = 5000; // 5 seconds - longer delay for stability
const OPERATION_TIMEOUT = 20000; // 20 seconds timeout for operations

// Utility function to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track recent failures to implement circuit breaker pattern
let recentFailures = 0;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_TIME = 60000; // 1 minute

// Retry wrapper for Firestore operations with connection handling
export async function withRetry<T>(
  operation: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  let lastError: Error;
  
  // Circuit breaker: if too many recent failures, fail fast
  const now = Date.now();
  if (recentFailures >= CIRCUIT_BREAKER_THRESHOLD && 
      now - lastFailureTime < CIRCUIT_BREAKER_RESET_TIME) {
    throw new Error('Circuit breaker open - too many recent failures');
  }
  
  // Reset circuit breaker if enough time has passed
  if (now - lastFailureTime > CIRCUIT_BREAKER_RESET_TIME) {
    recentFailures = 0;
  }
  
  // Check if we're online before attempting
  if (!connectionManager.isOnline()) {
    throw new Error('Device is offline');
  }
  
  for (let i = 0; i < attempts; i++) {
    try {
      // Wrap operation with timeout
      const operationPromise = operation();
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Operation timeout')), OPERATION_TIMEOUT)
      );
      
      const result = await Promise.race([operationPromise, timeoutPromise]);
      
      // Reset failure count on success
      recentFailures = 0;
      return result;
    } catch (error) {
      lastError = error as Error;
      recentFailures++;
      lastFailureTime = now;
      
      console.warn(`Firestore operation failed (attempt ${i + 1}/${attempts}):`, error);
      
      // Don't retry on certain errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('permission') || 
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('invalid-argument') ||
            errorMessage.includes('not-found') ||
            errorMessage.includes('already-exists') ||
            errorMessage.includes('circuit breaker')) {
          throw error; // Don't retry these errors
        }
        
        // For connection errors, let connection manager handle it (but don't always retry)
        if (isConnectionError(error) && i < attempts - 1) {
          const canRetry = await connectionManager.handleFirestoreError(error);
          if (!canRetry) {
            console.warn('Connection manager advised against retry');
            throw error;
          }
        }
      }
      
      if (i < attempts - 1) {
        const backoffDelay = delay * Math.pow(2, i);
        console.log(`Waiting ${backoffDelay}ms before retry...`);
        await wait(backoffDelay);
      }
    }
  }
  
  throw lastError!;
}

// Safe Firestore document getter with enhanced error handling
export async function safeGetDoc<T>(
  docRef: DocumentReference,
  fallback?: T,
  options?: { suppressErrorToast?: boolean }
): Promise<{ data: T | null; exists: boolean; error?: Error; errorInfo?: any }> {
  try {
    const result = await withRetry(async () => {
      const snapshot = await getDoc(docRef);
      return {
        data: snapshot.exists() ? snapshot.data() as T : null,
        exists: snapshot.exists(),
      };
    });
    return result;
  } catch (error) {
    const errorInfo = analyzeFirestoreError(error);
    
    // Log detailed error information
    console.warn('Failed to get document after retries:', {
      error: error,
      errorInfo: errorInfo,
      docPath: docRef.path
    });
    
    // Show user-friendly error if appropriate and not suppressed
    if (shouldShowErrorToUser(errorInfo) && !options?.suppressErrorToast) {
      // Dispatch custom event for error display
      window.dispatchEvent(new CustomEvent('firestore-error', {
        detail: { errorInfo, operation: 'read', docPath: docRef.path }
      }));
    }
    
    return {
      data: fallback || null,
      exists: false,
      error: error as Error,
      errorInfo: errorInfo
    };
  }
}

// Safe Firestore document setter with enhanced error handling
export async function safeSetDoc<T extends PartialWithFieldValue<DocumentData>>(
  docRef: DocumentReference,
  data: T,
  options?: SetOptions
): Promise<{ success: boolean; error?: Error; errorInfo?: any }> {
  try {
    await withRetry(async () => {
      if (options) {
        await setDoc(docRef, data, options);
      } else {
        await setDoc(docRef, data);
      }
    });
    return { success: true };
  } catch (error) {
    const errorInfo = analyzeFirestoreError(error);
    
    // Log detailed error information
    console.warn('Failed to set document after retries:', {
      error: error,
      errorInfo: errorInfo,
      docPath: docRef.path
    });
    
    // Show user-friendly error if appropriate
    if (shouldShowErrorToUser(errorInfo)) {
      // Dispatch custom event for error display
      window.dispatchEvent(new CustomEvent('firestore-error', {
        detail: { errorInfo, operation: 'write', docPath: docRef.path }
      }));
    }
    
    return {
      success: false,
      error: error as Error,
      errorInfo: errorInfo
    };
  }
}

// Check if error is a connection/network error
export function isConnectionError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('unavailable') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('transport error') ||
    errorMessage.includes('400') ||
    errorMessage.includes('bad request') ||
    errorMessage.includes('webchannel') ||
    errorMessage.includes('client is offline') ||
    errorMessage.includes('firestore')
  );
}