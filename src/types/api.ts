// API-related types and interfaces

export interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

export interface APIError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// GitHub API types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: GitHubUser;
  private: boolean;
  description: string | null;
  url: string;
  languages_url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  url: string;
  type: 'User' | 'Organization';
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: 'base64';
}

// Firebase API types
export interface FirestoreDocument {
  id: string;
  data: Record<string, any>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

export interface FirebaseStorageFile {
  name: string;
  bucket: string;
  fullPath: string;
  size: number;
  contentType: string;
  downloadURL: string;
  metadata: Record<string, any>;
}

// Analytics API types
export interface AnalyticsEvent {
  name: string;
  parameters: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  averageAnalysisTime: number;
  topIssueTypes: Array<{ type: string; count: number }>;
  userRetention: {
    day1: number;
    day7: number;
    day30: number;
  };
}

// AI Service types
export interface AIRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}