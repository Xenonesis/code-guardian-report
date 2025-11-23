/**
 * Webhook Manager
 * Handles webhook registration, validation, and processing for GitHub/GitLab
 */

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { enhancedNotifications } from '@/utils/enhancedToastNotifications';

import { logger } from '@/utils/logger';
export type WebhookProvider = 'github' | 'gitlab' | 'bitbucket';
export type WebhookEvent = 
  | 'push' 
  | 'pull_request' 
  | 'pull_request_review'
  | 'commit_comment'
  | 'repository'
  | 'release';

export interface WebhookConfig {
  id?: string;
  userId: string;
  provider: WebhookProvider;
  repositoryId: string;
  repositoryName: string;
  repositoryUrl: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  lastTriggered?: number;
  createdAt: number;
  updatedAt: number;
}

export interface WebhookPayload {
  provider: WebhookProvider;
  event: WebhookEvent;
  repository: {
    id: string;
    name: string;
    fullName: string;
    url: string;
  };
  sender: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  changes?: {
    files: Array<{
      filename: string;
      status: 'added' | 'modified' | 'removed';
      additions: number;
      deletions: number;
      patch?: string;
    }>;
    commits: Array<{
      id: string;
      message: string;
      author: string;
      timestamp: number;
    }>;
  };
  pullRequest?: {
    number: number;
    title: string;
    branch: string;
    baseBranch: string;
    state: 'open' | 'closed' | 'merged';
    url: string;
  };
  timestamp: number;
}

export interface MonitoringRule {
  id?: string;
  userId: string;
  webhookId: string;
  name: string;
  description: string;
  conditions: {
    filePatterns?: string[]; // Glob patterns like "*.js", "src/**/*.ts"
    branches?: string[]; // Branch names like "main", "develop"
    authors?: string[]; // Author usernames
    minSeverity?: 'Critical' | 'High' | 'Medium' | 'Low';
    customRuleIds?: string[]; // Apply specific custom rules
  };
  actions: {
    scanImmediately: boolean;
    blockPR: boolean; // Block PR if issues found
    notifyUsers: string[]; // User IDs to notify
    createIssue: boolean; // Create GitHub issue
    sendEmail: boolean;
  };
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

class WebhookManagerClass {
  private webhookCollection = 'webhooks';
  private monitoringRulesCollection = 'monitoringRules';
  private webhookLogsCollection = 'webhookLogs';

  /**
   * Generate a secure webhook secret
   */
  generateSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Create a new webhook configuration
   */
  async createWebhook(config: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt' | 'secret'>): Promise<WebhookConfig> {
    try {
      const secret = this.generateSecret();
      const now = Date.now();
      
      const webhookData: Omit<WebhookConfig, 'id'> = {
        ...config,
        secret,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.webhookCollection), webhookData);
      
      const webhook: WebhookConfig = {
        ...webhookData,
        id: docRef.id,
      };

      enhancedNotifications.success('Webhook Created', {
        message: `Monitoring enabled for ${config.repositoryName}`,
        category: 'system',
        priority: 'normal',
      });

      return webhook;
    } catch (error) {
      logger.error('Failed to create webhook:', error);
      enhancedNotifications.error('Webhook Creation Failed', {
        message: error instanceof Error ? error.message : 'Unknown error',
        category: 'system',
        priority: 'high',
      });
      throw error;
    }
  }

  /**
   * Get webhooks for a user
   */
  async getWebhooks(userId: string): Promise<WebhookConfig[]> {
    try {
      const q = query(
        collection(db, this.webhookCollection),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as WebhookConfig));
    } catch (error) {
      logger.error('Failed to get webhooks:', error);
      return [];
    }
  }

  /**
   * Update webhook configuration
   */
  async updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): Promise<void> {
    try {
      const webhookRef = doc(db, this.webhookCollection, webhookId);
      await updateDoc(webhookRef, {
        ...updates,
        updatedAt: Date.now(),
      });

      enhancedNotifications.success('Webhook Updated', {
        category: 'system',
        priority: 'low',
      });
    } catch (error) {
      logger.error('Failed to update webhook:', error);
      enhancedNotifications.error('Webhook Update Failed', {
        category: 'system',
        priority: 'high',
      });
      throw error;
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.webhookCollection, webhookId));
      
      // Also delete associated monitoring rules
      const rulesQuery = query(
        collection(db, this.monitoringRulesCollection),
        where('webhookId', '==', webhookId)
      );
      const rulesSnapshot = await getDocs(rulesQuery);
      const deletePromises = rulesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      enhancedNotifications.success('Webhook Deleted', {
        category: 'system',
        priority: 'low',
      });
    } catch (error) {
      logger.error('Failed to delete webhook:', error);
      enhancedNotifications.error('Webhook Deletion Failed', {
        category: 'system',
        priority: 'high',
      });
      throw error;
    }
  }

  /**
   * Validate webhook signature (GitHub style)
   */
  async validateSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
      );

      const expectedSignature = 'sha256=' + Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return signature === expectedSignature;
    } catch (error) {
      logger.error('Failed to validate signature:', error);
      return false;
    }
  }

  /**
   * Process webhook payload
   */
  async processWebhook(
    webhookId: string,
    payload: WebhookPayload
  ): Promise<void> {
    try {
      // Log the webhook event
      await this.logWebhookEvent(webhookId, payload);

      // Update last triggered time
      await this.updateWebhook(webhookId, {
        lastTriggered: Date.now(),
      });

      // Get monitoring rules for this webhook
      const rules = await this.getMonitoringRules(webhookId);

      // Apply rules and trigger actions
      for (const rule of rules) {
        if (!rule.enabled) continue;

        const shouldTrigger = this.evaluateRule(rule, payload);
        if (shouldTrigger) {
          await this.executeRuleActions(rule, payload);
        }
      }

      enhancedNotifications.info('Repository Event', {
        message: `${payload.event} on ${payload.repository.name}`,
        category: 'analysis',
        priority: 'normal',
      });
    } catch (error) {
      logger.error('Failed to process webhook:', error);
      enhancedNotifications.error('Webhook Processing Failed', {
        category: 'system',
        priority: 'high',
      });
    }
  }

  /**
   * Log webhook event
   */
  private async logWebhookEvent(
    webhookId: string,
    payload: WebhookPayload
  ): Promise<void> {
    try {
      await addDoc(collection(db, this.webhookLogsCollection), {
        webhookId,
        event: payload.event,
        repository: payload.repository.name,
        sender: payload.sender.username,
        timestamp: payload.timestamp,
        processed: true,
      });
    } catch (error) {
      logger.error('Failed to log webhook event:', error);
    }
  }

  /**
   * Create monitoring rule
   */
  async createMonitoringRule(rule: Omit<MonitoringRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<MonitoringRule> {
    try {
      const now = Date.now();
      const ruleData: Omit<MonitoringRule, 'id'> = {
        ...rule,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, this.monitoringRulesCollection), ruleData);
      
      return {
        ...ruleData,
        id: docRef.id,
      };
    } catch (error) {
      logger.error('Failed to create monitoring rule:', error);
      throw error;
    }
  }

  /**
   * Get monitoring rules for a webhook
   */
  async getMonitoringRules(webhookId: string): Promise<MonitoringRule[]> {
    try {
      const q = query(
        collection(db, this.monitoringRulesCollection),
        where('webhookId', '==', webhookId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as MonitoringRule));
    } catch (error) {
      logger.error('Failed to get monitoring rules:', error);
      return [];
    }
  }

  /**
   * Evaluate if a rule should trigger based on payload
   */
  private evaluateRule(rule: MonitoringRule, payload: WebhookPayload): boolean {
    const { conditions } = rule;

    // Check file patterns
    if (conditions.filePatterns && payload.changes?.files) {
      const matchesPattern = payload.changes.files.some(file =>
        conditions.filePatterns!.some(pattern =>
          this.matchGlob(file.filename, pattern)
        )
      );
      if (!matchesPattern) return false;
    }

    // Check branches
    if (conditions.branches && payload.pullRequest) {
      const matchesBranch = conditions.branches.includes(payload.pullRequest.branch) ||
        conditions.branches.includes(payload.pullRequest.baseBranch);
      if (!matchesBranch) return false;
    }

    // Check authors
    if (conditions.authors) {
      const matchesAuthor = conditions.authors.includes(payload.sender.username);
      if (!matchesAuthor) return false;
    }

    return true;
  }

  /**
   * Simple glob pattern matching
   */
  private matchGlob(filename: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filename);
  }

  /**
   * Execute rule actions
   */
  private async executeRuleActions(
    rule: MonitoringRule,
    payload: WebhookPayload
  ): Promise<void> {
    const { actions } = rule;

    // Trigger immediate scan
    if (actions.scanImmediately) {
      // This would trigger the analysis service
      enhancedNotifications.info('Automatic Scan Triggered', {
        message: `Scanning ${payload.repository.name} due to ${payload.event}`,
        category: 'analysis',
        priority: 'high',
      });
    }

    // Notify users
    if (actions.notifyUsers && actions.notifyUsers.length > 0) {
      enhancedNotifications.warning('Repository Alert', {
        message: `${payload.event} detected in ${payload.repository.name}`,
        category: 'security',
        priority: 'high',
      });
    }

    // Additional actions can be implemented here
    // - Block PR
    // - Create issue
    // - Send email
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(webhookId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    lastEvent?: number;
  }> {
    try {
      const q = query(
        collection(db, this.webhookLogsCollection),
        where('webhookId', '==', webhookId)
      );
      
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => doc.data());

      const eventsByType: Record<string, number> = {};
      logs.forEach(log => {
        eventsByType[log.event] = (eventsByType[log.event] || 0) + 1;
      });

      const lastEvent = logs.length > 0
        ? Math.max(...logs.map(log => log.timestamp))
        : undefined;

      return {
        totalEvents: logs.length,
        eventsByType,
        lastEvent,
      };
    } catch (error) {
      logger.error('Failed to get webhook stats:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
      };
    }
  }
}

export const WebhookManager = new WebhookManagerClass();
