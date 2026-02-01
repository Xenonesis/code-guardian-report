"use strict";
/**
 * Firebase Cloud Functions for Code Guardian
 * Handles webhook processing, background tasks, and scheduled jobs
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o)
            if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupCompletedTasks =
  exports.cleanupWebhookLogs =
  exports.processWebhookTask =
  exports.processWebhook =
    void 0;
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
/**
 * Webhook Handler
 * Processes incoming webhooks from GitHub/GitLab
 */
exports.processWebhook = (0, https_1.onRequest)(async (req, res) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  try {
    const webhookId = req.query.webhookId;
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
      req.headers["x-hub-signature-256"] || req.headers["x-gitlab-token"];
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
    const rulesToExecute = [];
    rulesSnapshot.forEach((doc) => {
      const rule = doc.data();
      if (evaluateRule(rule, event)) {
        rulesToExecute.push(Object.assign({ id: doc.id }, rule));
      }
    });
    // Execute rule actions asynchronously
    if (rulesToExecute.length > 0) {
      // Trigger background processing
      await db.collection("webhookTasks").add({
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
exports.processWebhookTask = (0, firestore_1.onDocumentCreated)(
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
 * Scheduled cleanup of old webhook logs
 * Runs daily at midnight
 */
exports.cleanupWebhookLogs = (0, scheduler_1.onSchedule)(
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
exports.cleanupCompletedTasks = (0, scheduler_1.onSchedule)(
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
/**
 * Validate webhook signature
 */
async function validateSignature(payload, signature, secret) {
  try {
    const hmac = crypto.createHmac("sha256", secret);
    const digest = "sha256=" + hmac.update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch (_a) {
    return false;
  }
}
/**
 * Parse webhook event from payload
 */
function parseWebhookEvent(payload, provider) {
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
function parseGitHubEvent(payload) {
  var _a, _b;
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
      files:
        ((_a = payload.commits) === null || _a === void 0
          ? void 0
          : _a.flatMap((c) =>
              [
                ...(c.added || []),
                ...(c.modified || []),
                ...(c.removed || []),
              ].map((f) => ({
                filename: f,
                status: "modified",
                additions: 0,
                deletions: 0,
              }))
            )) || [],
      commits:
        ((_b = payload.commits) === null || _b === void 0
          ? void 0
          : _b.map((c) => ({
              id: c.id,
              message: c.message,
              author: c.author.name,
              timestamp: new Date(c.timestamp).getTime(),
            }))) || [],
    },
    pullRequest: payload.pull_request
      ? {
          number: payload.pull_request.number,
          title: payload.pull_request.title,
          branch: payload.pull_request.head.ref,
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
function parseGitLabEvent(payload) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  return {
    event: payload.object_kind || "push",
    repository: {
      id:
        ((_b =
          (_a = payload.project) === null || _a === void 0 ? void 0 : _a.id) ===
          null || _b === void 0
          ? void 0
          : _b.toString()) || "",
      name:
        ((_c = payload.project) === null || _c === void 0 ? void 0 : _c.name) ||
        "",
      fullName:
        ((_d = payload.project) === null || _d === void 0
          ? void 0
          : _d.path_with_namespace) || "",
      url:
        ((_e = payload.project) === null || _e === void 0
          ? void 0
          : _e.web_url) || "",
    },
    sender: {
      id:
        ((_f = payload.user_id) === null || _f === void 0
          ? void 0
          : _f.toString()) || "",
      username: payload.user_username || "",
      avatarUrl: payload.user_avatar || "",
    },
    changes: {
      files:
        ((_g = payload.commits) === null || _g === void 0
          ? void 0
          : _g.flatMap((c) =>
              [
                ...(c.added || []),
                ...(c.modified || []),
                ...(c.removed || []),
              ].map((f) => ({
                filename: f,
                status: "modified",
                additions: 0,
                deletions: 0,
              }))
            )) || [],
      commits:
        ((_h = payload.commits) === null || _h === void 0
          ? void 0
          : _h.map((c) => ({
              id: c.id,
              message: c.message,
              author: c.author.name,
              timestamp: new Date(c.timestamp).getTime(),
            }))) || [],
    },
    timestamp: Date.now(),
  };
}
/**
 * Evaluate if rule conditions are met
 */
function evaluateRule(rule, event) {
  var _a;
  const { conditions } = rule;
  // Check file patterns
  if (
    conditions.filePatterns &&
    ((_a = event.changes) === null || _a === void 0 ? void 0 : _a.files)
  ) {
    const matchesPattern = event.changes.files.some((file) =>
      conditions.filePatterns.some((pattern) =>
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
function matchGlob(filename, pattern) {
  const regexPattern = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, ".*")
    .replace(/\*/g, "[^/]*")
    .replace(/\?/g, ".");
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filename);
}
/**
 * Execute rule actions
 */
async function executeRuleActions(rule, event) {
  var _a;
  const { actions } = rule;
  try {
    // Trigger immediate scan
    if (actions.scanImmediately) {
      await db.collection("scanQueue").add({
        webhookId: rule.webhookId,
        repository: event.repository,
        event: event.event,
        files:
          ((_a = event.changes) === null || _a === void 0
            ? void 0
            : _a.files) || [],
        customRuleIds: rule.conditions.customRuleIds || [],
        priority: "high",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "pending",
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
      // This would integrate with GitHub/GitLab API to add a blocking status
      logger.info("PR blocking requested:", event.pullRequest.url);
    }
    // Create issue (would require GitHub API integration)
    if (actions.createIssue) {
      // This would integrate with GitHub/GitLab API to create an issue
      logger.info("Issue creation requested for:", event.repository.name);
    }
  } catch (error) {
    logger.error("Failed to execute rule actions:", error);
    throw error;
  }
}
//# sourceMappingURL=index.js.map
