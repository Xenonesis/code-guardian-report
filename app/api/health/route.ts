import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * Used for:
 * - Load balancer health checks
 * - Kubernetes liveness/readiness probes
 * - Uptime monitoring services
 * - CI/CD deployment verification
 */

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    name: string;
    status: "pass" | "fail" | "warn";
    message?: string;
    responseTime?: number;
  }[];
}

const startTime = Date.now();

/**
 * GET /api/health
 * Returns the health status of the application
 */
export async function GET() {
  const checks: HealthStatus["checks"] = [];
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  // Check 1: Application startup
  const appCheck = {
    name: "application",
    status: "pass" as const,
    message: "Application is running",
  };
  checks.push(appCheck);

  // Check 2: Memory usage
  const memoryCheck = await checkMemory();
  checks.push(memoryCheck);
  if (memoryCheck.status === "fail") overallStatus = "unhealthy";
  if (memoryCheck.status === "warn" && overallStatus === "healthy")
    overallStatus = "degraded";

  // Check 3: Environment configuration
  const envCheck = checkEnvironment();
  checks.push(envCheck);
  if (envCheck.status === "fail") overallStatus = "degraded";

  const response: HealthStatus = {
    status: overallStatus,
    version:
      process.env.NEXT_PUBLIC_APP_VERSION ||
      process.env.npm_package_version ||
      "11.0.0",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || "development",
    checks,
  };

  // Return appropriate status code based on health
  const statusCode =
    overallStatus === "healthy"
      ? 200
      : overallStatus === "degraded"
        ? 200
        : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/health+json",
    },
  });
}

/**
 * Check memory usage
 */
async function checkMemory(): Promise<HealthStatus["checks"][0]> {
  try {
    // Memory check is only available in Node.js runtime
    if (typeof process !== "undefined" && process.memoryUsage) {
      const memory = process.memoryUsage();
      const heapUsedMB = Math.round(memory.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
      const usagePercent = Math.round(
        (memory.heapUsed / memory.heapTotal) * 100
      );

      if (usagePercent > 90) {
        return {
          name: "memory",
          status: "fail",
          message: `Critical memory usage: ${usagePercent}% (${heapUsedMB}MB / ${heapTotalMB}MB)`,
        };
      }

      if (usagePercent > 75) {
        return {
          name: "memory",
          status: "warn",
          message: `High memory usage: ${usagePercent}% (${heapUsedMB}MB / ${heapTotalMB}MB)`,
        };
      }

      return {
        name: "memory",
        status: "pass",
        message: `Memory usage: ${usagePercent}% (${heapUsedMB}MB / ${heapTotalMB}MB)`,
      };
    }

    return {
      name: "memory",
      status: "pass",
      message: "Memory check not available in edge runtime",
    };
  } catch {
    return {
      name: "memory",
      status: "warn",
      message: "Unable to check memory usage",
    };
  }
}

/**
 * Check environment configuration
 */
function checkEnvironment(): HealthStatus["checks"][0] {
  const requiredEnvVars = ["NODE_ENV"];
  const optionalEnvVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ];

  const missingRequired = requiredEnvVars.filter((v) => !process.env[v]);
  const missingOptional = optionalEnvVars.filter((v) => !process.env[v]);

  if (missingRequired.length > 0) {
    return {
      name: "environment",
      status: "fail",
      message: `Missing required env vars: ${missingRequired.join(", ")}`,
    };
  }

  if (missingOptional.length > 0) {
    return {
      name: "environment",
      status: "warn",
      message: `Missing optional env vars: ${missingOptional.length} (some features may be disabled)`,
    };
  }

  return {
    name: "environment",
    status: "pass",
    message: "All environment variables configured",
  };
}

/**
 * HEAD /api/health
 * Lightweight health check for load balancers
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
