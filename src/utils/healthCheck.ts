/**
 * Production build verification script
 * Checks if the production build is ready and properly configured
 */

import { logger } from "../utils/logger";
import { env } from "../utils/envValidator";

interface HealthCheck {
  name: string;
  status: "pass" | "fail";
  message?: string;
}

class ProductionHealthChecker {
  private checks: HealthCheck[] = [];

  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<{
    passed: number;
    failed: number;
    checks: HealthCheck[];
  }> {
    this.checks = [];

    await this.checkEnvironmentVariables();
    await this.checkServiceWorker();
    await this.checkFirebaseConnection();
    await this.checkPerformance();
    await this.checkSecurityHeaders();

    const passed = this.checks.filter((c) => c.status === "pass").length;
    const failed = this.checks.filter((c) => c.status === "fail").length;

    return { passed, failed, checks: this.checks };
  }

  /**
   * Check if all required environment variables are set
   */
  private async checkEnvironmentVariables(): Promise<void> {
    try {
      env.validate();
      this.checks.push({
        name: "Environment Variables",
        status: "pass",
      });
    } catch (error) {
      this.checks.push({
        name: "Environment Variables",
        status: "fail",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Check if service worker is registered
   */
  private async checkServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          this.checks.push({
            name: "Service Worker",
            status: "pass",
            message: "Service worker is registered",
          });
        } else {
          this.checks.push({
            name: "Service Worker",
            status: "fail",
            message: "Service worker not registered",
          });
        }
      } catch (error) {
        this.checks.push({
          name: "Service Worker",
          status: "fail",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else {
      this.checks.push({
        name: "Service Worker",
        status: "fail",
        message: "Service worker not supported",
      });
    }
  }

  /**
   * Check Firebase connection
   */
  private async checkFirebaseConnection(): Promise<void> {
    try {
      // Check if Firebase is configured
      const firebaseApiKey = env.get("NEXT_PUBLIC_FIREBASE_API_KEY");
      if (firebaseApiKey) {
        this.checks.push({
          name: "Firebase Connection",
          status: "pass",
          message: "Firebase is configured",
        });
      } else {
        this.checks.push({
          name: "Firebase Connection",
          status: "fail",
          message: "Firebase API key not found",
        });
      }
    } catch (error) {
      this.checks.push({
        name: "Firebase Connection",
        status: "fail",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Check performance metrics
   */
  private async checkPerformance(): Promise<void> {
    if ("performance" in globalThis) {
      const navigation = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;

        if (loadTime < 3000) {
          this.checks.push({
            name: "Performance",
            status: "pass",
            message: `Page load time: ${loadTime.toFixed(0)}ms`,
          });
        } else {
          this.checks.push({
            name: "Performance",
            status: "fail",
            message: `Page load time too slow: ${loadTime.toFixed(0)}ms`,
          });
        }
      } else {
        this.checks.push({
          name: "Performance",
          status: "pass",
          message: "Performance metrics not available yet",
        });
      }
    } else {
      this.checks.push({
        name: "Performance",
        status: "fail",
        message: "Performance API not supported",
      });
    }
  }

  /**
   * Check security headers (CSP, etc.)
   */
  private async checkSecurityHeaders(): Promise<void> {
    // Check if CSP meta tag exists
    const cspMeta = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]'
    );

    if (cspMeta) {
      this.checks.push({
        name: "Security Headers",
        status: "pass",
        message: "CSP meta tag is present",
      });
    } else {
      this.checks.push({
        name: "Security Headers",
        status: "fail",
        message: "CSP meta tag not found",
      });
    }
  }

  /**
   * Log health check results
   */
  logResults(): void {
    logger.group("Production Health Check Results");

    this.checks.forEach((check) => {
      const statusLabel = check.status === "pass" ? "PASS" : "FAIL";
      const message = check.message ? ` - ${check.message}` : "";
      logger.info(`${statusLabel} ${check.name}${message}`);
    });

    logger.groupEnd();
  }
}

/**
 * Run production health checks
 */
export async function runProductionHealthChecks(): Promise<void> {
  if (!env.isProd()) {
    logger.debug("Skipping production health checks in development mode");
    return;
  }

  const checker = new ProductionHealthChecker();
  const results = await checker.runAllChecks();

  checker.logResults();

  if (results.failed > 0) {
    logger.warn(
      `Production health check completed with ${results.failed} failures`
    );
  } else {
    logger.info("All production health checks passed!");
  }
}
