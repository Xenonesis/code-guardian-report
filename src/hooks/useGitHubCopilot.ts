// src/hooks/useGitHubCopilot.ts
// React hook for GitHub Copilot integration

import { useState, useEffect, useCallback, useRef } from "react";
import { githubCopilotService } from "@/services/ai/githubCopilotService";
import type {
  CopilotAuthState,
  CopilotModel,
  CopilotModelSelection,
} from "@/types/copilot";
import { logger } from "@/utils/logger";
import { useAuth } from "@/lib/auth-context";

export function useGitHubCopilot() {
  const { user, isGitHubUser } = useAuth();
  const [authState, setAuthState] = useState<CopilotAuthState>({
    isAuthenticated: false,
    accessToken: null,
    expiresAt: null,
    userId: null,
    hasCopilotAccess: false,
  });
  const [modelSelection, setModelSelection] = useState<CopilotModelSelection>({
    selectedModelId: null,
    availableModels: [],
    lastUpdated: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedRef = useRef(false);

  /**
   * Authenticate with GitHub token
   */
  const authenticateWithToken = useCallback(async (githubToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result =
        await githubCopilotService.authenticateWithGitHub(githubToken);

      if (result.success) {
        const config = githubCopilotService.getAuthConfig();
        if (config) {
          setAuthState({
            isAuthenticated: true,
            accessToken: config.accessToken,
            expiresAt: config.expiresAt ?? null,
            userId: config.userId ?? null,
            hasCopilotAccess: !result.error,
          });

          // Fetch available models
          await fetchModels();

          if (result.error) {
            setError(result.error);
          }
        }
      } else {
        setError(result.error || "Authentication failed");
      }
    } catch (err) {
      logger.error("Error authenticating with GitHub:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch available models
   */
  const fetchModels = useCallback(async () => {
    try {
      const result = await githubCopilotService.fetchAvailableModels();

      if (result.success) {
        const models: CopilotModel[] = result.models.map((model) => ({
          id: model.id,
          name: model.name,
          description: model.description,
          version: model.version,
          maxTokens: model.maxTokens,
          contextWindow: model.contextWindow,
          capabilities: model.capabilities,
          pricing: model.pricing,
        }));

        // Load selected model from localStorage
        const savedModelId = localStorage.getItem("copilot_selected_model");
        const selectedModelId = savedModelId || models[0]?.id || null;

        setModelSelection({
          selectedModelId,
          availableModels: models,
          lastUpdated: new Date(),
        });
      } else {
        setError(result.error || "Failed to fetch models");
      }
    } catch (err) {
      logger.error("Error fetching models:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch models");
    }
  }, []);

  /**
   * Select a model
   */
  const selectModel = useCallback((modelId: string): void => {
    setModelSelection((prev) => {
      // Validate model exists
      const modelExists = prev.availableModels.some((m) => m.id === modelId);
      if (!modelExists) {
        logger.warn(`Model ${modelId} not found in available models`);
        return prev;
      }

      // Save to localStorage
      localStorage.setItem("copilot_selected_model", modelId);

      return {
        ...prev,
        selectedModelId: modelId,
      };
    });
  }, []);

  /**
   * Get selected model details
   */
  const getSelectedModel = useCallback((): CopilotModel | null => {
    if (!modelSelection.selectedModelId) return null;
    return (
      modelSelection.availableModels.find(
        (m) => m.id === modelSelection.selectedModelId
      ) || null
    );
  }, [modelSelection]);

  /**
   * Disconnect GitHub Copilot
   */
  const disconnect = useCallback(() => {
    githubCopilotService.clearAuth();
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      userId: null,
      hasCopilotAccess: false,
    });
    setModelSelection({
      selectedModelId: null,
      availableModels: [],
      lastUpdated: new Date(),
    });
    localStorage.removeItem("copilot_selected_model");
    localStorage.removeItem("github_oauth_token");
  }, []);

  /**
   * Test connection
   */
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await githubCopilotService.testConnection();

      if (!result.success) {
        setError(result.message);
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Connection test failed";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Generate AI completion using selected model
   */
  const generateCompletion = useCallback(
    async (
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
      options?: { temperature?: number; maxTokens?: number }
    ): Promise<string> => {
      try {
        if (!authState.isAuthenticated) {
          throw new Error("Not authenticated with GitHub Copilot");
        }

        const selectedModel = getSelectedModel();
        if (!selectedModel) {
          throw new Error("No model selected");
        }

        const result = await githubCopilotService.createCompletion({
          model: selectedModel.id,
          messages,
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to generate completion");
        }

        return result.data;
      } catch (err) {
        logger.error("Error generating completion:", err);
        throw err;
      }
    },
    [authState.isAuthenticated, getSelectedModel]
  );

  // Initialize on mount or when user changes (single effect, no duplicates)
  useEffect(() => {
    // Skip if already initialized or not ready
    if (
      hasInitializedRef.current ||
      !isGitHubUser ||
      !user ||
      authState.isAuthenticated
    ) {
      return;
    }

    const initAuth = async () => {
      const githubToken = localStorage.getItem("github_oauth_token");
      if (githubToken) {
        hasInitializedRef.current = true; // Mark as initialized
        logger.debug("Auto-enabling GitHub Copilot for signed-in user");
        await authenticateWithToken(githubToken);
      }
    };

    initAuth();
  }, [isGitHubUser, user, authState.isAuthenticated, authenticateWithToken]);

  // Reset ref when user logs out
  useEffect(() => {
    if (!user) {
      hasInitializedRef.current = false;
    }
  }, [user]);

  return {
    authState,
    modelSelection,
    selectedModel: getSelectedModel(),
    isLoading,
    error,
    authenticateWithToken,
    fetchModels,
    selectModel,
    disconnect,
    testConnection,
    generateCompletion,
  };
}
