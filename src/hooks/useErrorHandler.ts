import { useCallback } from 'react';
import { toast } from 'sonner';

import { logger } from '@/utils/logger';
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: Error | unknown, context?: ErrorContext) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    
    logger.error('Error handled:', {
      error: errorMessage,
      context,
      stack: error instanceof Error ? error.stack : undefined
    });

    // Show user-friendly toast
    toast.error(`Error: ${errorMessage}`, {
      description: context?.action ? `Failed to ${context.action}` : undefined
    });

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { contexts: { custom: context } });
    }
  }, []);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<void>,
    context?: ErrorContext
  ) => {
    try {
      await asyncFn();
    } catch (error) {
      handleError(error, context);
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};