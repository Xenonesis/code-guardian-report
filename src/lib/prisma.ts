import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import type { neon } from "@neondatabase/serverless";

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Create a Prisma client backed by Neon's HTTP adapter.
 * PrismaNeonHttp (factory) takes a connection string and handles
 * the neon() client creation internally — no need to call neon() ourselves.
 * Required for Prisma v7+ with @neondatabase/serverless in serverless environments.
 */
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // PrismaNeonHttp is the factory — pass the connection string directly
  const adapter = new PrismaNeonHttp(
    databaseUrl,
    {} as neon.HTTPQueryOptions<boolean, boolean>
  );

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Singleton pattern – reuse the same instance across hot reloads in dev
function getPrismaClient(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = createPrismaClient();
  }
  return globalThis.prisma;
}

// Export a proxy that lazily initializes Prisma on first use
export const prisma = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    const client = getPrismaClient();
    return (client as any)[prop];
  },
});
