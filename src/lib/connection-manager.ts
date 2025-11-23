// src/lib/connection-manager.ts
import { db, enableNetwork, disableNetwork } from './firebase';
import { recordWebChannelFailure, clearWebChannelFailures } from './firestore-config';

import { logger } from '@/utils/logger';
interface ConnectionState {
  isOnline: boolean;
  lastCheck: number;
  retryCount: number;
  lastRetryTime: number;
  backoffDelay: number;
}

class ConnectionManager {
  private state: ConnectionState = {
    isOnline: true,
    lastCheck: Date.now(),
    retryCount: 0,
    lastRetryTime: 0,
    backoffDelay: 5000 // Start with 5 second delay
  };

  private listeners: Array<(isOnline: boolean) => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isRecovering = false;

  constructor() {
    this.initializeConnectionMonitoring();
  }

  private initializeConnectionMonitoring() {
    // Listen to browser online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Start periodic connection checks with longer intervals
    this.startPeriodicChecks();
  }

  private handleOnline() {
    logger.debug('Browser detected online');
    this.updateConnectionState(true);
    // Don't immediately reconnect, let natural operations handle it
    this.state.retryCount = 0;
    this.state.backoffDelay = 5000;
  }

  private handleOffline() {
    this.updateConnectionState(false);
  }

  private updateConnectionState(isOnline: boolean) {
    if (this.state.isOnline !== isOnline) {
      this.state.isOnline = isOnline;
      this.state.lastCheck = Date.now();
      this.notifyListeners(isOnline);
    }
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        // Silent error handling
      }
    });
  }

  private startPeriodicChecks() {
    this.checkInterval = setInterval(() => {
      this.checkConnection();
    }, 60000); // Check every 60 seconds (less aggressive)
  }

  private async checkConnection() {
    // Skip check if we're currently recovering
    if (this.isRecovering) {
      return;
    }

    try {
      // Simple fetch to check internet connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!this.state.isOnline) {
        this.updateConnectionState(true);
        this.state.retryCount = 0;
        this.state.backoffDelay = 5000;
      }
    } catch (error) {
      if (this.state.isOnline) {
        this.updateConnectionState(false);
      }
    }
  }

  public isOnline(): boolean {
    return this.state.isOnline && navigator.onLine;
  }

  public addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async handleFirestoreError(error: Error): Promise<boolean> {
    const errorMessage = error.message.toLowerCase();
    const now = Date.now();
    
    // Check if it's a connection-related error
    if (errorMessage.includes('network') || 
        errorMessage.includes('unavailable') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('transport error') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('400') ||
        errorMessage.includes('bad request') ||
        errorMessage.includes('webchannel')) {
      
      // Record WebChannel failures for future optimization
      if (errorMessage.includes('webchannel') || errorMessage.includes('400') || errorMessage.includes('bad request')) {
        recordWebChannelFailure();
      }
      
      // Implement exponential backoff to prevent connection storms
      if (now - this.state.lastRetryTime < this.state.backoffDelay) {
        return false;
      }
      
      this.state.retryCount++;
      this.state.lastRetryTime = now;
      
      // Only attempt recovery for the first few errors
      if (this.state.retryCount <= 3 && !this.isRecovering) {
        this.isRecovering = true;
        
        try {
          // Gentle connection reset with longer delays
          await disableNetwork(db);
          
          // Wait longer between disable/enable
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          await enableNetwork(db);
          
          // Wait for connection to stabilize
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Reset retry count on successful recovery
          this.state.retryCount = 0;
          this.state.backoffDelay = 5000;
          this.isRecovering = false;
          
          // Clear WebChannel failure history on successful recovery
          clearWebChannelFailures();
          
          return true;
        } catch (resetError) {
          this.isRecovering = false;
          
          // Increase backoff delay exponentially
          this.state.backoffDelay = Math.min(this.state.backoffDelay * 2, 60000); // Max 1 minute
        }
      } else if (this.state.retryCount > 3) {
        this.updateConnectionState(false);
        
        // Reset after a longer period
        setTimeout(() => {
          this.state.retryCount = 0;
          this.state.backoffDelay = 5000;
        }, 300000); // Reset after 5 minutes
        
        return false;
      }
    }
    
    return false; // No retry possible
  }

  public destroy() {
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Export singleton instance
export const connectionManager = new ConnectionManager();