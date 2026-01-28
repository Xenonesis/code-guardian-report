import { NextRequest, NextResponse } from 'next/server';

/**
 * Production Security Middleware
 * Handles security headers, rate limiting headers, and request validation
 */

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100;

// Security headers for all responses
const securityHeaders = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Enable XSS filter
  'X-XSS-Protection': '1; mode=block',
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Restrict browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  // DNS prefetch control
  'X-DNS-Prefetch-Control': 'on',
  // Prevent IE from executing downloads in site's context
  'X-Download-Options': 'noopen',
  // Disable Adobe products from handling data
  'X-Permitted-Cross-Domain-Policies': 'none',
};

// Production-only headers
const productionHeaders = {
  // HSTS - Strict Transport Security (1 year)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Content Security Policy
const getContentSecurityPolicy = (nonce: string) => {
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'unsafe-inline'", // Required for Next.js
      "'unsafe-eval'", // Required for development only
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://apis.google.com',
      'https://vercel.live',
      'https://vitals.vercel-insights.com',
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components/emotion
      'https://fonts.googleapis.com',
    ],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
    'connect-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://*.google.com',
      'https://*.firebaseio.com',
      'https://*.googleapis.com',
      'https://*.firebase.com',
      'https://*.google-analytics.com',
      'https://vercel.live',
      'https://vitals.vercel-insights.com',
      'wss://*.firebaseio.com',
    ],
    'frame-src': [
      "'self'",
      'https://vercel.live',
      'https://*.firebaseapp.com',
      'https://*.firebase.com',
      'https://apis.google.com',
    ],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
};

// Generate a cryptographically secure nonce
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate request for common attack patterns
function validateRequest(request: NextRequest): { valid: boolean; reason?: string } {
  const url = request.url;
  const pathname = request.nextUrl.pathname;
  
  // Block common attack paths
  const blockedPaths = [
    '/wp-admin',
    '/wp-login',
    '/wp-content',
    '/xmlrpc.php',
    '/admin.php',
    '/.env',
    '/.git',
    '/config.php',
    '/shell',
    '/backdoor',
    '/phpmyadmin',
  ];

  for (const blocked of blockedPaths) {
    if (pathname.toLowerCase().includes(blocked)) {
      return { valid: false, reason: 'Blocked path' };
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
      return { valid: false, reason: 'Suspicious query parameter' };
    }
  }

  // Check for overly long URLs (potential buffer overflow attempts)
  if (url.length > 2048) {
    return { valid: false, reason: 'URL too long' };
  }

  return { valid: true };
}

export function middleware(request: NextRequest) {
  // Validate the request
  const validation = validateRequest(request);
  if (!validation.valid) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Generate nonce for CSP
  const nonce = generateNonce();
  
  // Create response
  const response = NextResponse.next();

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add production-only headers
  if (process.env.NODE_ENV === 'production') {
    Object.entries(productionHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add CSP header in production
    response.headers.set('Content-Security-Policy', getContentSecurityPolicy(nonce));
  }

  // Add nonce to request headers for use in layout
  response.headers.set('x-nonce', nonce);

  // Add cache headers for static assets
  const pathname = request.nextUrl.pathname;
  
  if (pathname.match(/\.(js|css|woff2|png|jpg|jpeg|gif|svg|ico)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // API routes should not be cached
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
