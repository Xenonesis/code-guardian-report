/**
 * Debug utilities for AI functionality
 */

import { hasConfiguredApiKeys, getConfiguredProviders, getAIFeatureStatus } from './aiUtils';

interface APIKey {
  id: string;
  name: string;
  apiKey: string;
}

interface AnalysisResults {
  issues?: Array<{
    owaspCategory?: string;
    [key: string]: unknown;
  }>;
  totalFiles?: number;
  summary?: unknown;
  metrics?: unknown;
}

interface NetworkRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export function debugAIConfiguration(): void {
  console.group('🔍 AI Configuration Debug');
  
  // Check localStorage directly
  const rawKeys = localStorage.getItem('aiApiKeys');
  console.log('Raw localStorage aiApiKeys:', rawKeys);
  
  try {
    const parsedKeys = rawKeys ? JSON.parse(rawKeys) : [];
    console.log('Parsed API keys:', parsedKeys);
    console.log('Number of keys:', parsedKeys.length);
    
    if (parsedKeys.length > 0) {
      parsedKeys.forEach((key: APIKey, index: number) => {
        console.log(`Key ${index + 1}:`, {
          id: key.id,
          name: key.name,
          hasApiKey: !!key.apiKey,
          keyLength: key.apiKey ? key.apiKey.length : 0,
          keyPrefix: key.apiKey ? key.apiKey.substring(0, 10) + '...' : 'N/A'
        });
      });
    }
  } catch (error) {
    console.error('Error parsing API keys:', error);
  }
  
  // Check utility functions
  console.log('hasConfiguredApiKeys():', hasConfiguredApiKeys());
  console.log('getConfiguredProviders():', getConfiguredProviders());
  console.log('getAIFeatureStatus():', getAIFeatureStatus());
  
  console.groupEnd();
}

export function debugAnalysisResults(results: AnalysisResults): void {
  console.group('📊 Analysis Results Debug');
  
  console.log('Results object:', results);
  console.log('Issues count:', results?.issues?.length || 0);
  console.log('Total files:', results?.totalFiles || 0);
  console.log('Has summary:', !!results?.summary);
  console.log('Has metrics:', !!results?.metrics);
  
  if (results?.issues?.length > 0) {
    console.log('Sample issues:', results.issues.slice(0, 3));
    
    // Check for OWASP categories
    const owaspCategories = [...new Set(results.issues.map((i) => i.owaspCategory).filter(Boolean))];
    console.log('OWASP categories found:', owaspCategories);
  }
  
  console.groupEnd();
}

export function debugAIServiceCall(methodName: string, params: unknown): void {
  console.group(`🤖 AI Service Call: ${methodName}`);
  console.log('Method:', methodName);
  console.log('Parameters:', params);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

export function debugAIServiceResponse(methodName: string, response: string | null, error?: Error): void {
  console.group(`📝 AI Service Response: ${methodName}`);
  
  if (error) {
    console.error('Error:', error);
    console.log('Error type:', typeof error);
    console.log('Error message:', error.message || 'No message');
    console.log('Error stack:', error.stack || 'No stack');
  } else {
    console.log('Success response length:', response?.length || 0);
    console.log('Response preview:', response?.substring(0, 200) + '...');
  }
  
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

export function testAPIKeyStorage(): void {
  console.group('🔧 API Key Storage Test');
  
  // Test setting and getting API keys
  const testKey = {
    id: 'test',
    name: 'Test Provider',
    apiKey: 'test-key-12345'
  };
  
  try {
    // Save test key
    localStorage.setItem('aiApiKeys', JSON.stringify([testKey]));
    console.log('✅ Test key saved successfully');
    
    // Retrieve test key
    const retrieved = localStorage.getItem('aiApiKeys');
    const parsed = JSON.parse(retrieved || '[]');
    console.log('✅ Test key retrieved:', parsed);
    
    // Test utility functions
    console.log('hasConfiguredApiKeys() with test key:', hasConfiguredApiKeys());
    
    // Clean up
    localStorage.removeItem('aiApiKeys');
    console.log('✅ Test key cleaned up');
    
  } catch (error) {
    console.error('❌ API key storage test failed:', error);
  }
  
  console.groupEnd();
}

export function debugComponentState(componentName: string, state: unknown): void {
  console.group(`🎯 Component State: ${componentName}`);
  console.log('State:', state);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

export function debugNetworkRequest(url: string, options: NetworkRequestOptions): void {
  console.group('🌐 Network Request Debug');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', options.headers || {});
  console.log('Body preview:', options.body ? options.body.substring(0, 200) + '...' : 'No body');
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

export function debugNetworkResponse(url: string, response: Response, data?: unknown): void {
  console.group('📡 Network Response Debug');
  console.log('URL:', url);
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  
  if (data) {
    console.log('Response data type:', typeof data);
    console.log('Response data preview:', JSON.stringify(data).substring(0, 200) + '...');
  }
  
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

// Global debug flag
export const AI_DEBUG = true;

// Conditional logging
export function debugLog(message: string, ...args: unknown[]): void {
  if (AI_DEBUG) {
    console.log(`[AI Debug] ${message}`, ...args);
  }
}

export function debugError(message: string, error: unknown): void {
  if (AI_DEBUG) {
    console.error(`[AI Error] ${message}`, error);
  }
}

export function debugWarn(message: string, ...args: unknown[]): void {
  if (AI_DEBUG) {
    console.warn(`[AI Warning] ${message}`, ...args);
  }
}
