/**
 * Secure Storage Utility
 * Provides encrypted storage for sensitive data like API keys using Web Crypto API
 */

import { logger } from './logger';

// Encryption key derived from a combination of factors for basic obfuscation
// Note: For production use, consider server-side key management
const ENCRYPTION_KEY_SEED = 'code-guardian-secure-v1';
const STORAGE_PREFIX = 'cg_secure_';

interface EncryptedData {
  iv: string;
  data: string;
  version: number;
}

export interface StoredAPIKey {
  id: string;
  provider: string;
  key: string;
  name: string;
  model: string;
  createdAt?: number;
}

class SecureStorageService {
  private cryptoKey: CryptoKey | null = null;
  private isInitialized = false;

  /**
   * Initialize the encryption key
   */
  private async init(): Promise<void> {
    if (this.isInitialized && this.cryptoKey) return;

    try {
      // Generate a key from the seed using PBKDF2
      const encoder = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(ENCRYPTION_KEY_SEED),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      // Use a fixed salt for consistency (in production, use per-user salt)
      const salt = encoder.encode('cg-salt-v1');

      this.cryptoKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize secure storage:', error);
      throw new Error('Secure storage initialization failed');
    }
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(data: string): Promise<EncryptedData> {
    await this.init();
    if (!this.cryptoKey) throw new Error('Encryption key not available');

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.cryptoKey,
      encoder.encode(data)
    );

    return {
      iv: this.arrayBufferToBase64(iv),
      data: this.arrayBufferToBase64(encryptedBuffer),
      version: 1,
    };
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: EncryptedData): Promise<string> {
    await this.init();
    if (!this.cryptoKey) throw new Error('Encryption key not available');

    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const data = this.base64ToArrayBuffer(encryptedData.data);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.cryptoKey,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Store API keys securely
   */
  async storeAPIKeys(keys: StoredAPIKey[]): Promise<void> {
    try {
      const keysWithTimestamp = keys.map(key => ({
        ...key,
        createdAt: key.createdAt || Date.now(),
      }));

      const encrypted = await this.encrypt(JSON.stringify(keysWithTimestamp));
      localStorage.setItem(`${STORAGE_PREFIX}api_keys`, JSON.stringify(encrypted));
      
      // Also keep a backup of the old format for migration
      // This will be removed in future versions
      logger.debug('API keys stored securely');
    } catch (error) {
      logger.error('Failed to store API keys securely:', error);
      throw error;
    }
  }

  /**
   * Retrieve API keys securely
   */
  async getAPIKeys(): Promise<StoredAPIKey[]> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}api_keys`);
      
      if (!stored) {
        // Check for legacy unencrypted keys and migrate them
        return await this.migrateLegacyKeys();
      }

      const encryptedData: EncryptedData = JSON.parse(stored);
      const decrypted = await this.decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch (error) {
      logger.error('Failed to retrieve API keys:', error);
      // Attempt to recover from legacy storage
      return await this.migrateLegacyKeys();
    }
  }

  /**
   * Migrate legacy unencrypted API keys to secure storage
   */
  private async migrateLegacyKeys(): Promise<StoredAPIKey[]> {
    try {
      const legacyKeys = localStorage.getItem('aiApiKeys');
      if (!legacyKeys) return [];

      const keys: StoredAPIKey[] = JSON.parse(legacyKeys);
      
      // Store them securely
      await this.storeAPIKeys(keys);
      
      // Remove legacy storage after successful migration
      localStorage.removeItem('aiApiKeys');
      
      logger.debug('Successfully migrated legacy API keys to secure storage');
      return keys;
    } catch (error) {
      logger.error('Failed to migrate legacy keys:', error);
      return [];
    }
  }

  /**
   * Add a new API key
   */
  async addAPIKey(key: StoredAPIKey): Promise<void> {
    const keys = await this.getAPIKeys();
    
    // Check for duplicates
    const existingIndex = keys.findIndex(k => k.provider === key.provider);
    if (existingIndex >= 0) {
      keys[existingIndex] = { ...key, createdAt: Date.now() };
    } else {
      keys.push({ ...key, createdAt: Date.now() });
    }
    
    await this.storeAPIKeys(keys);
  }

  /**
   * Remove an API key
   */
  async removeAPIKey(provider: string): Promise<void> {
    const keys = await this.getAPIKeys();
    const filtered = keys.filter(k => k.provider !== provider);
    await this.storeAPIKeys(filtered);
  }

  /**
   * Clear all API keys
   */
  async clearAPIKeys(): Promise<void> {
    localStorage.removeItem(`${STORAGE_PREFIX}api_keys`);
    localStorage.removeItem('aiApiKeys'); // Also clear legacy
  }

  /**
   * Check if secure storage is available
   */
  isSecureStorageAvailable(): boolean {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.subtle.encrypt === 'function';
  }
}

export const secureStorage = new SecureStorageService();
