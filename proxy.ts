import { NextRequest, NextResponse } from "next/server";
import { CSP_DIRECTIVES, SECURITY_HEADERS } from "./src/config/security";

/**
 * Production Security Proxy
 * Handles security headers, rate limiting headers, and request validation
 */

function buildContentSecurityPolicy(nonce: string): string {
  const directives = Object.entries(CSP_DIRECTIVES).map(([key, values]) => {
    const entries = [...values];

    if (key === "script-src") {
      entries.push(`'nonce-${nonce}'`);
      // Runtime policy should never allow eval in production.
      if (process.env.NODE_ENV === "production") {
        const filtered = entries.filter((value) => value !== "'unsafe-eval'");
        return filtered.length ? `${key} ${filtered.join(" ")}` : key;
      }
    }

    return entries.length ? `${key} ${entries.join(" ")}` : key;
  });

  // Block legacy plugin contexts explicitly.
  directives.push("object-src 'none'");

  return directives.join("; ");
}

// Generate a cryptographically secure nonce
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// Validate request for common attack patterns
function validateRequest(request: NextRequest): {
  valid: boolean;
  reason?: string;
} {
  const url = request.url;
  const pathname = request.nextUrl.pathname;

  // Block common attack paths
  const blockedPaths = [
    "/wp-admin",
    "/wp-login",
    "/wp-content",
    "/xmlrpc.php",
    "/admin.php",
    "/.env",
    "/.git",
    "/config.php",
    "/shell",
    "/backdoor",
    "/phpmyadmin",
  ];

  for (const blocked of blockedPaths) {
    if (pathname.toLowerCase().includes(blocked)) {
      return { valid: false, reason: "Blocked path" };
    }
  }

  // Block requests with suspicious query parameters
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /\bor\b.*=.*\bor\b/i,
    /'\s*or\s+'?/i,
  ];

  const queryString = request.nextUrl.search;
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(queryString)) {
      return { valid: false, reason: "Suspicious query parameter" };
    }
  }

  // Check for overly long URLs (potential buffer overflow attempts)
  if (url.length > 2048) {
    return { valid: false, reason: "URL too long" };
  }

  return { valid: true };
}

export function proxy(request: NextRequest) {
  // Validate the request
  const validation = validateRequest(request);
  if (!validation.valid) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // Generate nonce for CSP
  const nonce = generateNonce();

  // Propagate nonce into the request so server components/layout can use it.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Create response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add security headers from the shared canonical config.
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Always emit CSP from runtime policy so route responses are consistent.
  response.headers.set(
    "Content-Security-Policy",
    buildContentSecurityPolicy(nonce)
  );

  // Echo nonce for diagnostics and optional client-side consumers.
  response.headers.set("x-nonce", nonce);

  // Add cache headers for static assets
  const pathname = request.nextUrl.pathname;

  if (pathname.match(/\.(js|css|woff2|png|jpg|jpeg|gif|svg|ico)$/)) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }

  // API routes should not be cached
  if (pathname.startsWith("/api/")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate"
    );
  }

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
