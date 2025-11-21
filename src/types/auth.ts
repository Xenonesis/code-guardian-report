// Authentication and user-related types

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  preferences?: UserPreferences;
  // GitHub-specific fields
  githubUsername?: string;
  githubId?: string;
  isGitHubUser?: boolean;
  githubMetadata?: GitHubMetadata;
}

export interface GitHubMetadata {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  bio?: string;
  company?: string;
  location?: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  analysis: AnalysisPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  analysisComplete: boolean;
  securityAlerts: boolean;
  weeklyReport: boolean;
}

export interface AnalysisPreferences {
  autoSave: boolean;
  defaultSeverityThreshold: 'critical' | 'high' | 'medium' | 'low';
  includeTestFiles: boolean;
  includeDependencies: boolean;
  outputFormat: 'json' | 'pdf' | 'html';
}

export interface PrivacyPreferences {
  shareUsageData: boolean;
  allowAnalytics: boolean;
  shareErrorReports: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
}

// Firebase Auth types
export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}