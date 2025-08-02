# Firebase Firestore Connection Issues - Troubleshooting Guide

## Current Issues Identified

Based on the console logs, you're experiencing:

1. **400 Bad Request errors** from Firestore WebChannel connections
2. **Cross-Origin-Opener-Policy (COOP) issues** blocking popup authentication
3. **Transport errors** causing connection failures
4. **Repeated connection attempts** that are failing

## Immediate Solutions Applied

### 1. Enhanced Connection Management
- ✅ Increased operation timeouts from 8s to 15s
- ✅ Added better error detection for 400 errors and WebChannel issues
- ✅ Implemented localStorage fallback for user profiles
- ✅ Added connection recovery with longer wait times

### 2. Firebase Configuration Improvements
- ✅ Added network stability configuration
- ✅ Enhanced auth provider settings for COOP compatibility
- ✅ Improved error handling for transport errors

### 3. Debug Tools Added
- ✅ Firebase status monitor component (bottom-right corner in dev mode)
- ✅ Connection diagnostics and reset functionality
- ✅ Real-time status monitoring

## Manual Troubleshooting Steps

### Step 1: Check Environment Variables
Ensure your `.env.local` file has all required Firebase configuration:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 2: Verify Firebase Project Settings

1. **Check Firestore Rules** (already configured):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /tasks/{taskId} {
         allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```

2. **Check Authentication Settings**:
   - Go to Firebase Console → Authentication → Settings
   - Ensure your domain is added to authorized domains
   - For localhost: `localhost` should be in the list
   - For production: add your Vercel domain

### Step 3: Browser-Specific Issues

#### Chrome/Chromium Issues:
The COOP errors suggest browser security restrictions. Try:

1. **Disable COOP temporarily** (for testing):
   ```bash
   # Launch Chrome with disabled security (TESTING ONLY)
   chrome --disable-web-security --disable-features=VizDisplayCompositor --user-data-dir=/tmp/chrome_dev_test
   ```

2. **Clear browser data**:
   - Clear cookies, localStorage, and cache for your domain
   - Restart the browser

#### Firefox:
- Generally has fewer COOP issues
- Try testing in Firefox to isolate Chrome-specific problems

### Step 4: Network and Firewall Issues

1. **Check if Firestore is accessible**:
   ```bash
   # Test connectivity to Firestore
   curl -I https://firestore.googleapis.com
   ```

2. **Corporate/School Networks**:
   - Some networks block Google services
   - Try using a different network or mobile hotspot

3. **VPN Issues**:
   - Some VPNs can interfere with Firebase connections
   - Try disabling VPN temporarily

### Step 5: Firebase Project Issues

1. **Check Firebase Console**:
   - Go to Firebase Console → Project Settings
   - Verify project is active and not suspended
   - Check usage quotas

2. **Firestore Database**:
   - Ensure Firestore is enabled (not Realtime Database)
   - Check if database is in the correct region

## Using the Debug Tools

### Firebase Status Component
In development mode, you'll see a "🔥 Firebase" button in the bottom-right corner:

1. **Click to open** the status panel
2. **Check status** of Auth, Firestore, and Network
3. **Use "Reset Connection"** to force reconnect Firestore
4. **Use "Diagnose"** to run comprehensive checks (check browser console)

### Browser Console Commands
The debug tools are also available in the browser console:

```javascript
// Check current status
firebaseDebugger.logStatus();

// Run full diagnosis
firebaseDebugger.diagnose();

// Test Firestore connection
firebaseDebugger.testFirestoreConnection();

// Reset connection
firebaseDebugger.resetFirestoreConnection();
```

## Common Error Messages and Solutions

### "400 Bad Request" from Firestore
- **Cause**: Usually authentication or project configuration issues
- **Solution**: Check Firebase project settings and auth configuration

### "Cross-Origin-Opener-Policy policy would block"
- **Cause**: Browser security policy blocking popup authentication
- **Solution**: The app now automatically falls back to redirect authentication

### "WebChannelConnection RPC 'Listen' stream transport errored"
- **Cause**: Network connectivity or Firestore service issues
- **Solution**: Connection manager now handles these automatically with retries

### "Failed to get document because the client is offline"
- **Cause**: Firestore thinks it's offline when it's not
- **Solution**: Use the "Reset Connection" button or the connection will auto-recover

## Fallback Behavior

The app now includes several fallback mechanisms:

1. **localStorage Backup**: User profiles are stored locally when Firestore fails
2. **Offline Mode**: App continues to work with cached data
3. **Redirect Auth**: Falls back to redirect-based auth when popups fail
4. **Connection Recovery**: Automatically attempts to reconnect

## If Issues Persist

1. **Check Firebase Status**: https://status.firebase.google.com/
2. **Try Different Browser**: Test in Firefox, Safari, or Edge
3. **Check Network**: Try different network connection
4. **Contact Support**: If using Firebase paid plan, contact Firebase support

## Development vs Production

- **Development**: All debug tools are enabled
- **Production**: Debug tools are hidden, but fallback mechanisms still work

The app should now be much more resilient to connection issues and provide better user experience even when Firestore is having problems.