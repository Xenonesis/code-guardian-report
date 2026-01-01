// Application constants

export const APP_CONFIG = {
  name: "Code Guardian Report",
  version: "9.0.0",
  description: "Next-Generation AI-Powered Security Analysis Platform",
  author: "Code Guardian Team",
  repository: "https://github.com/your-org/code-guardian-report",
} as const;

export const API_ENDPOINTS = {
  github: "https://api.github.com",
  analytics: "/api/analytics",
  push: "/api/push",
} as const;

export const STORAGE_KEYS = {
  theme: "codeGuardian_theme",
  userPreferences: "codeGuardian_userPreferences",
  analysisHistory: "codeGuardian_analysisHistory",
  authToken: "codeGuardian_authToken",
} as const;

export const ANALYSIS_LIMITS = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 1000,
  timeout: 300000, // 5 minutes
  retries: 3,
} as const;

export const SECURITY_THRESHOLDS = {
  critical: 9.0,
  high: 7.0,
  medium: 4.0,
  low: 1.0,
} as const;

export const UI_CONSTANTS = {
  sidebarWidth: 280,
  headerHeight: 64,
  footerHeight: 120,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
} as const;

export const FEATURE_FLAGS = {
  enableAI: true,
  enablePWA: true,
  enableFirebase: true,
  enableAnalytics: true,
  enableOfflineMode: true,
} as const;
