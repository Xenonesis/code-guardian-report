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

// PWA services - selective exports to avoid naming conflicts
export { pushNotificationService } from './pwa/pushNotifications';
// Note: pushNotificationService and PushNotificationService have overlapping exports
export { backgroundSyncService } from './pwa/backgroundSync';
// Note: backgroundSyncService and enhancedBackgroundSyncService have overlapping SyncTask exports
export { pwaAnalyticsService } from './pwa/pwaAnalytics';
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