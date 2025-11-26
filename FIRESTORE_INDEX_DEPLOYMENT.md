# Firestore Index Deployment Guide

## Overview
This guide explains how to deploy the required Firestore indexes for the GitHub Analysis features.

## Required Indexes

The application requires the following composite indexes:

### 1. Analysis Results Index
- **Collection**: `analysisResults`
- **Fields**:
  - `userId` (Ascending)
  - `createdAt` (Descending)

### 2. GitHub Analyses Index
- **Collection**: `github_analyses`
- **Fields**:
  - `userId` (Ascending)
  - `analyzedAt` (Descending)

### 3. GitHub Repositories Index
- **Collection**: `github_repositories`
- **Fields**:
  - `userId` (Ascending)
  - `lastAnalyzed` (Descending)

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

Deploy indexes automatically using Firebase CLI:

```bash
# Make sure you're logged in to Firebase
firebase login

# Deploy the indexes
firebase deploy --only firestore:indexes
```

This will read from `firestore.indexes.json` and create all necessary indexes.

### Method 2: Manual Creation via Console

If you see an error with a link like:
```
https://console.firebase.google.com/v1/r/project/code-guardian-report/firestore/indexes?create_composite=...
```

1. Click the link in the error message
2. Firebase Console will auto-populate the index creation form
3. Click "Create Index"
4. Wait for the index to build (usually takes a few minutes)

### Method 3: Manual Creation via Console (Step-by-Step)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`code-guardian-report`)
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. For each index above:
   - Select the Collection Group
   - Add fields in the specified order with correct sort direction
   - Click **Create**

## Verifying Indexes

After deployment, verify indexes are active:

1. Go to Firebase Console → Firestore Database → Indexes
2. Check that all indexes show status: **Enabled** (green)
3. Building indexes may take a few minutes depending on data size

## Index Status

- ✅ **Building**: Index is being created
- ✅ **Enabled**: Index is ready to use
- ❌ **Error**: Index creation failed (check configuration)

## Troubleshooting

### Index Build Fails
- Verify field names match exactly (case-sensitive)
- Check that collections have at least one document
- Ensure Firebase project has sufficient quota

### Queries Still Fail After Deployment
- Wait 2-3 minutes for indexes to propagate
- Refresh your application
- Clear browser cache if needed
- Check Firebase Console for index status

### Development vs Production

The app handles missing indexes gracefully:
- **Development**: Shows mock data with warning toast
- **Production**: Returns empty arrays, logs errors

## Cost Considerations

Firestore indexes have minimal cost:
- Free tier includes 20,000 index reads/day
- Each index adds ~$0.18/month per GB of indexed data
- For typical use, costs are negligible

## Testing

After deploying indexes, test by:

1. Sign in to the application
2. Navigate to GitHub Analysis page
3. Check that analytics load without errors
4. Verify no "index required" errors in console

## Additional Resources

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Index Best Practices](https://firebase.google.com/docs/firestore/query-data/index-overview)
