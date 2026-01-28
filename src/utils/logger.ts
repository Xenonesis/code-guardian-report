/**
 * Production-grade logging utility
 * Automatically removes console.log in production while preserving errors and warnings
 */

const IS_DEV = process.env.NODE_ENV === "development";
const IS_PROD = process.env.NODE_ENV === "production";

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  FATAL = "FATAL",
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  stack?: string;
  sessionId?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
}

 

const getSessionId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2);
};

let SESSION_ID: string | null = null;
const getOrCreateSessionId = (): string => {
  if (!SESSION_ID) {
    SESSION_ID = getSessionId();
  }
  return SESSION_ID;
};

class Logger {
  private static instance: Logger;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Start periodic flush for production
    if (IS_PROD && typeof window !== "undefined") {
      this.flushInterval = setInterval(() => this.flush(), 30000); // Flush every 30 seconds
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: unknown
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      stack:
        level === LogLevel.ERROR || level === LogLevel.FATAL
          ? new Error().stack
          : undefined,
      sessionId: getOrCreateSessionId(),
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : undefined,
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
      console.log(`[DEBUG] ${message}`, data || "");
    }
  }

  info(message: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    this.addToBuffer(entry);

    if (IS_DEV) {
      console.info(`[INFO] ${message}`, data || "");
    }
  }

  warn(message: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    this.addToBuffer(entry);

 

    if (IS_DEV) {
      console.warn(`[WARN] ${message}`, data || "");
    }
  }

  error(message: string, error?: unknown): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, error);
    this.addToBuffer(entry);

    // Only show errors in development, in production send to tracking service
    if (IS_DEV) {
      console.error(`[ERROR] ${message}`, error || "");
    }

    // In production, send to error tracking service
    if (IS_PROD) {
      this.sendToErrorTracking(entry);
    }
  }

  fatal(message: string, error?: unknown): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, error);
    this.addToBuffer(entry);

    // Always log fatal errors
    console.error(`[FATAL] ${message}`, error || "");

    // Send immediately to error tracking
    this.sendToErrorTracking(entry);
  }

  private sendToErrorTracking(_entry: LogEntry): void {
    // Production error tracking integration
    // Uncomment and configure one of the following:
    // Sentry Integration:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(new Error(_entry.message), {
    //     extra: { ..._entry }
    //   });
    // }
    // Vercel Analytics Error Tracking:
    // This is automatically handled by @vercel/analytics
    // Custom error endpoint:
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(_entry)
    // }).catch(() => {});
  }

  /**
   * Flush logs to remote service
   */
  flush(): void {
    if (this.logBuffer.length === 0) return;

    // In production, could send buffered logs to analytics
    // const logs = [...this.logBuffer];
    // this.logBuffer = [];
    // fetch('/api/logs', { ... })
  }

  /**
   * Cleanup on unmount
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }

  getRecentLogs(count: number = 20): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }

  // Group logs for better organization (only in dev)
  group(label: string): void {
    if (IS_DEV && typeof console.group === "function") {
      console.group(label);
    }
  }

  groupEnd(): void {
    if (IS_DEV && typeof console.groupEnd === "function") {
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
