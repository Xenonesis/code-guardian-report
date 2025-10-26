import { logger } from './logger';

/**
 * Validates required environment variables at runtime
 * Throws error if critical variables are missing
 */

interface EnvConfig {
  // Firebase Configuration (required for production)
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;

  // PWA Configuration (optional)
  VITE_VAPID_PUBLIC_KEY?: string;

  // Environment flags
  DEV: boolean;
  PROD: boolean;
  MODE: string;
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private readonly config: EnvConfig;

  private constructor() {
    this.config = import.meta.env as EnvConfig;
  }

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  /**
   * Validate all required environment variables
   */
  validate(): void {
    const errors: string[] = [];

    // Check critical Firebase variables in production
    if (this.config.PROD) {
      const requiredFirebaseVars = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
      ] as const;

      for (const varName of requiredFirebaseVars) {
        if (!this.config[varName]) {
          errors.push(`Missing required environment variable: ${varName}`);
        }
      }
    }

    // Log warnings for optional but recommended variables
    if (!this.config.VITE_VAPID_PUBLIC_KEY && this.config.PROD) {
      logger.warn('VITE_VAPID_PUBLIC_KEY not set - Push notifications will not work');
    }

    // Throw error if any required variables are missing
    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.join('\n')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    logger.info('Environment validation passed', {
      mode: this.config.MODE,
      isDev: this.config.DEV,
      isProd: this.config.PROD,
    });
  }

  /**
   * Get environment variable safely
   */
  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  /**
   * Check if running in development mode
   */
  isDev(): boolean {
    return this.config.DEV;
  }

  /**
   * Check if running in production mode
   */
  isProd(): boolean {
    return this.config.PROD;
  }

  /**
   * Get current environment mode
   */
  getMode(): string {
    return this.config.MODE;
  }
}

// Export singleton instance
export const envValidator = EnvironmentValidator.getInstance();

// Export convenience methods
export const env = {
  get: <K extends keyof EnvConfig>(key: K) => envValidator.get(key),
  isDev: () => envValidator.isDev(),
  isProd: () => envValidator.isProd(),
  getMode: () => envValidator.getMode(),
  validate: () => envValidator.validate(),
};
