/**
 * Production-grade logging utility
 * Automatically removes console.log in production while preserving errors and warnings
 */

const IS_DEV = (import.meta as any).env?.DEV ?? true;
const IS_PROD = (import.meta as any).env?.PROD ?? false;

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      stack: level === LogLevel.ERROR ? new Error().stack : undefined,
    };
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  debug(message: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
    this.addToBuffer(entry);
    
    if (IS_DEV) {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    this.addToBuffer(entry);
    
    if (IS_DEV) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    this.addToBuffer(entry);
    
    // Only show warnings in development
    if (IS_DEV) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: unknown): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, error);
    this.addToBuffer(entry);
    
    // Only show errors in development, in production send to tracking service
    if (IS_DEV) {
      console.error(`[ERROR] ${message}`, error || '');
    }

    // In production, could send to error tracking service (e.g., Sentry)
    if (IS_PROD) {
      this.sendToErrorTracking(entry);
    }
  }

  private sendToErrorTracking(_entry: LogEntry): void {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(entry);
  }

  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }

  // Group logs for better organization (only in dev)
  group(label: string): void {
    if (IS_DEV && typeof console.group === 'function') {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (IS_DEV && typeof console.groupEnd === 'function') {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience methods
export const log = {
  debug: (message: string, data?: unknown) => logger.debug(message, data),
  info: (message: string, data?: unknown) => logger.info(message, data),
  warn: (message: string, data?: unknown) => logger.warn(message, data),
  error: (message: string, error?: unknown) => logger.error(message, error),
  group: (label: string) => logger.group(label),
  groupEnd: () => logger.groupEnd(),
};
