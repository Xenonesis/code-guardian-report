# Firebase → Neon + Prisma Migration Guide

## Overview

This document outlines the migration from Firebase (Firestore + Auth) to **Neon PostgreSQL + Prisma + NextAuth**.

## Why This Migration?

- **No 1MB Document Limit**: Firestore truncates analysis results; PostgreSQL JSONB handles any size
- **Type Safety**: Prisma auto-generates TypeScript types
- **Better Queries**: Complex filtering, aggregation, full-text search
- **Cost Efficiency**: Lower cost at scale compared to Firestore
- **ACID Compliance**: Reliable transactions for user stats

---

## Completed Changes

### 1. Database Schema (`prisma/schema.prisma`)

Created comprehensive schema replacing all Firestore collections:

- **User** → Replaces Firebase Authentication
- **AnalysisResult** → Replaces Firestore `analysisResults` collection
- **UserStats** → Replaces Firestore `userStats` collection
- **UserSettings** → Replaces Firestore `settings` collection
- **GitHubRepo** → Replaces Firestore `githubRepos` collection
- **Webhook** → Replaces Firestore `webhooks` collection

### 2. Database Client (`src/lib/prisma.ts`)

Singleton Prisma client instance with proper global caching for development.

### 3. Authentication (`src/lib/auth.ts` + `app/api/auth/[...nextauth]/route.ts`)

- NextAuth with GitHub OAuth provider
- Automatic user creation/upsert in PostgreSQL
- JWT session strategy

### 4. Storage Service (`src/services/storage/prismaAnalysisStorage.ts`)

Complete CRUD service replacing `FirebaseAnalysisStorageService`:
- `storeAnalysisResults()` → No truncation!
- `getAnalysisById()`
- `getUserAnalysisHistory()`
- `deleteAnalysisResults()`
- `updateAnalysisResults()`
- `searchAnalysis()`
- `getUserStats()`

### 5. API Routes

- `app/api/analysis/route.ts` → GET/POST analysis
- `app/api/analysis/[id]/route.ts` → GET/PUT/DELETE individual analysis

### 6. Environment Variables

Updated `.env.local` and `.env.example`:
- Added `DATABASE_URL` for Neon
- Added `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
- Marked Firebase config as deprecated

### 7. Package Scripts

Added to `package.json`:
- `db:migrate` → Run Prisma migrations
- `db:generate` → Generate Prisma client
- `db:studio` → Open Prisma Studio
- `db:push` → Push schema to database

---

## Remaining Changes (Manual Steps)

### 1. Update React Hooks

Files to update:
- `src/hooks/useFirebaseAnalysis.ts` → Use `prismaAnalysisStorage`
- `src/hooks/useEnhancedAnalysis.ts` → Use `prismaAnalysisStorage`
- `src/hooks/useAuth.ts` → Use NextAuth `useSession` instead of Firebase auth

### 2. Update Services

Files to update:
- `src/services/analysisIntegrationService.ts` → Replace Firebase calls
- `src/services/rules/CustomRulesEngine.ts` → Remove Firestore dependency
- `src/services/monitoring/WebhookManager.ts` → Remove Firestore dependency
- `src/services/index.ts` → Update exports

### 3. Update Components

Files to update:
- `app/providers.tsx` → Remove Firestore-related components (already wrapped with NextAuthProvider)
- `app/history/HistoryPageClient.tsx` → Use Prisma types
- Components importing Firebase types

### 4. Update MCP Server

Files to update:
- `src/mcp/transports/stdio.ts` → Use Prisma instead of Firestore
- `src/mcp/transports/http.ts` → Use Prisma instead of Firestore
- `src/mcp/memory/database.ts` → Create PrismaMemoryStore

### 5. Update Tests

Files to update:
- `src/tests/setup.ts` → Mock Prisma instead of Firebase
- `src/tests/firebaseIntegrationTest.ts` → Rename and update

### 6. Remove Firebase Dependencies

Once migration is complete:
```bash
npm uninstall firebase firebase-admin
```

Delete files:
- `src/lib/firebase.ts`
- `src/lib/firebaseAdmin.ts`
- `src/lib/firestore-config.ts`
- `src/lib/firestore-utils.ts`
- `src/lib/firestore-error-handler.ts`
- `src/lib/connection-manager.ts`
- `src/services/storage/firebaseAnalysisStorage.ts`

---

## Activation Steps

### 1. Create Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 2. Configure Environment

Update `.env.local`:
```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Push Schema

```bash
npm run db:push
npm run db:generate
```

### 4. Start Development

```bash
npm run dev
```

---

## Rollback Plan

If issues occur:
1. Keep Firebase config in `.env.local` (marked as deprecated)
2. Revert to Firebase services by updating imports
3. Both systems can run concurrently during transition

---

## Benefits Summary

| Feature | Firebase | Neon + Prisma |
|---------|----------|---------------|
| Document Size | 1MB limit | Unlimited |
| Query Flexibility | Limited | Full SQL |
| Type Safety | None | Full TypeScript |
| Transactions | Limited | Full ACID |
| Cost at Scale | $$$ | $ |
| Real-time | Built-in | Can add with SSE |
| Offline Support | Built-in | Can implement |

---

## Support

For issues during migration:
1. Check `MIGRATION.md` (this file)
2. Review Prisma docs: [prisma.io/docs](https://www.prisma.io/docs)
3. Review NextAuth docs: [next-auth.js.org](https://next-auth.js.org)
