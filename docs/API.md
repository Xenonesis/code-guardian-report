# API Documentation

## Code Guardian Report - API Reference

This document provides comprehensive documentation for all available API endpoints in Code Guardian Report.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [API Endpoints](#api-endpoints)
   - [Health Check](#health-check)
   - [Analytics](#analytics)
   - [Push Notifications](#push-notifications)
   - [Copilot Integration](#copilot-integration)
   - [Error Logging](#error-logging)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Overview

Code Guardian Report provides a RESTful API for:

- Health monitoring and status checks
- Analytics tracking and reporting
- Push notification management
- GitHub Copilot integration
- Error logging and monitoring

All API endpoints follow REST conventions and return JSON responses.

### API Features

- **JSON Request/Response**: All data is exchanged in JSON format
- **CORS Enabled**: Cross-origin requests are supported
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **Error Handling**: Consistent error response format
- **Versioning**: API versioning for backward compatibility

---

## Authentication

Most API endpoints do not require authentication for basic functionality. However, certain features may require authentication:

### GitHub OAuth

For GitHub integration features, OAuth 2.0 authentication is required:

```http
Authorization: Bearer <github_access_token>
```

### Firebase Authentication (Optional)

For cloud features, Firebase authentication is required:

```http
Authorization: Bearer <firebase_id_token>
```

### API Key Authentication (Future)

Future versions may support API key authentication:

```http
X-API-Key: <your_api_key>
```

---

## Base URL

The base URL depends on your deployment environment:

### Development

```
http://localhost:3000/api
```

### Production

```
https://your-domain.com/api
```

### Vercel Deployment

```
https://your-app.vercel.app/api
```

---

## API Endpoints

### Health Check

#### GET /api/health

Check the health status of the application.

**Endpoint**: `GET /api/health`

**Authentication**: None required

**Rate Limit**: 60 requests per minute

**Request Parameters**: None

**Response**:

```json
{
  "status": "healthy",
  "version": "13.0.0",
  "timestamp": "2026-02-11T06:55:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "services": {
    "database": "connected",
    "cache": "connected",
    "storage": "connected"
  }
}
```

**Response Fields**:

| Field         | Type   | Description                                       |
| ------------- | ------ | ------------------------------------------------- |
| `status`      | string | Health status: `healthy`, `degraded`, `unhealthy` |
| `version`     | string | Application version                               |
| `timestamp`   | string | ISO 8601 timestamp                                |
| `uptime`      | number | Server uptime in seconds                          |
| `environment` | string | Environment: `development`, `production`          |
| `services`    | object | Status of external services                       |

**Status Codes**:

- `200 OK`: Health check successful
- `503 Service Unavailable`: Service is unhealthy

**Example Request**:

```bash
curl -X GET https://your-domain.com/api/health
```

**Example Response**:

```json
{
  "status": "healthy",
  "version": "13.0.0",
  "timestamp": "2026-02-11T06:55:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "services": {
    "database": "connected",
    "cache": "connected",
    "storage": "connected"
  }
}
```

---

### Analytics

#### GET /api/analytics

Retrieve analytics data for the application.

**Endpoint**: `GET /api/analytics`

**Authentication**: None required

**Rate Limit**: 30 requests per minute

**Request Parameters**:

| Parameter   | Type   | Required | Description                     |
| ----------- | ------ | -------- | ------------------------------- |
| `startDate` | string | No       | Start date (ISO 8601 format)    |
| `endDate`   | string | No       | End date (ISO 8601 format)      |
| `metrics`   | string | No       | Comma-separated list of metrics |

**Response**:

```json
{
  "period": {
    "start": "2026-02-01T00:00:00.000Z",
    "end": "2026-02-11T23:59:59.999Z"
  },
  "summary": {
    "totalAnalyses": 1250,
    "totalFilesAnalyzed": 45678,
    "totalIssuesFound": 8934,
    "uniqueUsers": 342
  },
  "metrics": {
    "analysesPerDay": [
      { "date": "2026-02-01", "count": 120 },
      { "date": "2026-02-02", "count": 145 }
    ],
    "issuesBySeverity": {
      "critical": 234,
      "high": 567,
      "medium": 1234,
      "low": 3456,
      "info": 3443
    },
    "languagesUsed": {
      "javascript": 45,
      "typescript": 35,
      "python": 12,
      "java": 5,
      "other": 3
    }
  }
}
```

**Response Fields**:

| Field     | Type   | Description              |
| --------- | ------ | ------------------------ |
| `period`  | object | Date range for analytics |
| `summary` | object | Summary statistics       |
| `metrics` | object | Detailed metrics         |

**Status Codes**:

- `200 OK`: Analytics data retrieved successfully
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X GET "https://your-domain.com/api/analytics?startDate=2026-02-01&endDate=2026-02-11"
```

#### GET /api/analytics/pwa

Retrieve PWA-specific analytics.

**Endpoint**: `GET /api/analytics/pwa`

**Authentication**: None required

**Rate Limit**: 30 requests per minute

**Request Parameters**: None

**Response**:

```json
{
  "installations": 1234,
  "activeUsers": 567,
  "offlineUsage": 234,
  "pushNotifications": {
    "sent": 890,
    "delivered": 856,
    "opened": 432
  },
  "platforms": {
    "desktop": 65,
    "mobile": 35
  }
}
```

**Response Fields**:

| Field               | Type   | Description                  |
| ------------------- | ------ | ---------------------------- |
| `installations`     | number | Total PWA installations      |
| `activeUsers`       | number | Active PWA users             |
| `offlineUsage`      | number | Offline usage count          |
| `pushNotifications` | object | Push notification statistics |
| `platforms`         | object | Platform breakdown           |

**Status Codes**:

- `200 OK`: PWA analytics retrieved successfully
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X GET https://your-domain.com/api/analytics/pwa
```

---

### Push Notifications

#### POST /api/push/subscribe

Subscribe to push notifications.

**Endpoint**: `POST /api/push/subscribe`

**Authentication**: None required

**Rate Limit**: 10 requests per minute

**Request Body**:

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "userId": "optional-user-id"
}
```

**Request Fields**:

| Field                      | Type   | Required | Description              |
| -------------------------- | ------ | -------- | ------------------------ |
| `subscription`             | object | Yes      | Push subscription object |
| `subscription.endpoint`    | string | Yes      | Push service endpoint    |
| `subscription.keys`        | object | Yes      | Encryption keys          |
| `subscription.keys.p256dh` | string | Yes      | P-256 ECDH key           |
| `subscription.keys.auth`   | string | Yes      | Authentication key       |
| `userId`                   | string | No       | Optional user identifier |

**Response**:

```json
{
  "success": true,
  "message": "Successfully subscribed to push notifications",
  "subscriptionId": "sub_1234567890"
}
```

**Response Fields**:

| Field            | Type    | Description                 |
| ---------------- | ------- | --------------------------- |
| `success`        | boolean | Subscription success status |
| `message`        | string  | Status message              |
| `subscriptionId` | string  | Unique subscription ID      |

**Status Codes**:

- `200 OK`: Subscription successful
- `400 Bad Request`: Invalid subscription data
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X POST https://your-domain.com/api/push/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/...",
      "keys": {
        "p256dh": "...",
        "auth": "..."
      }
    }
  }'
```

#### POST /api/push/unsubscribe

Unsubscribe from push notifications.

**Endpoint**: `POST /api/push/unsubscribe`

**Authentication**: None required

**Rate Limit**: 10 requests per minute

**Request Body**:

```json
{
  "subscriptionId": "sub_1234567890"
}
```

**Request Fields**:

| Field            | Type   | Required | Description                    |
| ---------------- | ------ | -------- | ------------------------------ |
| `subscriptionId` | string | Yes      | Subscription ID to unsubscribe |

**Response**:

```json
{
  "success": true,
  "message": "Successfully unsubscribed from push notifications"
}
```

**Response Fields**:

| Field     | Type    | Description                   |
| --------- | ------- | ----------------------------- |
| `success` | boolean | Unsubscription success status |
| `message` | string  | Status message                |

**Status Codes**:

- `200 OK`: Unsubscription successful
- `400 Bad Request`: Invalid subscription ID
- `404 Not Found`: Subscription not found
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X POST https://your-domain.com/api/push/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "sub_1234567890"
  }'
```

#### POST /api/push/send

Send a push notification.

**Endpoint**: `POST /api/push/send`

**Authentication**: Required (API key or Firebase token)

**Rate Limit**: 20 requests per minute

**Request Body**:

```json
{
  "title": "Analysis Complete",
  "body": "Your code analysis has finished successfully.",
  "icon": "/icons/notification.png",
  "badge": "/icons/badge.png",
  "data": {
    "analysisId": "analysis_123",
    "url": "/analysis/analysis_123"
  },
  "target": "all"
}
```

**Request Fields**:

| Field    | Type   | Required | Description                                              |
| -------- | ------ | -------- | -------------------------------------------------------- |
| `title`  | string | Yes      | Notification title                                       |
| `body`   | string | Yes      | Notification body                                        |
| `icon`   | string | No       | Notification icon URL                                    |
| `badge`  | string | No       | Notification badge URL                                   |
| `data`   | object | No       | Additional data payload                                  |
| `target` | string | No       | Target audience: `all`, `user:<id>`, `subscription:<id>` |

**Response**:

```json
{
  "success": true,
  "message": "Push notification sent successfully",
  "recipients": 123,
  "notificationId": "notif_1234567890"
}
```

**Response Fields**:

| Field            | Type    | Description            |
| ---------------- | ------- | ---------------------- |
| `success`        | boolean | Send success status    |
| `message`        | string  | Status message         |
| `recipients`     | number  | Number of recipients   |
| `notificationId` | string  | Unique notification ID |

**Status Codes**:

- `200 OK`: Notification sent successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X POST https://your-domain.com/api/push/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "Analysis Complete",
    "body": "Your code analysis has finished successfully."
  }'
```

#### POST /api/push/schedule

Schedule a push notification for later delivery.

**Endpoint**: `POST /api/push/schedule`

**Authentication**: Required (API key or Firebase token)

**Rate Limit**: 10 requests per minute

**Request Body**:

```json
{
  "title": "Scheduled Notification",
  "body": "This is a scheduled notification.",
  "scheduledFor": "2026-02-12T10:00:00.000Z",
  "data": {
    "type": "reminder"
  }
}
```

**Request Fields**:

| Field          | Type   | Required | Description                     |
| -------------- | ------ | -------- | ------------------------------- |
| `title`        | string | Yes      | Notification title              |
| `body`         | string | Yes      | Notification body               |
| `scheduledFor` | string | Yes      | ISO 8601 timestamp for delivery |
| `data`         | object | No       | Additional data payload         |

**Response**:

```json
{
  "success": true,
  "message": "Push notification scheduled successfully",
  "scheduleId": "sched_1234567890",
  "scheduledFor": "2026-02-12T10:00:00.000Z"
}
```

**Response Fields**:

| Field          | Type    | Description             |
| -------------- | ------- | ----------------------- |
| `success`      | boolean | Schedule success status |
| `message`      | string  | Status message          |
| `scheduleId`   | string  | Unique schedule ID      |
| `scheduledFor` | string  | Scheduled delivery time |

**Status Codes**:

- `200 OK`: Notification scheduled successfully
- `400 Bad Request`: Invalid request data or past timestamp
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X POST https://your-domain.com/api/push/schedule \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "Scheduled Notification",
    "body": "This is a scheduled notification.",
    "scheduledFor": "2026-02-12T10:00:00.000Z"
  }'
```

---

### Copilot Integration

#### GET /api/copilot/models

Retrieve available AI models for Copilot integration.

**Endpoint**: `GET /api/copilot/models`

**Authentication**: None required

**Rate Limit**: 30 requests per minute

**Request Parameters**: None

**Response**:

```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "provider": "openai",
      "description": "Most capable GPT-4 model",
      "contextWindow": 8192,
      "pricing": {
        "input": 0.03,
        "output": 0.06
      }
    },
    {
      "id": "claude-3-opus",
      "name": "Claude 3 Opus",
      "provider": "anthropic",
      "description": "Most powerful Claude model",
      "contextWindow": 200000,
      "pricing": {
        "input": 0.015,
        "output": 0.075
      }
    }
  ],
  "defaultModel": "gpt-4"
}
```

**Response Fields**:

| Field                    | Type   | Description              |
| ------------------------ | ------ | ------------------------ |
| `models`                 | array  | List of available models |
| `models[].id`            | string | Model identifier         |
| `models[].name`          | string | Model name               |
| `models[].provider`      | string | AI provider              |
| `models[].description`   | string | Model description        |
| `models[].contextWindow` | number | Context window size      |
| `models[].pricing`       | object | Pricing information      |
| `defaultModel`           | string | Default model ID         |

**Status Codes**:

- `200 OK`: Models retrieved successfully
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X GET https://your-domain.com/api/copilot/models
```

#### POST /api/copilot/completions

Generate AI completions using Copilot integration.

**Endpoint**: `POST /api/copilot/completions`

**Authentication**: Required (API key)

**Rate Limit**: 20 requests per minute

**Request Body**:

```json
{
  "model": "gpt-4",
  "prompt": "Explain this SQL injection vulnerability...",
  "context": {
    "language": "javascript",
    "code": "const query = 'SELECT * FROM users WHERE id = ' + userId;",
    "vulnerability": "sql-injection"
  },
  "options": {
    "maxTokens": 500,
    "temperature": 0.7,
    "topP": 0.9
  }
}
```

**Request Fields**:

| Field                   | Type   | Required | Description                |
| ----------------------- | ------ | -------- | -------------------------- |
| `model`                 | string | Yes      | Model ID to use            |
| `prompt`                | string | Yes      | Input prompt               |
| `context`               | object | No       | Additional context         |
| `context.language`      | string | No       | Programming language       |
| `context.code`          | string | No       | Code snippet               |
| `context.vulnerability` | string | No       | Vulnerability type         |
| `options`               | object | No       | Generation options         |
| `options.maxTokens`     | number | No       | Maximum tokens to generate |
| `options.temperature`   | number | No       | Sampling temperature (0-1) |
| `options.topP`          | number | No       | Nucleus sampling parameter |

**Response**:

```json
{
  "id": "cmpl_1234567890",
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "This SQL injection vulnerability occurs because..."
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 50,
    "completionTokens": 150,
    "totalTokens": 200
  }
}
```

**Response Fields**:

| Field                       | Type   | Description            |
| --------------------------- | ------ | ---------------------- |
| `id`                        | string | Completion ID          |
| `model`                     | string | Model used             |
| `choices`                   | array  | Generated completions  |
| `choices[].index`           | number | Choice index           |
| `choices[].message`         | object | Generated message      |
| `choices[].message.role`    | string | Message role           |
| `choices[].message.content` | string | Generated content      |
| `choices[].finishReason`    | string | Completion reason      |
| `usage`                     | object | Token usage            |
| `usage.promptTokens`        | number | Prompt tokens used     |
| `usage.completionTokens`    | number | Completion tokens used |
| `usage.totalTokens`         | number | Total tokens used      |

**Status Codes**:

- `200 OK`: Completion generated successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
  | `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X POST https://your-domain.com/api/copilot/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_api_key>" \
  -d '{
    "model": "gpt-4",
    "prompt": "Explain this SQL injection vulnerability...",
    "context": {
      "language": "javascript",
      "code": "const query = '\''SELECT * FROM users WHERE id = '\'' + userId;"
    }
  }'
```

---

### Error Logging

#### POST /api/log-error

Log client-side errors for monitoring and debugging.

**Endpoint**: `POST /api/log-error`

**Authentication**: None required

**Rate Limit**: 60 requests per minute

**Request Body**:

```json
{
  "error": {
    "name": "TypeError",
    "message": "Cannot read property 'x' of undefined",
    "stack": "TypeError: Cannot read property 'x' of undefined\n    at ..."
  },
  "context": {
    "url": "https://your-domain.com/analysis",
    "userAgent": "Mozilla/5.0 ...",
    "timestamp": "2026-02-11T06:55:00.000Z",
    "userId": "optional-user-id"
  },
  "metadata": {
    "component": "AnalysisDashboard",
    "action": "analyzeFile",
    "additionalInfo": {}
  }
}
```

**Request Fields**:

| Field               | Type   | Required | Description              |
| ------------------- | ------ | -------- | ------------------------ |
| `error`             | object | Yes      | Error object             |
| `error.name`        | string | Yes      | Error name               |
| `error.message`     | string | Yes      | Error message            |
| `error.stack`       | string | No       | Error stack trace        |
| `context`           | object | No       | Error context            |
| `context.url`       | string | No       | URL where error occurred |
| `context.userAgent` | string | No       | User agent string        |
| `context.timestamp` | string | No       | Error timestamp          |
| `context.userId`    | string | No       | User identifier          |
| `metadata`          | object | No       | Additional metadata      |

**Response**:

```json
{
  "success": true,
  "message": "Error logged successfully",
  "errorId": "err_1234567890"
}
```

**Response Fields**:

| Field     | Type    | Description        |
| --------- | ------- | ------------------ |
| `success` | boolean | Log success status |
| `message` | string  | Status message     |
| `errorId` | string  | Unique error ID    |

**Status Codes**:

- `200 OK`: Error logged successfully
- `400 Bad Request`: Invalid request data
- `500 Internal Server Error`: Server error

**Example Request**:

```bash
curl -X POST https://your-domain.com/api/log-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "name": "TypeError",
      "message": "Cannot read property '\''x'\'' of undefined"
    },
    "context": {
      "url": "https://your-domain.com/analysis"
    }
  }'
```

---

## Error Codes

### Standard HTTP Status Codes

| Code | Name                  | Description                     |
| ---- | --------------------- | ------------------------------- |
| 200  | OK                    | Request successful              |
| 201  | Created               | Resource created successfully   |
| 400  | Bad Request           | Invalid request data            |
| 401  | Unauthorized          | Authentication required         |
| 403  | Forbidden             | Access denied                   |
| 404  | Not Found             | Resource not found              |
| 429  | Too Many Requests     | Rate limit exceeded             |
| 500  | Internal Server Error | Server error                    |
| 503  | Service Unavailable   | Service temporarily unavailable |

### Application-Specific Error Codes

| Code                     | Name                           | Description |
| ------------------------ | ------------------------------ | ----------- |
| `INVALID_SUBSCRIPTION`   | Invalid push subscription data |
| `SUBSCRIPTION_NOT_FOUND` | Push subscription not found    |
| `INVALID_MODEL`          | Invalid AI model specified     |
| `RATE_LIMIT_EXCEEDED`    | API rate limit exceeded        |
| `AUTHENTICATION_FAILED`  | Authentication failed          |
| `INVALID_TIMESTAMP`      | Invalid timestamp format       |

### Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  },
  "requestId": "req_1234567890"
}
```

**Error Response Fields**:

| Field           | Type   | Description                    |
| --------------- | ------ | ------------------------------ |
| `error`         | object | Error object                   |
| `error.code`    | string | Error code                     |
| `error.message` | string | Error message                  |
| `error.details` | object | Additional error details       |
| `requestId`     | string | Unique request ID for tracking |

---

## Rate Limiting

### Rate Limit Policy

API endpoints are rate-limited to prevent abuse and ensure fair usage:

| Endpoint                   | Rate Limit  | Window   |
| -------------------------- | ----------- | -------- |
| `/api/health`              | 60 requests | 1 minute |
| `/api/analytics`           | 30 requests | 1 minute |
| `/api/analytics/pwa`       | 30 requests | 1 minute |
| `/api/push/subscribe`      | 10 requests | 1 minute |
| `/api/push/unsubscribe`    | 10 requests | 1 minute |
| `/api/push/send`           | 20 requests | 1 minute |
| `/api/push/schedule`       | 10 requests | 1 minute |
| `/api/copilot/models`      | 30 requests | 1 minute |
| `/api/copilot/completions` | 20 requests | 1 minute |
| `/api/log-error`           | 60 requests | 1 minute |

### Rate Limit Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1676179200
```

**Header Fields**:

| Header                  | Description                          |
| ----------------------- | ------------------------------------ |
| `X-RateLimit-Limit`     | Maximum requests per window          |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset`     | Unix timestamp when limit resets     |

### Rate Limit Exceeded Response

When rate limit is exceeded:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 60,
      "remaining": 0,
      "resetAt": "2026-02-11T07:00:00.000Z"
    }
  },
  "requestId": "req_1234567890"
}
```

---

## Examples

### JavaScript/TypeScript

#### Health Check

```typescript
async function checkHealth() {
  const response = await fetch("https://your-domain.com/api/health");
  const data = await response.json();
  console.log(data.status); // "healthy"
}
```

#### Push Notification Subscription

```typescript
async function subscribeToPush() {
  const subscription = await navigator.serviceWorker.ready.then(
    (registration) =>
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })
  );

  const response = await fetch("https://your-domain.com/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription }),
  });

  const data = await response.json();
  console.log(data.subscriptionId);
}
```

#### AI Completion

```typescript
async function getAICompletion(prompt: string) {
  const response = await fetch(
    "https://your-domain.com/api/copilot/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        prompt,
        options: { maxTokens: 500 },
      }),
    }
  );

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Python

#### Health Check

```python
import requests

def check_health():
    response = requests.get('https://your-domain.com/api/health')
    data = response.json()
    print(data['status'])  # "healthy"
```

#### Analytics

```python
import requests

def get_analytics():
    params = {
        'startDate': '2026-02-01',
        'endDate': '2026-02-11'
    }
    response = requests.get('https://your-domain.com/api/analytics', params=params)
    data = response.json()
    print(data['summary']['totalAnalyses'])
```

### cURL

#### Health Check

```bash
curl -X GET https://your-domain.com/api/health
```

#### Push Notification

```bash
curl -X POST https://your-domain.com/api/push/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification."
  }'
```

#### Error Logging

```bash
curl -X POST https://your-domain.com/api/log-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "name": "Error",
      "message": "Something went wrong"
    }
  }'
```

---

## Best Practices

1. **Handle Errors Gracefully**: Always check response status and handle errors appropriately
2. **Respect Rate Limits**: Implement exponential backoff for rate-limited requests
3. **Use HTTPS**: Always use HTTPS for secure communication
4. **Validate Input**: Validate all input data before sending to API
5. **Cache Responses**: Cache responses where appropriate to reduce API calls
6. **Monitor Usage**: Monitor your API usage to avoid hitting rate limits
7. **Use Request IDs**: Include request IDs in error reports for debugging

---

## Support

For API-related questions or issues:

- **Documentation**: See [README.md](README.md) for general documentation
- **Issues**: Report bugs on [GitHub Issues](https://github.com/Xenonesis/code-guardian-report/issues)
- **Security**: Report security vulnerabilities via [SECURITY.md](SECURITY.md)

---

## Changelog

### Version 13.0.0 (2026-02-11)

- Added comprehensive API documentation
- Documented all available endpoints
- Added examples in multiple languages
- Standardized error response format

---

_Last updated: February 11, 2026_
