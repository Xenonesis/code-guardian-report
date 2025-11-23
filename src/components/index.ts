// Component exports for better imports

// Common components
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { LoadingSpinner } from './common/LoadingSpinner';
export { ScrollToTop } from './common/ScrollToTop';
export { ConnectionStatus } from './common/ConnectionStatus';

// Layout components
export { Navigation } from './layout/Navigation';
export { Footer } from './layout/Footer';
export { PageLayout } from './layout/PageLayout';
export { ModernDashboard } from './layout/ModernDashboard';
export { HeroSection } from './layout/HeroSection';
export { AboutPageLayout } from './layout/AboutPageLayout';

// Auth components
export { AuthModal } from './auth/AuthModal';
export { AccountConflictModal } from './auth/AccountConflictModal';
export { default as UserDashboard } from './auth/UserDashboard';

// Analysis components
export { AnalysisHistoryModal } from './analysis/AnalysisHistoryModal';
export { EnhancedSecurityResults } from './analysis/EnhancedSecurityResults';
export { ResultsTable } from './analysis/ResultsTable';
export { default as AdvancedSearch } from './analysis/AdvancedSearch';

// PWA components
export { PWAInstallPrompt } from './pwa/PWAInstallPrompt';
export { PWAUpdateNotification } from './pwa/PWAUpdateNotification';
export { PWAStatus } from './pwa/PWAStatus';
export { PWAFeatureShowcase } from './pwa/PWAFeatureShowcase';
export { PWAShareButton } from './pwa/PWAShareButton';
export { OfflineIndicator } from './pwa/OfflineIndicator';

// Firebase components
export { FirebaseAnalyticsDashboard } from './firebase/FirebaseAnalyticsDashboard';
export { FirebaseTestPanel } from './firebase/FirebaseTestPanel';
export { FirestoreStatus } from './firebase/FirestoreStatus';
export { FirestoreHealthChecker } from './firebase/FirestoreHealthChecker';
export { FirestoreErrorNotification } from './firebase/FirestoreErrorNotification';
export { StorageStatus } from './firebase/StorageStatus';

// AI components
export { AISecurityInsights } from './ai/AISecurityInsights';
export { AIKeyManager } from './ai/AIKeyManager';
export { default as FloatingChatBot } from './ai/FloatingChatBot';
export { default as PromptGenerator } from './ai/PromptGenerator';

// Language components
export { LanguageDetectionDisplay } from './language/LanguageDetectionDisplay';
export { LanguageDetectionSummary } from './language/LanguageDetectionSummary';
export { default as MultiLanguageSupportDisplay } from './language/MultiLanguageSupportDisplay';

// Notification components
export { default as NotificationCenter } from './notifications/NotificationCenter';
export { default as NotificationPreferences } from './notifications/NotificationPreferences';
export { default as NotificationBadge } from './notifications/NotificationBadge';

// Export components
export { default as DataExport } from './export/DataExport';
export { PDFDownloadButton } from './export/PDFDownloadButton';