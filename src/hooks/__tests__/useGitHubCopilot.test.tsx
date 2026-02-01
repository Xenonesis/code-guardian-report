// src/hooks/__tests__/useGitHubCopilot.test.tsx
// Unit tests for useGitHubCopilot hook

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useGitHubCopilot } from "../useGitHubCopilot";
import * as authContext from "@/lib/auth-context";

// Mock auth context
vi.mock("@/lib/auth-context", () => ({
  useAuth: vi.fn(),
}));

// Mock Copilot service
vi.mock("@/services/ai/githubCopilotService", () => ({
  githubCopilotService: {
    isAuthenticated: vi.fn(),
    getAuthConfig: vi.fn(),
    authenticateWithGitHub: vi.fn(),
    fetchAvailableModels: vi.fn(),
    clearAuth: vi.fn(),
    testConnection: vi.fn(),
    createCompletion: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("useGitHubCopilot", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(authContext.useAuth).mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      isGitHubUser: false,
      signInWithGithub: vi.fn(),
      logout: vi.fn(),
      accountConflict: {
        isOpen: false,
        email: "",
        existingProvider: "password",
        attemptedProvider: "github.com",
        pendingCredential: null,
      },
      setAccountConflict: vi.fn(),
      handleSignInWithExisting: vi.fn(),
      isLinkingAccounts: false,
    });
  });

  it("should initialize with unauthenticated state", () => {
    const { result } = renderHook(() => useGitHubCopilot());

    expect(result.current.authState.isAuthenticated).toBe(false);
    expect(result.current.modelSelection.availableModels).toEqual([]);
  });

  it("should handle model selection", () => {
    const { result } = renderHook(() => useGitHubCopilot());

    // Mock available models
    result.current.modelSelection.availableModels = [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "Test model",
        version: "1.0",
        maxTokens: 128000,
        contextWindow: 128000,
        capabilities: ["code"],
      },
    ];

    // Select a model
    result.current.selectModel("gpt-4o");

    expect(localStorageMock.getItem("copilot_selected_model")).toBe("gpt-4o");
  });

  it("should disconnect and clear data", () => {
    const { result } = renderHook(() => useGitHubCopilot());

    // Set some data
    localStorageMock.setItem("copilot_selected_model", "gpt-4o");
    localStorageMock.setItem("github_oauth_token", "test_token");

    // Disconnect
    result.current.disconnect();

    expect(localStorageMock.getItem("copilot_selected_model")).toBeNull();
    expect(localStorageMock.getItem("github_oauth_token")).toBeNull();
  });
});
