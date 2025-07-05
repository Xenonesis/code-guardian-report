/**
 * Utility functions for AI integration and API key management
 */

export interface AIProvider {
  id: string;
  name: string;
  apiKey: string;
}

// Interface for the actual stored API key format
interface StoredAPIKey {
  id: string;
  provider: string;
  key: string;
  name: string;
}

/**
 * Check if any AI API keys are configured
 */
export function hasConfiguredApiKeys(): boolean {
  try {
    const keys = localStorage.getItem('aiApiKeys');
    const parsedKeys: StoredAPIKey[] = keys ? JSON.parse(keys) : [];
    return parsedKeys.length > 0 && parsedKeys.some(key => key.key && key.key.trim().length > 0);
  } catch (error) {
    console.error('Error checking API keys:', error);
    return false;
  }
}

/**
 * Get configured AI providers (converted to expected format)
 */
export function getConfiguredProviders(): AIProvider[] {
  try {
    const keys = localStorage.getItem('aiApiKeys');
    const storedKeys: StoredAPIKey[] = keys ? JSON.parse(keys) : [];

    // Convert stored format to expected format
    return storedKeys.map(key => ({
      id: key.provider,
      name: key.name,
      apiKey: key.key
    }));
  } catch (error) {
    console.error('Error parsing stored API keys:', error);
    return [];
  }
}

/**
 * Get the primary (first available) AI provider
 */
export function getPrimaryProvider(): AIProvider | null {
  const providers = getConfiguredProviders();
  return providers.length > 0 ? providers[0] : null;
}

/**
 * Check if a specific provider is configured
 */
export function isProviderConfigured(providerId: string): boolean {
  try {
    const keys = localStorage.getItem('aiApiKeys');
    const storedKeys: StoredAPIKey[] = keys ? JSON.parse(keys) : [];
    return storedKeys.some(key => key.provider === providerId && key.key.trim().length > 0);
  } catch (error) {
    console.error('Error checking provider configuration:', error);
    return false;
  }
}

/**
 * Format AI provider name for display
 */
export function formatProviderName(providerId: string): string {
  const providerNames: Record<string, string> = {
    'openai': 'OpenAI GPT',
    'gemini': 'Google Gemini',
    'claude': 'Anthropic Claude'
  };
  return providerNames[providerId] || providerId;
}

/**
 * Validate API key format for different providers
 */
export function validateApiKey(providerId: string, apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false, error: 'API key cannot be empty' };
  }

  switch (providerId) {
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { isValid: false, error: 'OpenAI API key should start with "sk-"' };
      }
      if (apiKey.length < 20) {
        return { isValid: false, error: 'OpenAI API key appears to be too short' };
      }
      break;
    
    case 'gemini':
      if (apiKey.length < 20) {
        return { isValid: false, error: 'Gemini API key appears to be too short' };
      }
      break;
    
    case 'claude':
      if (apiKey.length < 20) {
        return { isValid: false, error: 'Claude API key appears to be too short' };
      }
      break;
  }

  return { isValid: true };
}

/**
 * Estimate token count for text (rough approximation)
 */
export function estimateTokenCount(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token limits
 */
export function truncateForTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokenCount(text);
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  const maxChars = maxTokens * 4;
  return text.substring(0, maxChars - 3) + '...';
}

/**
 * Create a storage event listener for API key changes
 */
export function createApiKeyChangeListener(callback: () => void): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'aiApiKeys') {
      callback();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Generate a unique request ID for tracking AI requests
 */
export function generateRequestId(): string {
  return `ai_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format error messages for user display
 */
export function formatAIError(error: unknown): string {
  if (error instanceof Error) {
    // Handle common API errors
    if (error.message.includes('API key')) {
      return 'Invalid or missing API key. Please check your AI configuration.';
    }
    if (error.message.includes('rate limit') || error.message.includes('quota')) {
      return 'API rate limit exceeded. Please try again later or check your API usage.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again with a shorter input.';
    }
    return error.message;
  }
  return 'An unexpected error occurred while processing your request.';
}

/**
 * Check if the current environment supports AI features
 */
export function isAISupported(): boolean {
  // Check for required browser features
  return (
    typeof localStorage !== 'undefined' &&
    typeof fetch !== 'undefined' &&
    typeof JSON !== 'undefined'
  );
}

/**
 * Get AI feature availability status
 */
export function getAIFeatureStatus(): {
  isSupported: boolean;
  hasApiKeys: boolean;
  primaryProvider: string | null;
  message: string;
} {
  const isSupported = isAISupported();
  const hasKeys = hasConfiguredApiKeys();
  const primaryProvider = getPrimaryProvider();

  let message = '';
  if (!isSupported) {
    message = 'AI features are not supported in this environment.';
  } else if (!hasKeys) {
    message = 'Configure AI API keys to enable intelligent insights.';
  } else {
    message = `AI insights powered by ${formatProviderName(primaryProvider!.id)}.`;
  }

  return {
    isSupported,
    hasApiKeys: hasKeys,
    primaryProvider: primaryProvider?.id || null,
    message
  };
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create a retry mechanism for AI API calls
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Cache management for AI responses
 */
export class AIResponseCache {
  private cache = new Map<string, { data: string; timestamp: number; ttl: number }>();
  
  set(key: string, data: string, ttlMinutes: number = 30): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const aiResponseCache = new AIResponseCache();
