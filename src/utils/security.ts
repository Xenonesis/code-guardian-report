/**
 * Security utilities for the application
 */

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// File validation
export function validateFile(file: File): { isValid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip'
  ];
  
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 50MB limit' };
  }
  
  if (!allowedTypes.includes(file.type) && !file.name.endsWith('.zip')) {
    return { isValid: false, error: 'Please select a valid ZIP file' };
  }
  
  return { isValid: true };
}

// Content Security Policy helpers
export const CSP = {
  // Generate nonce for inline scripts
  generateNonce: (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  // Validate external URLs
  isAllowedURL: (url: string): boolean => {
    const allowedDomains = [
      'api.openai.com',
      'api.anthropic.com',
      'generativelanguage.googleapis.com',
      'localhost',
      '127.0.0.1'
    ];
    
    try {
      const urlObj = new URL(url);
      return allowedDomains.some(domain => 
        urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }
};

// API key security
export const APIKeySecurity = {
  // Mask API key for display
  maskApiKey: (key: string): string => {
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.slice(0, 4) + '*'.repeat(key.length - 8) + key.slice(-4);
  },
  
  // Validate API key format
  validateKeyFormat: (key: string, provider: string): boolean => {
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      claude: /^[a-zA-Z0-9-_]{20,}$/,
      gemini: /^[a-zA-Z0-9-_]{20,}$/
    };
    
    const pattern = patterns[provider as keyof typeof patterns];
    return pattern ? pattern.test(key) : key.length >= 20;
  },
  
  // Encrypt API key for storage (basic obfuscation)
  encryptKey: (key: string): string => {
    return btoa(key.split('').reverse().join(''));
  },
  
  // Decrypt API key from storage
  decryptKey: (encryptedKey: string): string => {
    try {
      return atob(encryptedKey).split('').reverse().join('');
    } catch {
      return encryptedKey; // Fallback for unencrypted keys
    }
  }
};

// Rate limiting
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier)!;
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const validRequests = requests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// XSS protection
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// CSRF protection
export const CSRF = {
  generateToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },
  
  validateToken: (token: string, storedToken: string): boolean => {
    return token === storedToken && token.length === 64;
  }
};

export default {
  sanitizeInput,
  validateFile,
  CSP,
  APIKeySecurity,
  RateLimiter,
  escapeHtml,
  CSRF
};
