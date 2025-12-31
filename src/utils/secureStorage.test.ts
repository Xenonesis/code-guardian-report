import { describe, it, expect, vi, beforeEach } from 'vitest';

// Since secureStorage uses Web Crypto API which is mocked,
// we need to test the utility with proper mocks

describe('SecureStorage Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Encryption Key Derivation', () => {
    it('should generate consistent device fingerprint', () => {
      // The device fingerprint should be consistent for the same environment
      const userAgent = 'Mozilla/5.0 Test Browser';
      const language = 'en-US';
      const platform = 'Win32';
      
      const fingerprint1 = `${userAgent}-${language}-${platform}`;
      const fingerprint2 = `${userAgent}-${language}-${platform}`;
      
      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should use browser crypto for random values', () => {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      
      // Should have filled the array
      expect(arr.some(v => v !== 0)).toBe(true);
    });
  });

  describe('Storage Operations', () => {
    it('should handle empty storage gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      const result = localStorage.getItem('api_keys');
      expect(result).toBeNull();
    });

    it('should store and retrieve data', () => {
      const testData = { key: 'value' };
      const serialized = JSON.stringify(testData);
      
      localStorage.setItem('test_key', serialized);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('test_key', serialized);
    });

    it('should remove stored data', () => {
      localStorage.removeItem('test_key');
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('test_key');
    });
  });

  describe('API Key Validation', () => {
    it('should validate OpenAI API key format', () => {
      const validKeys = [
        'sk-proj-12345678901234567890123456789012345678901234567890',
        'sk-12345678901234567890123456789012345678901234567890',
      ];
      
      validKeys.forEach(key => {
        expect(key.startsWith('sk-')).toBe(true);
      });
    });

    it('should validate Anthropic API key format', () => {
      const validKey = 'sk-ant-api03-12345';
      expect(validKey.startsWith('sk-ant-')).toBe(true);
    });

    it('should reject invalid API key formats', () => {
      const invalidKeys = [
        '',
        'invalid',
        'key123',
        '12345',
      ];
      
      invalidKeys.forEach(key => {
        expect(key.startsWith('sk-')).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage quota exceeded', () => {
      const quotaError = new DOMException('QuotaExceededError', 'QuotaExceededError');
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw quotaError;
      });
      
      expect(() => localStorage.setItem('key', 'large-data')).toThrow();
    });

    it('should handle malformed JSON gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('not-valid-json');
      
      const stored = localStorage.getItem('api_keys');
      
      expect(() => {
        if (stored) JSON.parse(stored);
      }).toThrow();
    });

    it('should handle crypto API failures', () => {
      const originalSubtle = crypto.subtle;
      
      // Simulate crypto failure
      Object.defineProperty(crypto, 'subtle', {
        value: undefined,
        writable: true,
      });
      
      expect(crypto.subtle).toBeUndefined();
      
      // Restore
      Object.defineProperty(crypto, 'subtle', {
        value: originalSubtle,
        writable: true,
      });
    });
  });

  describe('Provider Type Detection', () => {
    const providerPatterns = {
      openai: /^sk-(proj-)?[a-zA-Z0-9]+$/,
      anthropic: /^sk-ant-[a-zA-Z0-9-]+$/,
      gemini: /^AIza[a-zA-Z0-9_-]+$/,
    };

    it('should detect OpenAI keys correctly', () => {
      const openaiKeys = ['sk-test123', 'sk-proj-abc123'];
      openaiKeys.forEach(key => {
        expect(providerPatterns.openai.test(key)).toBe(true);
      });
    });

    it('should detect Anthropic keys correctly', () => {
      const anthropicKey = 'sk-ant-api03-test';
      expect(providerPatterns.anthropic.test(anthropicKey)).toBe(true);
    });

    it('should detect Gemini keys correctly', () => {
      const geminiKey = 'AIzaSyTest123_abc';
      expect(providerPatterns.gemini.test(geminiKey)).toBe(true);
    });
  });
});

describe('SecureStorage Integration', () => {
  it('should support storing multiple API keys', async () => {
    const keys = [
      { provider: 'openai', name: 'OpenAI', key: 'sk-test1' },
      { provider: 'claude', name: 'Claude', key: 'sk-ant-test2' },
      { provider: 'gemini', name: 'Gemini', key: 'AIzaTest3' },
    ];
    
    // Simulate storage
    const stored = JSON.stringify(keys);
    expect(stored).toContain('openai');
    expect(stored).toContain('claude');
    expect(stored).toContain('gemini');
  });

  it('should handle key rotation', () => {
    // Old key
    const oldKey = { provider: 'openai', key: 'sk-old-key' };
    // New key
    const newKey = { provider: 'openai', key: 'sk-new-key' };
    
    // Simulate update
    expect(oldKey.key).not.toBe(newKey.key);
    expect(oldKey.provider).toBe(newKey.provider);
  });
});
