type RateLimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
  source: "memory" | "redis";
};

type RateLimitOptions = {
  prefix: string;
  identifier: string;
  maxRequests: number;
  windowMs: number;
};

type MemoryCounter = {
  count: number;
  resetAt: number;
};

const memoryCounters = new Map<string, MemoryCounter>();

function getWindowKey(
  prefix: string,
  identifier: string,
  windowMs: number
): { key: string; resetAt: number } {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetAt = windowStart + windowMs;
  return {
    key: `${prefix}:${identifier}:${windowStart}`,
    resetAt,
  };
}

function sanitizeIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9._:-]/g, "_").slice(0, 180);
}

function checkMemoryRateLimit(options: RateLimitOptions): RateLimitResult {
  const identifier = sanitizeIdentifier(options.identifier || "unknown");
  const { key, resetAt } = getWindowKey(
    options.prefix,
    identifier,
    options.windowMs
  );

  const now = Date.now();
  const existing = memoryCounters.get(key);
  if (!existing || now >= existing.resetAt) {
    memoryCounters.set(key, { count: 1, resetAt });
    return {
      limited: false,
      remaining: Math.max(0, options.maxRequests - 1),
      resetAt,
      source: "memory",
    };
  }

  existing.count += 1;
  const remaining = Math.max(0, options.maxRequests - existing.count);
  return {
    limited: existing.count > options.maxRequests,
    remaining,
    resetAt: existing.resetAt,
    source: "memory",
  };
}

async function redisCommand(command: string[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Redis environment is not configured");
  }

  const endpoint = `${url.replace(/\/$/, "")}/${command.map(encodeURIComponent).join("/")}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Redis command failed with status ${response.status}`);
  }

  const payload = (await response.json()) as { result?: unknown };
  return payload.result;
}

async function checkRedisRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const identifier = sanitizeIdentifier(options.identifier || "unknown");
  const { key, resetAt } = getWindowKey(
    options.prefix,
    identifier,
    options.windowMs
  );

  const incr = await redisCommand(["INCR", key]);
  const count = Number(incr || 0);
  if (count === 1) {
    const ttlSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
    await redisCommand(["PEXPIRE", key, String(options.windowMs)]).catch(
      async () => {
        // Fallback in case PEXPIRE is not available in Redis proxy mode.
        await redisCommand(["EXPIRE", key, String(ttlSeconds)]);
      }
    );
  }

  return {
    limited: count > options.maxRequests,
    remaining: Math.max(0, options.maxRequests - count),
    resetAt,
    source: "redis",
  };
}

export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const hasRedis =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!hasRedis) {
    return checkMemoryRateLimit(options);
  }

  try {
    return await checkRedisRateLimit(options);
  } catch {
    // Safety fallback: never fail closed due to Redis transport issues.
    return checkMemoryRateLimit(options);
  }
}

export type { RateLimitOptions, RateLimitResult };
