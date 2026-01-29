# Production Deployment Guide

## Code Guardian Enterprise - Deployment Documentation

This guide covers deploying Code Guardian Enterprise to production environments.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
   - [Vercel (Recommended)](#vercel-recommended)
   - [Docker](#docker)
   - [Self-Hosted](#self-hosted)
4. [Post-Deployment Checklist](#post-deployment-checklist)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: v22.x or higher
- **npm**: v9.0.0 or higher
- **Memory**: Minimum 1GB RAM (2GB+ recommended)
- **Storage**: 500MB for application + dependencies

### Required Accounts

- [Vercel](https://vercel.com) account (for Vercel deployment)
- [Firebase](https://firebase.google.com) project (for authentication & database)
- Domain name (optional, for custom domain)

---

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.example .env.local
```

### 2. Configure Required Variables

```env
# Required for production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Firebase (required for auth & storage)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Optional AI Provider Configuration

```env
# OpenAI (for AI analysis features)
OPENAI_API_KEY=your_openai_key

# Or Anthropic Claude
ANTHROPIC_API_KEY=your_anthropic_key

# Or Google Gemini
GEMINI_API_KEY=your_gemini_key
```

---

## Deployment Options

### Vercel (Recommended)

Vercel provides the best experience for Next.js applications.

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/code-guardian-report)

#### Manual Deploy

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy to Production**

   ```bash
   npm run deploy:vercel
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `.env.example`

#### Vercel Configuration

The `vercel.json` file includes:

- Optimized caching headers
- Security headers (CSP, HSTS, X-Frame-Options)
- Function configuration (30s timeout, 1GB memory)
- Redirects for backward compatibility

---

### Docker

Build and run using Docker for containerized deployments.

#### Build Image

```bash
npm run docker:build
# or
docker build -t code-guardian:latest .
```

#### Run Container

```bash
npm run docker:run
# or
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_FIREBASE_API_KEY=xxx \
  # ... other env vars
  code-guardian:latest
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  code-guardian:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "require('http').get('http://localhost:3000/api/health')",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
```

Run with:

```bash
docker-compose up -d
```

---

### Self-Hosted

For traditional server deployments.

#### 1. Build Application

```bash
# Clean build
npm run build:prod
```

#### 2. Start Production Server

```bash
npm run start:prod
```

#### 3. Process Manager (PM2)

Install PM2 for process management:

```bash
npm i -g pm2
```

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "code-guardian",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Nginx Reverse Proxy

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Post-Deployment Checklist

### Security Verification

- [ ] HTTPS is enabled and enforced
- [ ] Security headers are present (check with [SecurityHeaders.com](https://securityheaders.com))
- [ ] CSP is properly configured
- [ ] HSTS is enabled with preload

### Functionality Testing

- [ ] Homepage loads correctly
- [ ] Authentication works (sign in/sign up)
- [ ] File upload analysis works
- [ ] GitHub integration works
- [ ] PWA installation works
- [ ] Theme switching works
- [ ] All pages are accessible

### Performance Verification

- [ ] Lighthouse score > 90 for all metrics
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Core Web Vitals pass

### Health Check

```bash
# Verify health endpoint
curl https://your-domain.com/api/health

# Expected response:
# {"status":"healthy","version":"11.0.0",...}
```

---

## Monitoring & Maintenance

### Built-in Monitoring

- **Vercel Analytics**: Automatically enabled for Vercel deployments
- **Vercel Speed Insights**: Real user monitoring
- **Health Endpoint**: `/api/health` for uptime monitoring

### Recommended External Tools

- **Uptime Monitoring**: UptimeRobot, Pingdom, or Better Uptime
- **Error Tracking**: Sentry, LogRocket, or Datadog
- **Performance**: Google PageSpeed Insights, WebPageTest

### Regular Maintenance

1. **Weekly**
   - Review error logs
   - Check health endpoint status
   - Monitor performance metrics

2. **Monthly**
   - Update dependencies (`npm update`)
   - Run security audit (`npm audit`)
   - Review and rotate API keys if needed

3. **Quarterly**
   - Full security review
   - Performance optimization
   - Update sitemap and SEO

---

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
npm run clean:all
npm install
npm run build
```

#### Memory Issues

Increase Node.js memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Firebase Connection Issues

1. Check Firebase project settings
2. Verify API key permissions
3. Check Firestore rules
4. Ensure authentication is enabled

#### PWA Not Installing

1. Verify HTTPS is enabled
2. Check manifest.json is accessible
3. Verify service worker is registered
4. Check browser console for errors

### Getting Help

- **Documentation**: Check `/help` page
- **GitHub Issues**: Report bugs and feature requests
- **Community**: Join our Discord/Slack

---

## Version History

| Version | Date       | Changes                  |
| ------- | ---------- | ------------------------ |
| 11.0.0  | 2026-01-01 | Production-ready release |

---

_Last updated: January 1, 2026_
