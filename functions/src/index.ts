/**
 * Firebase Cloud Functions for Code Guardian
 * Handles webhook processing, background tasks, and scheduled jobs
 */

import * as admin from "firebase-admin";
import * as crypto from "crypto";

import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as webpush from "web-push";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Webhook Handler
 * Processes incoming webhooks from GitHub/GitLab
 */
export const processWebhook = onRequest(async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const webhookId = req.query.webhookId as string;

    if (!webhookId) {
      res.status(400).send("Missing webhookId parameter");
      return;
    }

    // Get webhook configuration
    const webhookDoc = await db.collection("webhooks").doc(webhookId).get();

    if (!webhookDoc.exists) {
      res.status(404).send("Webhook not found");
      return;
    }

    const webhook = webhookDoc.data();

    if (!webhook || !webhook.active) {
      res.status(403).send("Webhook inactive");
      return;
    }

    // Validate signature
    const signature =
      (req.headers["x-hub-signature-256"] as string) ||
      (req.headers["x-gitlab-token"] as string);

    if (!signature) {
      res.status(401).send("Missing signature");
      return;
    }

    const payload = JSON.stringify(req.body);
    const isValid = await validateSignature(payload, signature, webhook.secret);

    if (!isValid) {
      res.status(401).send("Invalid signature");
      return;
    }

    // Parse webhook event
    const event = parseWebhookEvent(req.body, webhook.provider);

    if (!event) {
      res.status(400).send("Invalid webhook payload");
      return;
    }

    // Log the webhook event
    await db.collection("webhookLogs").add({
      userId: webhook.userId || null,
      webhookId,
      event: event.event,
      repository: event.repository.name,
      sender: event.sender.username,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      processed: false,
    });

    // Update last triggered time
    await db.collection("webhooks").doc(webhookId).update({
      lastTriggered: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Get monitoring rules for this webhook
    const rulesSnapshot = await db
      .collection("monitoringRules")
      .where("webhookId", "==", webhookId)
      .where("enabled", "==", true)
      .get();

    // Apply rules
    interface MonitoringRule {
      id: string;
      name: string;
      condition: string;
      action: string;
      enabled: boolean;
    }
    const rulesToExecute: MonitoringRule[] = [];

    rulesSnapshot.forEach((doc) => {
      const rule = doc.data();
      if (evaluateRule(rule, event)) {
        rulesToExecute.push({ id: doc.id, ...rule } as MonitoringRule);
      }
    });

    // Execute rule actions asynchronously
    if (rulesToExecute.length > 0) {
      // Trigger background processing
      await db.collection("webhookTasks").add({
        userId: webhook.userId || null,
        webhookId,
        event,
        rules: rulesToExecute,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Mark webhook log as processed
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      rulesTriggered: rulesToExecute.length,
    });
  } catch (error) {
    logger.error("Webhook processing error:", error);
    res.status(500).send("Internal server error");
  }
});

/**
 * Background Task Processor
 * Processes webhook tasks (scans, notifications, etc.)
 */
export const processWebhookTask = onDocumentCreated(
  "webhookTasks/{taskId}",
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn("processWebhookTask triggered with no snapshot data");
      return;
    }

    const task = snap.data();
    // keep taskId available for debugging/logging
    const taskId = event.params.taskId;
    logger.debug("Processing webhook task", { taskId });

    try {
      // Update task status
      await snap.ref.update({
        status: "processing",
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Execute rule actions
      for (const rule of task.rules) {
        await executeRuleActions(rule, task.event);
      }

      // Mark task as completed
      await snap.ref.update({
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      logger.error("Task processing error:", error);

      // Mark task as failed
      await snap.ref.update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

/**
 * Processes queued repository scans from webhook rules.
 * This performs a lightweight changed-file scan in Cloud Functions so webhook
 * automation produces persisted results instead of only creating queue items.
 */
export const processScanQueue = onDocumentCreated(
  "scanQueue/{scanId}",
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn("processScanQueue triggered with no snapshot data");
      return;
    }

    const scanId = event.params.scanId;
    const task = snap.data();

    try {
      await snap.ref.update({
        status: "processing",
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const webhookEvent = task.eventPayload || task.event;
      const results = await scanChangedFiles(task.repository, webhookEvent);
      const hasBlockingIssues = results.issues.some((issue) =>
        ["Critical", "High"].includes(issue.severity)
      );

      await db
        .collection("scanResults")
        .doc(scanId)
        .set({
          scanId,
          userId: task.userId || null,
          webhookId: task.webhookId,
          repository: task.repository,
          event: webhookEvent?.event || task.event,
          filesScanned: results.filesScanned,
          issues: results.issues,
          issueCount: results.issues.length,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      await snap.ref.update({
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        filesScanned: results.filesScanned,
        issueCount: results.issues.length,
      });

      if (webhookEvent?.pullRequest) {
        await updateGitHubCommitStatus(
          webhookEvent,
          {
            state: hasBlockingIssues ? "failure" : "success",
            description: hasBlockingIssues
              ? "Code Guardian found blocking security issues"
              : "Code Guardian scan completed without blocking issues",
            context: "Code Guardian Security Scan",
          },
          {
            userId: task.userId,
            webhookId: task.webhookId,
          }
        );
      }
    } catch (error) {
      logger.error("Scan queue processing error:", error);
      await snap.ref.update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
);

/**
 * Scheduled cleanup of old webhook logs
 * Runs daily at midnight
 */
export const cleanupWebhookLogs = onSchedule(
  { schedule: "0 0 * * *", timeZone: "UTC" },
  async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await db
      .collection("webhookLogs")
      .where(
        "timestamp",
        "<",
        admin.firestore.Timestamp.fromDate(thirtyDaysAgo)
      )
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    logger.info(`Cleaned up ${snapshot.size} old webhook logs`);
  }
);

/**
 * Scheduled cleanup of completed tasks
 * Runs daily at 1 AM
 */
export const cleanupCompletedTasks = onSchedule(
  { schedule: "0 1 * * *", timeZone: "UTC" },
  async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await db
      .collection("webhookTasks")
      .where(
        "completedAt",
        "<",
        admin.firestore.Timestamp.fromDate(sevenDaysAgo)
      )
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    logger.info(`Cleaned up ${snapshot.size} completed tasks`);
  }
);

interface StoredPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  isActive?: boolean;
}

interface ScheduledNotificationDoc {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
  userId: string;
  status: string;
  scheduledTimestamp?: number;
}

/**
 * Process scheduled push notifications.
 * Runs every 5 minutes and delivers pending notifications whose scheduled time has passed.
 */
export const processScheduledNotifications = onSchedule(
  { schedule: "*/5 * * * *", timeZone: "UTC" },
  async () => {
    const vapidPublicKey =
      process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject =
      process.env.VAPID_SUBJECT || "mailto:admin@codeguardian.dev";

    if (!vapidPublicKey || !vapidPrivateKey) {
      logger.warn(
        "Skipping scheduled push processing: VAPID keys are not configured"
      );
      return;
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const now = Date.now();
    const scheduledSnapshot = await db
      .collection("scheduledNotifications")
      .where("status", "==", "scheduled")
      .where("scheduledTimestamp", "<=", now)
      .limit(100)
      .get();

    if (scheduledSnapshot.empty) {
      logger.debug("No scheduled notifications ready for delivery");
      return;
    }

    for (const scheduledDoc of scheduledSnapshot.docs) {
      const notification = scheduledDoc.data() as ScheduledNotificationDoc;

      try {
        const subscriptionsSnapshot = await db
          .collection("pushSubscriptions")
          .where("userId", "==", notification.userId)
          .where("isActive", "==", true)
          .get();

        if (subscriptionsSnapshot.empty) {
          await scheduledDoc.ref.update({
            status: "failed",
            error: "No active subscriptions for user",
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          continue;
        }

        let successCount = 0;
        let failureCount = 0;

        for (const subDoc of subscriptionsSnapshot.docs) {
          const sub = subDoc.data() as StoredPushSubscription;

          if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
            failureCount += 1;
            continue;
          }

          const payload = {
            title: notification.title,
            body: notification.body,
            icon: notification.icon || "/icons/icon-192x192.png",
            data: {
              ...(notification.data || {}),
              scheduledNotificationId: scheduledDoc.id,
            },
          };

          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.keys.p256dh,
                  auth: sub.keys.auth,
                },
              },
              JSON.stringify(payload)
            );

            successCount += 1;

            await subDoc.ref.update({
              lastUsedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } catch (error: unknown) {
            failureCount += 1;

            const statusCode = (error as { statusCode?: number })?.statusCode;
            if (statusCode === 404 || statusCode === 410) {
              // Mark stale subscriptions inactive to avoid repeated failures.
              await subDoc.ref.update({
                isActive: false,
                invalidatedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }

            logger.warn("Scheduled push send failed", {
              scheduledNotificationId: scheduledDoc.id,
              subscriptionId: subDoc.id,
              statusCode,
            });
          }
        }

        await scheduledDoc.ref.update({
          status: successCount > 0 ? "sent" : "failed",
          sentCount: successCount,
          failedCount: failureCount,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        logger.error("Failed to process scheduled notification", {
          scheduledNotificationId: scheduledDoc.id,
          error,
        });

        await scheduledDoc.ref.update({
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    logger.info("Processed scheduled notifications", {
      count: scheduledSnapshot.size,
    });
  }
);

/**
 * Validate webhook signature
 */
async function validateSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

/**
 * Parse webhook event from payload
 */
function parseWebhookEvent(payload: any, provider: string): any | null {
  try {
    if (provider === "github") {
      return parseGitHubEvent(payload);
    } else if (provider === "gitlab") {
      return parseGitLabEvent(payload);
    }
    return null;
  } catch (error) {
    logger.error("Failed to parse webhook event:", error);
    return null;
  }
}

/**
 * Parse GitHub webhook event
 */
function parseGitHubEvent(payload: any): any {
  const eventType = payload.action
    ? `${payload.pull_request ? "pull_request" : "push"}`
    : "push";

  return {
    event: eventType,
    repository: {
      id: payload.repository.id.toString(),
      name: payload.repository.name,
      fullName: payload.repository.full_name,
      url: payload.repository.html_url,
    },
    sender: {
      id: payload.sender.id.toString(),
      username: payload.sender.login,
      avatarUrl: payload.sender.avatar_url,
    },
    changes: {
      after: payload.after,
      files:
        payload.commits?.flatMap((c: any) =>
          [...(c.added || []), ...(c.modified || []), ...(c.removed || [])].map(
            (f) => ({
              filename: f,
              status: "modified",
              additions: 0,
              deletions: 0,
            })
          )
        ) || [],
      commits:
        payload.commits?.map((c: any) => ({
          id: c.id,
          message: c.message,
          author: c.author.name,
          timestamp: new Date(c.timestamp).getTime(),
        })) || [],
    },
    pullRequest: payload.pull_request
      ? {
          number: payload.pull_request.number,
          title: payload.pull_request.title,
          branch: payload.pull_request.head.ref,
          headSha: payload.pull_request.head.sha,
          baseBranch: payload.pull_request.base.ref,
          state: payload.pull_request.state,
          url: payload.pull_request.html_url,
        }
      : undefined,
    timestamp: Date.now(),
  };
}

/**
 * Parse GitLab webhook event
 */
function parseGitLabEvent(payload: any): any {
  return {
    event: payload.object_kind || "push",
    repository: {
      id: payload.project?.id?.toString() || "",
      name: payload.project?.name || "",
      fullName: payload.project?.path_with_namespace || "",
      url: payload.project?.web_url || "",
    },
    sender: {
      id: payload.user_id?.toString() || "",
      username: payload.user_username || "",
      avatarUrl: payload.user_avatar || "",
    },
    changes: {
      after: payload.after,
      files:
        payload.commits?.flatMap((c: any) =>
          [...(c.added || []), ...(c.modified || []), ...(c.removed || [])].map(
            (f: string) => ({
              filename: f,
              status: "modified",
              additions: 0,
              deletions: 0,
            })
          )
        ) || [],
      commits:
        payload.commits?.map((c: any) => ({
          id: c.id,
          message: c.message,
          author: c.author.name,
          timestamp: new Date(c.timestamp).getTime(),
        })) || [],
    },
    timestamp: Date.now(),
  };
}

/**
 * Evaluate if rule conditions are met
 */
function evaluateRule(rule: any, event: any): boolean {
  const { conditions } = rule;

  // Check file patterns
  if (conditions.filePatterns && event.changes?.files) {
    const matchesPattern = event.changes.files.some((file: any) =>
      conditions.filePatterns.some((pattern: string) =>
        matchGlob(file.filename, pattern)
      )
    );
    if (!matchesPattern) return false;
  }

  // Check branches
  if (conditions.branches && event.pullRequest) {
    const matchesBranch =
      conditions.branches.includes(event.pullRequest.branch) ||
      conditions.branches.includes(event.pullRequest.baseBranch);
    if (!matchesBranch) return false;
  }

  // Check authors
  if (conditions.authors) {
    const matchesAuthor = conditions.authors.includes(event.sender.username);
    if (!matchesAuthor) return false;
  }

  return true;
}

/**
 * Simple glob pattern matching
 */
function matchGlob(filename: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".");

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filename);
}

interface LightweightScanIssue {
  filename: string;
  line: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  type: string;
  message: string;
  recommendation: string;
}

interface LightweightScanResult {
  filesScanned: number;
  issues: LightweightScanIssue[];
}

function getGitHubAutomationToken(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GITHUB_AUTOMATION_TOKEN;
}

function getGitHubSha(event: any): string | undefined {
  return event.pullRequest?.headSha || event.changes?.after;
}

async function githubApiRequest(
  path: string,
  init: RequestInit = {}
): Promise<Response | null> {
  const token = getGitHubAutomationToken();
  if (!token) {
    logger.warn("GitHub automation token is not configured");
    return null;
  }

  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "CodeGuardian-Webhook-Automation/1.0",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
}

async function logWebhookAction(
  action: string,
  event: any,
  status: "success" | "skipped" | "failed",
  details?: Record<string, unknown>
): Promise<void> {
  await db.collection("webhookActionLogs").add({
    action,
    status,
    userId: details?.userId || null,
    webhookId: details?.webhookId || null,
    repository: event.repository?.fullName || event.repository?.name || null,
    pullRequest: event.pullRequest?.number || null,
    details: details || {},
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

function scanFileContent(
  filename: string,
  content: string
): LightweightScanIssue[] {
  const issues: LightweightScanIssue[] = [];
  const rules: Array<{
    regex: RegExp;
    severity: LightweightScanIssue["severity"];
    type: string;
    message: string;
    recommendation: string;
  }> = [
    {
      regex: /(api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"]{12,}['"]/i,
      severity: "Critical",
      type: "hardcoded-secret",
      message: "Possible hardcoded credential detected",
      recommendation: "Move secrets to a managed secret store.",
    },
    {
      regex: /\beval\s*\(/i,
      severity: "High",
      type: "dangerous-eval",
      message: "Dynamic code execution detected",
      recommendation: "Avoid eval and use safe parsing or dispatch tables.",
    },
    {
      regex: /innerHTML\s*=/i,
      severity: "Medium",
      type: "unsafe-dom-write",
      message: "Potential unsafe HTML injection sink detected",
      recommendation:
        "Use textContent or sanitize trusted HTML before insertion.",
    },
  ];

  content.split(/\r?\n/).forEach((line, index) => {
    for (const rule of rules) {
      if (rule.regex.test(line)) {
        issues.push({
          filename,
          line: index + 1,
          severity: rule.severity,
          type: rule.type,
          message: rule.message,
          recommendation: rule.recommendation,
        });
      }
    }
  });

  return issues;
}

async function fetchGitHubFileContent(
  fullName: string,
  filename: string,
  ref?: string
): Promise<string | null> {
  const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const response = await githubApiRequest(
    `/repos/${fullName}/contents/${filename
      .split("/")
      .map(encodeURIComponent)
      .join("/")}${query}`
  );

  if (!response || !response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    content?: string;
    encoding?: string;
  };
  if (!data.content || data.encoding !== "base64") {
    return null;
  }

  return Buffer.from(data.content, "base64").toString("utf8");
}

async function scanChangedFiles(
  repository: any,
  event: any
): Promise<LightweightScanResult> {
  const fullName = repository?.fullName;
  const changedFiles = event?.changes?.files || [];
  const ref = event?.pullRequest?.branch;
  const issues: LightweightScanIssue[] = [];
  let filesScanned = 0;

  if (!fullName || changedFiles.length === 0) {
    return { filesScanned, issues };
  }

  for (const file of changedFiles.slice(0, 50)) {
    if (file.status === "removed") continue;
    const content = await fetchGitHubFileContent(fullName, file.filename, ref);
    if (!content) continue;
    filesScanned += 1;
    issues.push(...scanFileContent(file.filename, content));
  }

  return { filesScanned, issues };
}

async function updateGitHubCommitStatus(
  event: any,
  status: {
    state: "error" | "failure" | "pending" | "success";
    description: string;
    context: string;
  },
  context?: { userId?: string; webhookId?: string }
): Promise<void> {
  const fullName = event.repository?.fullName;
  const sha = getGitHubSha(event);
  if (!fullName || !sha) {
    await logWebhookAction("blockPR", event, "skipped", {
      ...context,
      reason: "Missing repository full name or commit SHA",
    });
    return;
  }

  const response = await githubApiRequest(
    `/repos/${fullName}/statuses/${sha}`,
    {
      method: "POST",
      body: JSON.stringify(status),
    }
  );

  if (!response) {
    await logWebhookAction("blockPR", event, "skipped", {
      ...context,
      reason: "GitHub automation token not configured",
    });
    return;
  }

  await logWebhookAction("blockPR", event, response.ok ? "success" : "failed", {
    ...context,
    upstreamStatus: response.status,
  });
}

async function createGitHubIssue(
  event: any,
  context?: { userId?: string; webhookId?: string }
): Promise<void> {
  const fullName = event.repository?.fullName;
  if (!fullName) {
    await logWebhookAction("createIssue", event, "skipped", {
      ...context,
      reason: "Missing repository full name",
    });
    return;
  }

  const title = `Code Guardian alert: ${event.event} in ${event.repository.name}`;
  const body = [
    `Code Guardian detected a monitored ${event.event} event.`,
    "",
    `Repository: ${event.repository.fullName}`,
    `Sender: ${event.sender?.username || "unknown"}`,
    event.pullRequest ? `Pull request: ${event.pullRequest.url}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await githubApiRequest(`/repos/${fullName}/issues`, {
    method: "POST",
    body: JSON.stringify({
      title,
      body,
      labels: ["security", "code-guardian"],
    }),
  });

  if (!response) {
    await logWebhookAction("createIssue", event, "skipped", {
      ...context,
      reason: "GitHub automation token not configured",
    });
    return;
  }

  await logWebhookAction(
    "createIssue",
    event,
    response.ok ? "success" : "failed",
    { ...context, upstreamStatus: response.status }
  );
}

/**
 * Execute rule actions
 */
async function executeRuleActions(rule: any, event: any): Promise<void> {
  const { actions } = rule;

  try {
    // Trigger immediate scan
    if (actions.scanImmediately) {
      const scanRef = await db.collection("scanQueue").add({
        userId: rule.userId || null,
        webhookId: rule.webhookId,
        repository: event.repository,
        event: event.event,
        eventPayload: event,
        files: event.changes?.files || [],
        customRuleIds: rule.conditions.customRuleIds || [],
        priority: "high",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "pending",
      });
      await logWebhookAction("scanImmediately", event, "success", {
        userId: rule.userId,
        webhookId: rule.webhookId,
        scanId: scanRef.id,
      });
    }

    // Send notifications
    if (actions.notifyUsers && actions.notifyUsers.length > 0) {
      await db.collection("notifications").add({
        userIds: actions.notifyUsers,
        type: "warning",
        title: "Repository Alert",
        message: `${event.event} detected in ${event.repository.name}`,
        category: "security",
        priority: "high",
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        metadata: {
          repository: event.repository.name,
          event: event.event,
          sender: event.sender.username,
        },
      });
    }

    // Block PR (would require GitHub API integration)
    if (actions.blockPR && event.pullRequest) {
      await updateGitHubCommitStatus(
        event,
        {
          state: "pending",
          description: "Code Guardian scan is running",
          context: "Code Guardian Security Scan",
        },
        {
          userId: rule.userId,
          webhookId: rule.webhookId,
        }
      );
    }

    if (actions.createIssue) {
      await createGitHubIssue(event, {
        userId: rule.userId,
        webhookId: rule.webhookId,
      });
    }
  } catch (error) {
    logger.error("Failed to execute rule actions:", error);
    throw error;
  }
}
