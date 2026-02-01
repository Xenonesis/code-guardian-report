// src/hooks/__tests__/useStreamingCopilot.test.tsx
// Unit tests for useStreamingCopilot hook

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useStreamingCopilot } from "../useStreamingCopilot";
import * as useGitHubCopilotHook from "../useGitHubCopilot";

// Mock useGitHubCopilot
vi.mock("../useGitHubCopilot", () => ({
  useGitHubCopilot: vi.fn(),
}));

// Mock Copilot service
const mockCreateCompletion = vi.fn();
vi.mock("@/services/ai/githubCopilotService", () => ({
  githubCopilotService: {
    createCompletion: mockCreateCompletion,
  },
}));

describe("useStreamingCopilot", () => {
  const mockSelectedModel = {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Test model",
    version: "1.0",
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: ["code"],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGitHubCopilotHook.useGitHubCopilot).mockReturnValue({
      authState: {
        isAuthenticated: true,
        accessToken: "test_token",
        expiresAt: Date.now() + 10000,
        userId: "testuser",
        hasCopilotAccess: true,
      },
      modelSelection: {
        selectedModelId: "gpt-4o",
        availableModels: [mockSelectedModel],
        lastUpdated: new Date(),
      },
      selectedModel: mockSelectedModel,
      isLoading: false,
      error: null,
      authenticateWithToken: vi.fn(),
      fetchModels: vi.fn(),
      selectModel: vi.fn(),
      disconnect: vi.fn(),
      testConnection: vi.fn(),
      generateCompletion: vi.fn(),
    });
  });

  it("should initialize with empty streaming state", () => {
    const { result } = renderHook(() => useStreamingCopilot());

    expect(result.current.streamingState.isStreaming).toBe(false);
    expect(result.current.streamingState.content).toBe("");
    expect(result.current.streamingState.chunks).toEqual([]);
  });

  it("should handle streaming completion", async () => {
    const { result } = renderHook(() => useStreamingCopilot());

    // Mock streaming response
    mockCreateCompletion.mockImplementation((request) => {
      // Simulate streaming chunks
      setTimeout(() => request.onChunk?.("Hello"), 10);
      setTimeout(() => request.onChunk?.(" World"), 20);
      setTimeout(() => request.onComplete?.(), 30);

      return Promise.resolve({
        success: true,
        data: {
          id: "test",
          model: "gpt-4o",
          choices: [{ message: { content: "Hello World" } }],
          usage: { totalTokens: 10 },
        },
      });
    });

    const promise = result.current.streamCompletion([
      { role: "user", content: "Test" },
    ]);

    await waitFor(() => {
      expect(result.current.streamingState.isStreaming).toBe(true);
    });

    const response = await promise;

    expect(response).toBe("Hello World");
    expect(result.current.streamingState.isStreaming).toBe(false);
  });

  it("should handle streaming errors", async () => {
    const { result } = renderHook(() => useStreamingCopilot());

    mockCreateCompletion.mockImplementation((request) => {
      setTimeout(() => request.onError?.(new Error("Test error")), 10);
      return Promise.reject(new Error("Test error"));
    });

    await expect(
      result.current.streamCompletion([{ role: "user", content: "Test" }])
    ).rejects.toThrow("Test error");

    await waitFor(() => {
      expect(result.current.streamingState.error).toBe("Test error");
    });
  });

  it("should reset streaming state", () => {
    const { result } = renderHook(() => useStreamingCopilot());

    // Manually set some state
    result.current.streamingState.content = "Test content";
    result.current.streamingState.chunks = ["Test"];

    // Reset
    result.current.resetStream();

    expect(result.current.streamingState.content).toBe("");
    expect(result.current.streamingState.chunks).toEqual([]);
  });
});
