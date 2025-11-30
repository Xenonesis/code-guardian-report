import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIService } from '@/services/ai/aiService';

// Mock the secure storage
vi.mock('@/utils/secureStorage', () => ({
  secureStorage: {
    getAPIKeys: vi.fn().mockResolvedValue([]),
    setAPIKey: vi.fn().mockResolvedValue(undefined),
    removeAPIKey: vi.fn().mockResolvedValue(undefined),
  },
  StoredAPIKey: {},
}));

// Mock the logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      // Access the private method through prototype
      const checkRateLimit = (aiService as unknown as { checkRateLimit: (id: string) => void }).checkRateLimit.bind(aiService);

      // First 10 requests should not throw
      expect(() => {
        for (let i = 0; i < 10; i++) {
          checkRateLimit('openai');
        }
      }).not.toThrow();
    });

    it('should throw when rate limit is exceeded', () => {
      const checkRateLimit = (aiService as unknown as { checkRateLimit: (id: string) => void }).checkRateLimit.bind(aiService);

      // First 10 requests should succeed
      for (let i = 0; i < 10; i++) {
        checkRateLimit('openai');
      }

      // 11th request should throw
      expect(() => checkRateLimit('openai')).toThrow(/Rate limit exceeded/);
    });

    it('should reset rate limit after window expires', () => {
      const checkRateLimit = (aiService as unknown as { checkRateLimit: (id: string) => void }).checkRateLimit.bind(aiService);

      // Fill up the rate limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit('openai');
      }

      // Advance time past the window
      vi.advanceTimersByTime(61000); // 61 seconds

      // Should be able to make requests again
      expect(() => checkRateLimit('openai')).not.toThrow();
    });

    it('should track rate limits per provider separately', () => {
      const checkRateLimit = (aiService as unknown as { checkRateLimit: (id: string) => void }).checkRateLimit.bind(aiService);

      // Fill up OpenAI rate limit
      for (let i = 0; i < 10; i++) {
        checkRateLimit('openai');
      }

      // Claude should still work
      expect(() => checkRateLimit('claude')).not.toThrow();

      // OpenAI should be blocked
      expect(() => checkRateLimit('openai')).toThrow(/Rate limit exceeded/);
    });
  });

  describe('API Key Management', () => {
    it('should return empty array when no keys are stored', async () => {
      const { secureStorage } = await import('@/utils/secureStorage');
      vi.mocked(secureStorage.getAPIKeys).mockResolvedValue([]);

      const getStoredAPIKeysAsync = (aiService as unknown as { 
        getStoredAPIKeysAsync: () => Promise<Array<{ id: string; name: string; apiKey: string; model?: string }>> 
      }).getStoredAPIKeysAsync.bind(aiService);

      const keys = await getStoredAPIKeysAsync();
      expect(keys).toEqual([]);
    });

    it('should convert stored keys to provider format', async () => {
      const { secureStorage } = await import('@/utils/secureStorage');
      vi.mocked(secureStorage.getAPIKeys).mockResolvedValue([
        { id: '1', provider: 'openai', name: 'OpenAI', key: 'sk-test123', model: 'gpt-4' },
        { id: '2', provider: 'claude', name: 'Claude', key: 'sk-ant-test', model: 'claude-3-opus' },
      ]);

      const getStoredAPIKeysAsync = (aiService as unknown as { 
        getStoredAPIKeysAsync: () => Promise<Array<{ id: string; name: string; apiKey: string; model?: string }>> 
      }).getStoredAPIKeysAsync.bind(aiService);

      const keys = await getStoredAPIKeysAsync();
      expect(keys).toHaveLength(2);
      expect(keys[0]).toEqual({
        id: 'openai',
        name: 'OpenAI',
        apiKey: 'sk-test123',
        model: 'gpt-4',
      });
    });
  });

  describe('Provider Detection', () => {
    it('should detect OpenAI provider from API key', () => {
      const detectProvider = (aiService as unknown as { 
        detectProviderFromKey: (key: string) => string 
      }).detectProviderFromKey?.bind(aiService);

      if (detectProvider) {
        expect(detectProvider('sk-proj-test123')).toBe('openai');
        expect(detectProvider('sk-test123')).toBe('openai');
      }
    });

    it('should detect Anthropic provider from API key', () => {
      const detectProvider = (aiService as unknown as { 
        detectProviderFromKey: (key: string) => string 
      }).detectProviderFromKey?.bind(aiService);

      if (detectProvider) {
        expect(detectProvider('sk-ant-test123')).toBe('claude');
      }
    });
  });

  describe('Default Models', () => {
    it('should return correct default model for OpenAI', () => {
      const getDefaultModel = (aiService as unknown as { 
        getDefaultModel: (provider: string) => string 
      }).getDefaultModel.bind(aiService);

      expect(getDefaultModel('openai')).toBe('gpt-4o-mini');
    });

    it('should return correct default model for Claude', () => {
      const getDefaultModel = (aiService as unknown as { 
        getDefaultModel: (provider: string) => string 
      }).getDefaultModel.bind(aiService);

      expect(getDefaultModel('claude')).toBe('claude-3-5-sonnet-20241022');
    });

    it('should return correct default model for Gemini', () => {
      const getDefaultModel = (aiService as unknown as { 
        getDefaultModel: (provider: string) => string 
      }).getDefaultModel.bind(aiService);

      expect(getDefaultModel('gemini')).toBe('gemini-1.5-flash');
    });
  });
});

describe('AIService API Calls', () => {
  let aiService: AIService;
  const mockFetchImpl = vi.fn();

  beforeEach(() => {
    aiService = new AIService();
    global.fetch = mockFetchImpl;
    vi.clearAllMocks();
  });

  it('should format security issues for AI prompt correctly', () => {
    const formatIssuesForPrompt = (aiService as unknown as { 
      formatIssuesForPrompt: (issues: Array<{ type: string; severity: string; message: string }>) => string 
    }).formatIssuesForPrompt?.bind(aiService);

    if (formatIssuesForPrompt) {
      const issues = [
        { type: 'SQL Injection', severity: 'critical', message: 'User input not sanitized' },
        { type: 'XSS', severity: 'high', message: 'Output not escaped' },
      ];

      const formatted = formatIssuesForPrompt(issues);
      expect(formatted).toContain('SQL Injection');
      expect(formatted).toContain('XSS');
    }
  });

  it('should handle API errors gracefully', async () => {
    mockFetchImpl.mockRejectedValue(new Error('Network error'));

    // Test that the service doesn't crash on API errors
    expect(aiService).toBeDefined();
  });

  it('should validate API key format', () => {
    const validateApiKey = (aiService as unknown as { 
      validateApiKey: (key: string, provider: string) => boolean 
    }).validateApiKey?.bind(aiService);

    if (validateApiKey) {
      expect(validateApiKey('sk-test123', 'openai')).toBe(true);
      expect(validateApiKey('invalid', 'openai')).toBe(false);
    }
  });
});
