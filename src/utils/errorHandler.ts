import { logger } from './logger';

/**
 * Production-grade error handler
 * Provides consistent error handling across the application
 */

export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Setup global error handlers for uncaught errors
   */
  private setupGlobalErrorHandlers(): void {
    // Handle uncaught promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise,
      });
      
      // Prevent default browser behavior
      event.preventDefault();
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      logger.error('Uncaught Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
      
      // Prevent default browser behavior
      event.preventDefault();
    });
  }

  /**
   * Handle errors with consistent formatting
   */
  handle(error: unknown, context?: Record<string, unknown>): AppError {
    const appError = this.normalizeError(error, context);
    
    logger.error(appError.message, {
      code: appError.code,
      stack: appError.stack,
      context: appError.context,
    });

    return appError;
  }

  /**
   * Normalize different error types into AppError
   */
  private normalizeError(error: unknown, context?: Record<string, unknown>): AppError {
    // Handle Error instances
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        context,
      };
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: error,
        context,
      };
    }

    // Handle objects with message property
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: String(error.message),
        code: 'code' in error ? String(error.code) : undefined,
        context,
      };
    }

    // Fallback for unknown error types
    return {
      message: 'An unknown error occurred',
      context: {
        ...context,
        originalError: error,
      },
    };
  }

  /**
   * Create async error handler wrapper
   */
  async<T>(
    fn: (...args: unknown[]) => Promise<T>,
    context?: Record<string, unknown>
  ): (...args: unknown[]) => Promise<T> {
    return async (...args: unknown[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handle(error, context);
        throw error;
      }
    };
  }

  /**
   * Create sync error handler wrapper
   */
  sync<T>(
    fn: (...args: unknown[]) => T,
    context?: Record<string, unknown>
  ): (...args: unknown[]) => T {
    return (...args: unknown[]) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, context);
        throw error;
      }
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = (error: unknown, context?: Record<string, unknown>) => 
  errorHandler.handle(error, context);

export const wrapAsync = <T>(
  fn: (...args: unknown[]) => Promise<T>,
  context?: Record<string, unknown>
) => errorHandler.async(fn, context);

export const wrapSync = <T>(
  fn: (...args: unknown[]) => T,
  context?: Record<string, unknown>
) => errorHandler.sync(fn, context);
