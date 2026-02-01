// src/hooks/useStreamingCopilot.ts
// React hook for streaming AI responses from GitHub Copilot

import { useState, useCallback, useRef } from "react";
import { githubCopilotService } from "@/services/ai/githubCopilotService";
import { useGitHubCopilot } from "./useGitHubCopilot";
import { logger } from "@/utils/logger";

export interface StreamingState {
  isStreaming: boolean;
  content: string;
  error: string | null;
  chunks: string[];
}

export function useStreamingCopilot() {
  const { authState, selectedModel } = useGitHubCopilot();
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    content: "",
    error: null,
    chunks: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Stream a completion from GitHub Copilot
   */
  const streamCompletion = useCallback(
    async (
      messages: Array<{
        role: "system" | "user" | "assistant";
        content: string;
      }>,
      options?: {
        temperature?: number;
        maxTokens?: number;
        modelOverride?: string;
      }
    ): Promise<string> => {
      if (!authState.isAuthenticated) {
        throw new Error("Not authenticated with GitHub Copilot");
      }

      const model = options?.modelOverride || selectedModel?.id;
      if (!model) {
        throw new Error("No model selected");
      }

      // Reset state
      setStreamingState({
        isStreaming: true,
        content: "",
        error: null,
        chunks: [],
      });

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      return new Promise<string>((resolve, reject) => {
        let fullContent = "";

        void githubCopilotService
          .createCompletion({
            model,
            messages,
            temperature: options?.temperature,
            maxTokens: options?.maxTokens,
            stream: true,
            onChunk: (chunk: string) => {
              fullContent += chunk;
              setStreamingState((prev) => ({
                ...prev,
                content: fullContent,
                chunks: [...prev.chunks, chunk],
              }));
            },
            onComplete: () => {
              setStreamingState((prev) => ({
                ...prev,
                isStreaming: false,
              }));
              resolve(fullContent);
            },
            onError: (error: Error) => {
              setStreamingState((prev) => ({
                ...prev,
                isStreaming: false,
                error: error.message,
              }));
              reject(error);
            },
          })
          .catch((error) => {
            logger.error("Streaming completion failed:", error);
            setStreamingState((prev) => ({
              ...prev,
              isStreaming: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to stream completion",
            }));
            reject(error);
          });
      });
    },
    [authState.isAuthenticated, selectedModel]
  );

  /**
   * Cancel the current streaming request
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamingState((prev) => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  /**
   * Reset streaming state
   */
  const resetStream = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      content: "",
      error: null,
      chunks: [],
    });
  }, []);

  return {
    streamingState,
    streamCompletion,
    cancelStream,
    resetStream,
    isAuthenticated: authState.isAuthenticated,
    selectedModel,
  };
}
