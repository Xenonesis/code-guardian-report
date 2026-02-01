// src/services/ai/githubCopilotService.ts
// Service to handle GitHub Copilot API integration and authentication

import { logger } from "@/utils/logger";
import { copilotAnalytics } from "./copilotAnalytics";

export interface GitHubCopilotModel {
  id: string;
  name: string;
  description: string;
  version: string;
  maxTokens: number;
  capabilities: string[];
  contextWindow: number;
  pricing?: {
    promptTokenPrice: number;
    completionTokenPrice: number;
  };
}

export interface GitHubCopilotAuthConfig {
  accessToken: string;
  tokenType: string;
  expiresAt?: number;
  scope: string[];
  userId?: string;
  hasCopilotAccess?: boolean;
}

export interface CopilotCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  onChunk?: (chunk: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface CopilotCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  created: number;
}

/**
 * GitHub Copilot Service for AI model integration
 */
export class GitHubCopilotService {
  private static instance: GitHubCopilotService;
  private readonly STORAGE_KEY = "github_copilot_auth";
  private authConfig: GitHubCopilotAuthConfig | null = null;

  private constructor() {
    this.loadAuthConfig();
  }

  public static getInstance(): GitHubCopilotService {
    if (!GitHubCopilotService.instance) {
      GitHubCopilotService.instance = new GitHubCopilotService();
    }
    return GitHubCopilotService.instance;
  }

  /**
   * Load authentication config from secure storage
   */
  private async loadAuthConfig(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Check if token is expired
        if (config.expiresAt && Date.now() < config.expiresAt) {
          this.authConfig = config;
        } else {
          // Token expired, clear it
          this.clearAuth();
        }
      }
    } catch (error) {
      logger.error("Error loading GitHub Copilot auth config:", error);
    }
  }

  /**
   * Save authentication config to secure storage
   */
  private async saveAuthConfig(config: GitHubCopilotAuthConfig): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      this.authConfig = config;
    } catch (error) {
      logger.error("Error saving GitHub Copilot auth config:", error);
      throw new Error("Failed to save authentication configuration");
    }
  }

  /**
   * Authenticate with GitHub token
   * Note: This uses the GitHub OAuth token obtained from Firebase Auth
   */
  public async authenticateWithGitHub(
    githubAccessToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      logger.debug("Authenticating with GitHub for Copilot access...");

      // Validate the GitHub token by fetching user info
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!userResponse.ok) {
        throw new Error("Invalid GitHub token");
      }

      const userData = await userResponse.json();

      // Note: We skip the subscription check to avoid console spam
      // The actual API calls will determine if the user has Copilot access
      // This provides a cleaner user experience without false negatives
      const hasCopilotAccess = false; // Will be determined on first API call
      const copilotCheckMessage =
        "Subscription status will be verified on first use";

      logger.debug(
        "GitHub token validated. Copilot access will be verified on first API call."
      );

      // Store auth config with Copilot access status
      const authConfig: GitHubCopilotAuthConfig = {
        accessToken: githubAccessToken,
        tokenType: "Bearer",
        scope: ["user", "copilot"],
        userId: userData.login,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        hasCopilotAccess,
      };

      await this.saveAuthConfig(authConfig);

      logger.debug(
        `GitHub Copilot authentication successful. User: ${userData.login}, ${copilotCheckMessage}`
      );

      // Return success regardless of Copilot subscription status
      // The integration can work with or without a subscription
      return {
        success: true,
        error: undefined, // No error - authentication succeeded
      };
    } catch (error) {
      logger.error("GitHub Copilot authentication failed:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Authentication failed. Please try again.",
      };
    }
  }

  /**
   * Clear authentication
   */
  public clearAuth(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.authConfig = null;
    logger.debug("GitHub Copilot authentication cleared");
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    if (!this.authConfig) return false;
    if (this.authConfig.expiresAt && Date.now() >= this.authConfig.expiresAt) {
      this.clearAuth();
      return false;
    }
    return true;
  }

  /**
   * Get current auth config
   */
  public getAuthConfig(): GitHubCopilotAuthConfig | null {
    return this.authConfig;
  }

  /**
   * Check if user has Copilot access
   */
  public hasCopilotAccess(): boolean {
    return this.authConfig?.hasCopilotAccess ?? false;
  }

  /**
   * Fetch available GitHub Copilot models from the API
   */
  public async fetchAvailableModels(): Promise<{
    success: boolean;
    models: GitHubCopilotModel[];
    error?: string;
  }> {
    try {
      if (!this.isAuthenticated() || !this.authConfig) {
        return {
          success: false,
          models: [],
          error: "Not authenticated. Please sign in with GitHub first.",
        };
      }

      // Try to fetch real models from GitHub Copilot API
      try {
        const response = await fetch("/api/copilot/models", {
          headers: {
            Authorization: `Bearer ${this.authConfig.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Map API response to our model format
          const modelsMap = new Map<string, GitHubCopilotModel>();

          data.data?.forEach((model: any) => {
            // Handle capabilities - can be string, array, or undefined
            let capabilities: string[] = ["code", "text"];
            if (model.capabilities) {
              if (Array.isArray(model.capabilities)) {
                capabilities = model.capabilities;
              } else if (typeof model.capabilities === "string") {
                capabilities = [model.capabilities];
              }
            }

            const modelId = model.id || model.model;

            // Only add if not already in map (deduplication)
            if (!modelsMap.has(modelId)) {
              modelsMap.set(modelId, {
                id: modelId,
                name: model.name || modelId,
                description: model.description || `${modelId} model`,
                version: model.version || "latest",
                maxTokens: model.max_tokens || 4096,
                contextWindow: model.context_window || model.max_tokens || 4096,
                capabilities,
              });
            }
          });

          const models = Array.from(modelsMap.values());

          if (models.length > 0) {
            logger.debug(
              `Fetched ${models.length} unique models from GitHub Copilot API`
            );
            return { success: true, models };
          }
        }
      } catch (apiError) {
        logger.warn(
          "Failed to fetch models from API, using fallback list:",
          apiError
        );
      }

      // Fallback: Use known GitHub Copilot models
      // These are the models typically available through GitHub Copilot
      const fallbackModels: GitHubCopilotModel[] = [
        {
          id: "gpt-4o",
          name: "GPT-4o",
          description:
            "Most advanced model with multimodal capabilities, optimized for code analysis",
          version: "2024-05-13",
          maxTokens: 128000,
          contextWindow: 128000,
          capabilities: ["code", "text", "vision", "reasoning"],
        },
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          description: "Fast and powerful GPT-4 model with 128k context window",
          version: "2024-04-09",
          maxTokens: 128000,
          contextWindow: 128000,
          capabilities: ["code", "text", "vision"],
        },
        {
          id: "gpt-4",
          name: "GPT-4",
          description: "Most capable GPT-4 model for complex code analysis",
          version: "0613",
          maxTokens: 8192,
          contextWindow: 8192,
          capabilities: ["code", "text"],
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          description: "Fast and efficient model for quick analysis",
          version: "0125",
          maxTokens: 16384,
          contextWindow: 16384,
          capabilities: ["code", "text"],
        },
      ];

      logger.debug(
        `Using ${fallbackModels.length} fallback GitHub Copilot models`
      );
      return { success: true, models: fallbackModels };
    } catch (error) {
      logger.error("Error fetching GitHub Copilot models:", error);
      return {
        success: false,
        models: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch available models",
      };
    }
  }

  /**
   * Make a completion request to GitHub Copilot
   */
  public async createCompletion(request: CopilotCompletionRequest): Promise<{
    success: boolean;
    data?: CopilotCompletionResponse;
    error?: string;
  }> {
    // If streaming is requested, use streaming method
    if (request.stream && request.onChunk) {
      return this.createStreamingCompletion(request);
    }

    // Start tracking
    const endTracking = copilotAnalytics.startTracking(request.model);

    try {
      if (!this.isAuthenticated() || !this.authConfig) {
        endTracking(false, undefined, new Error("Not authenticated"));
        return {
          success: false,
          error: "Not authenticated. Please sign in with GitHub first.",
        };
      }

      // Use our API proxy to avoid CORS issues
      const response = await fetch("/api/copilot/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authConfig.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
          stream: false,
          n: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          errorMessage = errorText || response.statusText;
        }

        // If unauthorized, clear auth
        if (response.status === 401 || response.status === 403) {
          this.clearAuth();
          errorMessage =
            "GitHub Copilot access denied. This may indicate:\n" +
            "1. No active Copilot subscription\n" +
            "2. Token expired or invalid\n" +
            "3. Insufficient permissions\n\n" +
            "Please ensure you have an active GitHub Copilot subscription.";
        }

        endTracking(false, undefined, new Error(errorMessage));
        return { success: false, error: errorMessage };
      }

      const data: CopilotCompletionResponse = await response.json();

      // Update Copilot access status on successful call
      if (this.authConfig && !this.authConfig.hasCopilotAccess) {
        this.authConfig.hasCopilotAccess = true;
        await this.saveAuthConfig(this.authConfig);
        logger.debug("Copilot access confirmed via successful API call");
      }

      // Track successful request with token usage
      endTracking(true, {
        prompt: data.usage.promptTokens,
        completion: data.usage.completionTokens,
        total: data.usage.totalTokens,
      });

      return { success: true, data };
    } catch (error) {
      logger.error("GitHub Copilot completion request failed:", error);
      endTracking(
        false,
        undefined,
        error instanceof Error ? error : new Error("Unknown error")
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate completion",
      };
    }
  }

  /**
   * Create a streaming completion request to GitHub Copilot
   */
  private async createStreamingCompletion(
    request: CopilotCompletionRequest
  ): Promise<{
    success: boolean;
    data?: CopilotCompletionResponse;
    error?: string;
  }> {
    // Start tracking
    const endTracking = copilotAnalytics.startTracking(request.model);

    try {
      if (!this.isAuthenticated() || !this.authConfig) {
        const error = new Error("Not authenticated");
        endTracking(false, undefined, error);
        request.onError?.(error);
        return {
          success: false,
          error: "Not authenticated. Please sign in with GitHub first.",
        };
      }

      // Use our API proxy to avoid CORS issues
      const response = await fetch("/api/copilot/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authConfig.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 2048,
          stream: true,
          n: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed (${response.status})`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          errorMessage = errorText || response.statusText;
        }

        if (response.status === 401 || response.status === 403) {
          this.clearAuth();
          errorMessage =
            "GitHub Copilot access denied. This may indicate:\n" +
            "1. No active Copilot subscription\n" +
            "2. Token expired or invalid\n" +
            "3. Insufficient permissions\n\n" +
            "Please ensure you have an active GitHub Copilot subscription.";
        }

        const error = new Error(errorMessage);
        endTracking(false, undefined, error);
        request.onError?.(error);
        return { success: false, error: errorMessage };
      }

      // Process streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let totalTokens = 0;
      let promptTokens = 0;
      let completionTokens = 0;

      if (!reader) {
        const error = new Error("No response body");
        endTracking(false, undefined, error);
        request.onError?.(error);
        return { success: false, error: "No response body" };
      }

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);

              if (data === "[DONE]") {
                continue;
              }

              try {
                const parsed = JSON.parse(data);

                // Extract content delta
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  fullContent += delta;
                  request.onChunk?.(delta);
                }

                // Extract token usage if available
                if (parsed.usage) {
                  promptTokens = parsed.usage.prompt_tokens || 0;
                  completionTokens = parsed.usage.completion_tokens || 0;
                  totalTokens = parsed.usage.total_tokens || 0;
                }
              } catch (parseError) {
                logger.warn("Failed to parse streaming chunk:", parseError);
              }
            }
          }
        }

        // Track successful request
        endTracking(true, {
          prompt: promptTokens,
          completion: completionTokens,
          total: totalTokens || fullContent.length, // Estimate if not provided
        });

        request.onComplete?.();

        // Return mock response structure
        const mockResponse: CopilotCompletionResponse = {
          id: `stream_${Date.now()}`,
          model: request.model,
          choices: [
            {
              index: 0,
              message: {
                role: "assistant",
                content: fullContent,
              },
              finishReason: "stop",
            },
          ],
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: totalTokens || fullContent.length,
          },
          created: Date.now(),
        };

        return { success: true, data: mockResponse };
      } catch (streamError) {
        const error =
          streamError instanceof Error
            ? streamError
            : new Error("Streaming error");
        endTracking(false, undefined, error);
        request.onError?.(error);
        throw error;
      }
    } catch (error) {
      logger.error("GitHub Copilot streaming request failed:", error);
      const err = error instanceof Error ? error : new Error("Unknown error");
      endTracking(false, undefined, err);
      request.onError?.(err);
      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Test the connection and authentication
   */
  public async testConnection(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (!this.isAuthenticated()) {
        return {
          success: false,
          message: "Not authenticated",
        };
      }

      const result = await this.createCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Say 'Hello, Code Guardian!' if you're working correctly.",
          },
        ],
        maxTokens: 50,
      });

      if (result.success && result.data) {
        return {
          success: true,
          message: "Connection successful! GitHub Copilot is ready.",
        };
      }

      return {
        success: false,
        message: result.error || "Connection test failed",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
      };
    }
  }
}

// Export singleton instance
export const githubCopilotService = GitHubCopilotService.getInstance();
