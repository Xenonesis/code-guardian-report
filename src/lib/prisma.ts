import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Singleton pattern with lazy initialization
// Prisma client is only created when first accessed
function getPrismaClient(): PrismaClient {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
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
