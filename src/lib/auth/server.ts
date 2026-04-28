import { createNeonAuth } from "@neondatabase/auth/next/server";

// Server-side Neon Auth instance
// Reads NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET from env
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
});
