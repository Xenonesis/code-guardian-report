// src/types/copilot.ts
// Type definitions for GitHub Copilot integration

export interface CopilotAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  expiresAt: number | null;
  userId: string | null;
  hasCopilotAccess: boolean;
}

export interface CopilotModel {
  id: string;
  name: string;
  description: string;
  version: string;
  maxTokens: number;
  contextWindow: number;
  capabilities: string[];
  isSelected?: boolean;
  pricing?: {
    promptTokenPrice: number;
    completionTokenPrice: number;
  };
}

export interface CopilotModelSelection {
  selectedModelId: string | null;
  availableModels: CopilotModel[];
  lastUpdated: Date;
}

export interface CopilotAnalysisRequest {
  model: string;
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CopilotAnalysisResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

export interface CopilotError {
  code: string;
  message: string;
  details?: any;
}

export interface CopilotSettings {
  autoActivateOnSignIn: boolean;
  defaultModel: string;
  enableModelSuggestions: boolean;
  showUsageMetrics: boolean;
}
