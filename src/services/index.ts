// Service exports for better imports

// Storage services
export * from './storage/analysisStorage';
export * from './storage/firebaseAnalysisStorage';
export * from './storage/offlineManager';

// AI services
export * from './ai/aiService';
export * from './ai/aiFixSuggestionsService';
export * from './ai/naturalLanguageDescriptionService';

// Security services
export * from './security/securityAnalysisEngine';
export * from './security/secretDetectionService';
export * from './security/secureCodeSearchService';

// PWA services
export * from './pwa/pushNotifications';
export * from './pwa/pushNotificationService';
export * from './pwa/backgroundSync';
export * from './pwa/backgroundSyncService';
export * from './pwa/enhancedBackgroundSyncService';
export * from './pwa/pwaAnalytics';
export * from './pwa/pwaAnalyticsService';
export * from './pwa/pwaIntegration';

// Detection services
export * from './detection/languageDetectionService';
export * from './detection/frameworkDetectionEngine';
export * from './detection/codeProvenanceService';

// Export services
export * from './export/pdfExportService';

// API services
export * from './api/githubService';

// Analysis services
export * from './analysis/MetricsCalculator';
export * from './analysis/SecurityAnalyzer';