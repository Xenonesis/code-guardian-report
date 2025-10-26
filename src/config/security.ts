/**
 * Production security configuration
 * Provides security headers and CSP rules
 */

export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Content Security Policy
 * Restricts resource loading to trusted sources
 */
export const CSP_DIRECTIVES = {
  'default-src': ['\'self\''],
  'script-src': [
    '\'self\'',
    '\'unsafe-inline\'', // Required for Vite dev server
    '\'unsafe-eval\'', // Required for some Firebase features
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  'style-src': [
    '\'self\'',
    '\'unsafe-inline\'', // Required for CSS-in-JS and Tailwind
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    '\'self\'',
    'data:',
    'blob:',
    'https:',
  ],
  'font-src': [
    '\'self\'',
    'data:',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    '\'self\'',
    'https://*.firebaseio.com',
    'https://*.googleapis.com',
    'https://*.firebase.com',
    'https://*.google-analytics.com',
    'wss://*.firebaseio.com',
  ],
  'worker-src': [
    '\'self\'',
    'blob:',
  ],
  'manifest-src': ['\'self\''],
  'frame-ancestors': ['\'none\''],
  'base-uri': ['\'self\''],
  'form-action': ['\'self\''],
};

/**
 * Generate CSP header value from directives
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Apply security headers to HTML meta tags
 * This is a fallback when server-side headers cannot be set
 */
export function applySecurityHeaders(): void {
  const head = document.head;

  // Add CSP meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = generateCSPHeader();
  head.appendChild(cspMeta);

  // Add X-Content-Type-Options meta tag
  const contentTypeMeta = document.createElement('meta');
  contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
  contentTypeMeta.content = 'nosniff';
  head.appendChild(contentTypeMeta);

  // Add Referrer-Policy meta tag
  const referrerMeta = document.createElement('meta');
  referrerMeta.name = 'referrer';
  referrerMeta.content = 'strict-origin-when-cross-origin';
  head.appendChild(referrerMeta);
}

/**
 * Production-only security features
 */
export const PRODUCTION_CONFIG = {
  // Rate limiting (implement on server side)
  rateLimitRequests: 100,
  rateLimitWindow: 60000, // 1 minute

  // Input validation
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedFileTypes: ['.zip', '.jar', '.war', '.ear'],
  maxFilesPerUpload: 10,

  // Session security
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  tokenExpiry: 60 * 60 * 1000, // 1 hour

  // API security
  apiTimeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > PRODUCTION_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${PRODUCTION_CONFIG.maxFileSize / 1024 / 1024}MB)`,
    };
  }

  // Check file type
  const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!PRODUCTION_CONFIG.allowedFileTypes.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${PRODUCTION_CONFIG.allowedFileTypes.join(', ')}`,
    };
  }

  return { valid: true };
}
