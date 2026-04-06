import { describe, expect, it } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("rate-limit utility", () => {
  it("allows requests under limit and blocks over limit", async () => {
    const prefix = `test-${Date.now()}`;

    const first = await checkRateLimit({
      prefix,
      identifier: "user-1",
      maxRequests: 2,
      windowMs: 60_000,
    });
    const second = await checkRateLimit({
      prefix,
      identifier: "user-1",
      maxRequests: 2,
      windowMs: 60_000,
    });
    const third = await checkRateLimit({
      prefix,
      identifier: "user-1",
      maxRequests: 2,
      windowMs: 60_000,
    });

    expect(first.limited).toBe(false);
    expect(second.limited).toBe(false);
    expect(third.limited).toBe(true);
    expect(third.remaining).toBe(0);
  });

  it("keeps counters isolated per identifier", async () => {
    const prefix = `isolate-${Date.now()}`;

    await checkRateLimit({
      prefix,
      identifier: "user-a",
      maxRequests: 1,
      windowMs: 60_000,
    });

    const other = await checkRateLimit({
      prefix,
      identifier: "user-b",
      maxRequests: 1,
      windowMs: 60_000,
    });

    expect(other.limited).toBe(false);
  });
});
