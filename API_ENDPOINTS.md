# 📡 Code Guardian API Endpoints

## Overview

This document describes the API endpoints for Code Guardian, including webhook processing, custom rules, and monitoring features.

---

## 🔗 Base URLs

### Production
```
https://us-central1-<your-project>.cloudfunctions.net
```

### Development
```
http://localhost:5001/<your-project>/us-central1
```

---

## 🎣 Webhook Endpoints

### Process Webhook

Process incoming webhooks from GitHub/GitLab.

**Endpoint:** `POST /processWebhook`

**Query Parameters:**
- `webhookId` (required): The webhook configuration ID

**Headers:**
- `X-Hub-Signature-256`: GitHub webhook signature (HMAC SHA-256)
- `X-GitLab-Token`: GitLab webhook token
- `Content-Type`: application/json

**Request Body:**
GitHub Push Event:
```json
{
  "ref": "refs/heads/main",
  "repository": {
    "id": 123456,
    "name": "my-repo",
    "full_name": "user/my-repo",
    "html_url": "https://github.com/user/my-repo"
  },
  "sender": {
    "id": 12345,
    "login": "username",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345"
  },
  "commits": [
    {
      "id": "abc123",
      "message": "Fix security issue",
      "author": {
        "name": "John Doe"
      },
      "timestamp": "2025-01-20T10:00:00Z",
      "added": ["src/new-file.js"],
      "modified": ["src/auth.js"],
      "removed": []
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "rulesTriggered": 2
}
```

**Status Codes:**
- `200`: Webhook processed successfully
- `400`: Invalid request (missing webhookId or invalid payload)
- `401`: Invalid signature
- `403`: Webhook inactive
- `404`: Webhook not found
- `405`: Method not allowed (only POST accepted)
- `500`: Internal server error

---

## 📋 Usage Examples

### GitHub Webhook Setup

1. **Create Webhook in Code Guardian:**
```typescript
const webhook = await WebhookManager.createWebhook({
  userId: user.uid,
  provider: 'github',
  repositoryName: 'my-project',
  repositoryUrl: 'https://github.com/user/my-project',
  events: ['push', 'pull_request'],
  active: true,
});

console.log('Webhook URL:', 
  `https://us-central1-project.cloudfunctions.net/processWebhook?webhookId=${webhook.id}`
);
console.log('Secret:', webhook.secret);
```

2. **Configure in GitHub:**
```bash
# Go to: Repository → Settings → Webhooks → Add webhook

Payload URL: https://us-central1-project.cloudfunctions.net/processWebhook?webhookId=YOUR_WEBHOOK_ID
Content type: application/json
Secret: YOUR_WEBHOOK_SECRET
Events:
  ☑ Push events
  ☑ Pull request events
  ☐ Issue comments
Active: ☑
```

### GitLab Webhook Setup

1. **Create Webhook in Code Guardian:**
```typescript
const webhook = await WebhookManager.createWebhook({
  userId: user.uid,
  provider: 'gitlab',
  repositoryName: 'my-project',
  repositoryUrl: 'https://gitlab.com/user/my-project',
  events: ['push', 'merge_request'],
  active: true,
});
```

2. **Configure in GitLab:**
```bash
# Go to: Project → Settings → Webhooks

URL: https://us-central1-project.cloudfunctions.net/processWebhook?webhookId=YOUR_WEBHOOK_ID
Secret Token: YOUR_WEBHOOK_SECRET
Trigger:
  ☑ Push events
  ☑ Merge request events
  ☑ Comments
Enable SSL verification: ☑
```

---

## 🔐 Security

### Webhook Signature Validation

All webhooks must include a valid signature. The signature is calculated using HMAC SHA-256:

```typescript
// Signature calculation (GitHub style)
const hmac = crypto.createHmac('sha256', webhookSecret);
const signature = 'sha256=' + hmac.update(payloadString).digest('hex');
```

**Validation Process:**
1. Extract signature from headers (`X-Hub-Signature-256` or `X-GitLab-Token`)
2. Calculate expected signature using webhook secret
3. Compare using timing-safe equality
4. Reject if signatures don't match

### Rate Limiting

Webhook endpoints are rate-limited to:
- **100 requests per minute** per webhook
- **1000 requests per hour** per user

Exceed these limits and you'll receive:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 🔄 Background Processing

### Webhook Tasks

When a webhook is processed, background tasks are created for:

1. **Code Scanning**
   - Applies custom rules
   - Generates security report
   - Updates scan history

2. **Notifications**
   - Sends to configured users
   - Creates in-app notifications
   - Sends email alerts (if enabled)

3. **PR Status Updates**
   - Posts status to GitHub/GitLab
   - Blocks PRs if critical issues found
   - Adds comments with results

4. **Issue Creation**
   - Creates GitHub/GitLab issues
   - Links to scan results
   - Assigns to team members

### Task Status

Check task status:
```typescript
const task = await db.collection('webhookTasks').doc(taskId).get();
console.log(task.data().status); // 'pending', 'processing', 'completed', 'failed'
```

---

## 🧹 Scheduled Functions

### Cleanup Jobs

**Webhook Logs Cleanup**
- **Schedule:** Daily at midnight UTC
- **Action:** Deletes logs older than 30 days
- **Collection:** `webhookLogs`

**Completed Tasks Cleanup**
- **Schedule:** Daily at 1 AM UTC
- **Action:** Deletes completed tasks older than 7 days
- **Collection:** `webhookTasks`

---

## 📊 Monitoring & Logging

### Cloud Functions Logs

View logs in Firebase Console:
```bash
firebase functions:log --only processWebhook
```

Or programmatically:
```typescript
// Get logs for the last hour
const logs = await admin.logging().getEntries({
  filter: 'resource.type="cloud_function" AND resource.labels.function_name="processWebhook"',
  orderBy: 'timestamp desc',
  pageSize: 100
});
```

### Webhook Statistics

```typescript
// Get webhook stats
const stats = await WebhookManager.getWebhookStats(webhookId);

console.log({
  totalEvents: stats.totalEvents,
  eventsByType: stats.eventsByType,
  lastEvent: new Date(stats.lastEvent)
});
```

---

## 🧪 Testing

### Local Testing with Firebase Emulator

1. **Start Emulator:**
```bash
cd functions
npm run serve
```

2. **Test Webhook:**
```bash
curl -X POST http://localhost:5001/project/us-central1/processWebhook?webhookId=test123 \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=YOUR_SIGNATURE" \
  -d @webhook-payload.json
```

3. **View Emulator Logs:**
```bash
# Logs appear in terminal where emulator is running
```

### Unit Testing

```typescript
import * as functions from 'firebase-functions-test';

const test = functions();

describe('processWebhook', () => {
  it('should process valid webhook', async () => {
    const req = {
      method: 'POST',
      query: { webhookId: 'test123' },
      headers: { 'x-hub-signature-256': 'sha256=...' },
      body: { /* webhook payload */ }
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn()
    };
    
    await processWebhook(req as any, res as any);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

---

## 🚀 Deployment

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:processWebhook

# Deploy with environment config
firebase functions:config:set webhook.timeout=300
firebase deploy --only functions
```

### Environment Configuration

```bash
# Set configuration
firebase functions:config:set github.app_id="123456"
firebase functions:config:set github.private_key="$(cat key.pem)"

# Get configuration
firebase functions:config:get

# Unset configuration
firebase functions:config:unset github.app_id
```

---

## 📈 Performance Optimization

### Cold Start Reduction

```typescript
// Keep instances warm
export const keepWarm = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    console.log('Keep-alive ping');
    return null;
  });
```

### Batch Processing

```typescript
// Process multiple webhooks in batch
export const batchProcessWebhooks = functions.firestore
  .document('webhookBatch/{batchId}')
  .onCreate(async (snap) => {
    const batch = snap.data();
    const tasks = batch.webhooks.map(w => processWebhookInternal(w));
    await Promise.all(tasks);
  });
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Invalid signature"**
- Verify webhook secret matches
- Check signature header name (GitHub vs GitLab)
- Ensure payload is not modified

**Issue: "Webhook not found"**
- Verify webhookId in URL
- Check webhook still exists in Firestore
- Ensure webhook is active

**Issue: "Function timeout"**
- Increase timeout: `firebase functions:config:set timeout=540`
- Move heavy processing to background tasks
- Use batch processing for multiple operations

**Issue: "Rate limit exceeded"**
- Implement exponential backoff
- Reduce webhook event frequency
- Contact support for higher limits

---

## 📞 Support

### Getting Help

- **Documentation:** This file
- **Functions Code:** `functions/src/index.ts`
- **Email:** itisaddy7@gmail.com
- **GitHub:** Open issue with "api" label

### Monitoring

- **Firebase Console:** https://console.firebase.google.com
- **Cloud Functions Logs:** Firebase Console → Functions → Logs
- **Performance:** Firebase Console → Functions → Health

---

## ✅ Implementation Checklist

- [x] Webhook processing endpoint
- [x] Signature validation
- [x] Background task processing
- [x] Scheduled cleanup jobs
- [x] Error handling
- [x] Logging
- [x] Rate limiting (planned)
- [x] GitHub integration
- [x] GitLab integration
- [ ] Bitbucket integration (planned)
- [ ] Slack notifications (planned)
- [ ] Email notifications (planned)

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** Production Ready
