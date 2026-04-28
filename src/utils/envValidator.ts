import { logger } from "./logger";

/**
 * Validates required environment variables at runtime
 * Throws error if critical variables are missing
 */

interface EnvConfig {
  // PWA Configuration (optional)
  NEXT_PUBLIC_VAPID_PUBLIC_KEY?: string;

  // Environment flags
  DEV: boolean;
  PROD: boolean;
  MODE: string;
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private readonly config: EnvConfig;

  private constructor() {
    this.config = {
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      DEV: process.env.NODE_ENV === "development",
      PROD: process.env.NODE_ENV === "production",
      MODE: process.env.NODE_ENV || "development",
    };
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

    // Log warnings for optional but recommended variables
    if (!this.config.NEXT_PUBLIC_VAPID_PUBLIC_KEY && this.config.PROD) {
      logger.warn(
        "NEXT_PUBLIC_VAPID_PUBLIC_KEY not set - Push notifications will not work"
      );
    }

    // Throw error if any required variables are missing
    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.join("\n")}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    logger.info("Environment validation passed", {
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
