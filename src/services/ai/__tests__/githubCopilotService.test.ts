// src/services/ai/__tests__/githubCopilotService.test.ts
// Unit tests for GitHub Copilot service

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { GitHubCopilotService } from "../githubCopilotService";

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

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("GitHubCopilotService", () => {
  let service: GitHubCopilotService;

  beforeEach(() => {
    localStorageMock.clear();
    mockFetch.mockClear();
    // Get fresh instance for each test
    service = (GitHubCopilotService as any).instance = null;
    service = GitHubCopilotService.getInstance();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = GitHubCopilotService.getInstance();
      const instance2 = GitHubCopilotService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Authentication", () => {
    it("should successfully authenticate with valid GitHub token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "testuser", id: 12345 }),
      });

      const result = await service.authenticateWithGitHub("ghp_test_token");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(service.isAuthenticated()).toBe(true);
    });

    it("should fail authentication with invalid token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const result = await service.authenticateWithGitHub("invalid_token");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(service.isAuthenticated()).toBe(false);
    });

    it("should detect Copilot access", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "testuser", id: 12345 }),
      });

      const result = await service.authenticateWithGitHub("ghp_test_token");

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should warn when Copilot access not detected", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: "testuser", id: 12345 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      const result = await service.authenticateWithGitHub("ghp_test_token");

      expect(result.success).toBe(true);
      expect(result.error).toContain("subscription not detected");
    });

    it("should clear authentication", () => {
      localStorageMock.setItem(
        "github_copilot_auth",
        JSON.stringify({ accessToken: "test" })
      );

      service.clearAuth();

      expect(localStorageMock.getItem("github_copilot_auth")).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it("should check token expiration", async () => {
      const expiredConfig = {
        accessToken: "test_token",
        tokenType: "Bearer",
        scope: ["user"],
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      localStorageMock.setItem(
        "github_copilot_auth",
        JSON.stringify(expiredConfig)
      );

      // Create new instance to load expired token
      service = (GitHubCopilotService as any).instance = null;
      service = GitHubCopilotService.getInstance();

      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe("Model Discovery", () => {
    beforeEach(async () => {
      // Setup authenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: "testuser", id: 12345 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assignee: { login: "testuser" } }),
        });

      await service.authenticateWithGitHub("ghp_test_token");
      mockFetch.mockClear();
    });

    it("should fetch available models when authenticated", async () => {
      const result = await service.fetchAvailableModels();

      expect(result.success).toBe(true);
      expect(result.models.length).toBeGreaterThan(0);
      expect(result.models[0]).toHaveProperty("id");
      expect(result.models[0]).toHaveProperty("name");
      expect(result.models[0]).toHaveProperty("capabilities");
    });

    it("should include GPT-4o model", async () => {
      const result = await service.fetchAvailableModels();

      const gpt4o = result.models.find((m) => m.id === "gpt-4o");
      expect(gpt4o).toBeDefined();
      expect(gpt4o?.capabilities).toContain("code");
      expect(gpt4o?.maxTokens).toBe(128000);
    });

    it("should fail when not authenticated", async () => {
      service.clearAuth();
      const result = await service.fetchAvailableModels();

      expect(result.success).toBe(false);
      expect(result.error).toContain("Not authenticated");
    });
  });

  describe("Completion Requests", () => {
    beforeEach(async () => {
      // Setup authenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: "testuser", id: 12345 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assignee: { login: "testuser" } }),
        });

      await service.authenticateWithGitHub("ghp_test_token");
      mockFetch.mockClear();
    });

    it("should create successful completion", async () => {
      const mockResponse = {
        id: "test-id",
        model: "gpt-4o",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Test response" },
            finishReason: "stop",
          },
        ],
        usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
        created: Date.now(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await service.createCompletion({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test prompt" }],
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.githubcopilot.com/chat/completions",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      );
    });

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal server error",
      });

      const result = await service.createCompletion({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test prompt" }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should clear auth on 401/403 errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => "Unauthorized",
      });

      await service.createCompletion({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test prompt" }],
      });

      expect(service.isAuthenticated()).toBe(false);
    });

    it("should fail when not authenticated", async () => {
      service.clearAuth();

      const result = await service.createCompletion({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test prompt" }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Not authenticated");
    });

    it("should include custom parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "test",
          choices: [{ message: { content: "response" } }],
          usage: { totalTokens: 10 },
        }),
      });

      await service.createCompletion({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test" }],
        temperature: 0.9,
        maxTokens: 1000,
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.temperature).toBe(0.9);
      expect(callBody.max_tokens).toBe(1000);
    });
  });

  describe("Connection Testing", () => {
    it("should test connection successfully", async () => {
      // Setup authenticated state
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: "testuser" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ assignee: { login: "testuser" } }),
        });

      await service.authenticateWithGitHub("ghp_test_token");
      mockFetch.mockClear();

      // Mock completion response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Hello!" } }],
          usage: { totalTokens: 10 },
        }),
      });

      const result = await service.testConnection();

      expect(result.success).toBe(true);
      expect(result.message).toContain("successful");
    });

    it("should fail connection test when not authenticated", async () => {
      const result = await service.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toContain("Not authenticated");
    });
  });

  describe("Token Storage", () => {
    it("should persist auth config to localStorage", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ login: "testuser", id: 12345 }),
      });

      await service.authenticateWithGitHub("ghp_test_token");

      const stored = localStorageMock.getItem("github_copilot_auth");
      expect(stored).toBeDefined();

      const config = JSON.parse(stored!);
      expect(config.accessToken).toBe("ghp_test_token");
      expect(config.userId).toBe("testuser");
    });

    it("should load auth config from localStorage", async () => {
      const config = {
        accessToken: "ghp_test_token",
        tokenType: "Bearer",
        scope: ["user"],
        userId: "testuser",
        expiresAt: Date.now() + 10000,
      };

      localStorageMock.setItem("github_copilot_auth", JSON.stringify(config));

      // Create new instance to test loading
      service = (GitHubCopilotService as any).instance = null;
      service = GitHubCopilotService.getInstance();

      expect(service.isAuthenticated()).toBe(true);
      expect(service.getAuthConfig()?.userId).toBe("testuser");
    });
  });
});
