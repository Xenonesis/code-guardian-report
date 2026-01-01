/**
 * Environment utilities for Next.js
 * Uses process.env with NEXT_PUBLIC_ prefix for client-side variables
 */

export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';
export const mode = process.env.NODE_ENV || 'development';

/**
 * Check if code is running on the client side
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if code is running on the server side
 */
export const isServer = typeof window === 'undefined';
