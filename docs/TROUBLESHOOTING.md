# Troubleshooting Guide

## Code Guardian Report - Common Issues and Solutions

This guide provides solutions to common issues you may encounter while using Code Guardian Report.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Build & Deployment Problems](#build--deployment-problems)
3. [Firebase Configuration Issues](#firebase-configuration-issues)
4. [GitHub API Authentication Problems](#github-api-authentication-problems)
5. [PWA Installation Issues](#pwa-installation-issues)
6. [Performance Optimization](#performance-optimization)
7. [Analysis Issues](#analysis-issues)
8. [Browser Compatibility](#browser-compatibility)
9. [Getting Help](#getting-help)

---

## Installation Issues

### Problem: `npm install` fails with dependency errors

**Symptoms**:

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions**:

1. **Clear npm cache**:

   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json**:

   ```bash
   rm -rf node_modules package-lock.json
   # On Windows:
   # rmdir /s /q node_modules
   # del package-lock.json
   ```

3. **Reinstall dependencies**:

   ```bash
   npm install
   ```

4. **Use legacy peer deps** (if needed):
   ```bash
   npm install --legacy-peer-deps
   ```

---

### Problem: Node.js version mismatch

**Symptoms**:

```
Error: The module was compiled against a different Node.js version
```

**Solutions**:

1. **Check current Node.js version**:

   ```bash
   node --version
   ```

2. **Install Node.js 22.x** using nvm (Node Version Manager):

   ```bash
   # Install nvm if not already installed
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Install Node.js 22.x
   nvm install 22
   nvm use 22
   ```

3. **Verify installation**:
   ```bash
   node --version  # Should show v22.x.x
   npm --version   # Should show v9.x.x or higher
   ```

---

### Problem: Git hooks not working

**Symptoms**:

- Pre-commit hooks not running
- Lint-staged not executing

**Solutions**:

1. **Reinstall git hooks**:

   ```bash
   npm run setup-git-hooks
   ```

2. **Verify Husky installation**:

   ```bash
   npx husky install
   ```

3. **Check git hooks directory**:

   ```bash
   ls -la .husky/
   ```

4. **Manually set git hooks path**:
   ```bash
   git config core.hooksPath .husky
   ```

---

## Build & Deployment Problems

### Problem: TypeScript compilation errors

**Symptoms**:

```
Type error: Cannot find name 'X'
Type error: Property 'X' does not exist on type 'Y'
```

**Solutions**:

1. **Run type checking to see detailed errors**:

   ```bash
   npm run type-check
   ```

2. **Restart TypeScript server** (VS Code):
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "TypeScript: Restart TS Server"
   - Press Enter

3. **Clear TypeScript cache**:

   ```bash
   rm -rf .next
   npm run build
   ```

4. **Check tsconfig.json**:
   - Ensure all paths are correct
   - Verify compiler options are valid

---

### Problem: Out of memory during build

**Symptoms**:

```
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed
```

**Solutions**:

1. **Increase Node.js memory limit**:

   ```bash
   NODE_OPTIONS=--max-old-space-size=4096 npm run build
   ```

2. **For Windows (PowerShell)**:

   ```powershell
   $env:NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

3. **For Windows (CMD)**:

   ```cmd
   set NODE_OPTIONS=--max-old-space-size=4096
   npm run build
   ```

4. **Clean build**:
   ```bash
   npm run clean:all
   npm install
   npm run build
   ```

---

### Problem: ESLint errors blocking build

**Symptoms**:

```
Linting and checking validity of types...
Found X errors and Y warnings.
```

**Solutions**:

1. **Fix ESLint errors automatically**:

   ```bash
   npm run lint:fix
   ```

2. **Fix Stylelint errors**:

   ```bash
   npm run lint:css:fix
   ```

3. **Format code with Prettier**:

   ```bash
   npm run format
   ```

4. **Check specific file**:

   ```bash
   npm run lint -- src/components/YourComponent.tsx
   ```

5. **Temporarily disable linting** (not recommended for production):
   ```bash
   npm run build -- --no-lint
   ```

---

### Problem: Production build fails on Vercel

**Symptoms**:

- Build fails during deployment
- Error: "Module not found"

**Solutions**:

1. **Check environment variables**:
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Ensure all required variables are set

2. **Verify Node.js version**:
   - Check `vercel.json` for Node.js version
   - Ensure it matches local version

3. **Clear Vercel cache**:
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" with "Clear cache" option

4. **Check build logs**:
   - Review detailed build logs in Vercel dashboard
   - Identify specific error messages

5. **Test locally**:
   ```bash
   npm run build:prod
   npm run start
   ```

---

## Firebase Configuration Issues

### Problem: Firebase authentication not working

**Symptoms**:

- Sign-in button not responding
- "Authentication failed" error

**Solutions**:

1. **Verify Firebase configuration**:

   ```bash
   # Check .env.local
   cat .env.local | grep FIREBASE
   ```

2. **Ensure Firebase project is set up**:
   - Go to Firebase Console
   - Enable Authentication
   - Enable GitHub provider

3. **Check Firebase rules**:

   ```javascript
   // firestore.rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

4. **Test Firebase connection**:

   ```typescript
   import { initializeApp } from "firebase/app";
   import { getAuth } from "firebase/auth";

   const app = initializeApp(firebaseConfig);
   const auth = getAuth(app);
   console.log("Firebase initialized:", !!app);
   ```

---

### Problem: Firestore permission denied

**Symptoms**:

```
FirebaseError: Missing or insufficient permissions
```

**Solutions**:

1. **Update Firestore rules**:

   ```javascript
   // firestore.rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /analyses/{analysisId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

2. **Deploy rules**:

   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Check authentication state**:

   ```typescript
   import { getAuth, onAuthStateChanged } from "firebase/auth";

   const auth = getAuth();
   onAuthStateChanged(auth, (user) => {
     if (user) {
       console.log("User is signed in:", user.uid);
     } else {
       console.log("User is signed out");
     }
   });
   ```

---

### Problem: Firebase storage quota exceeded

**Symptoms**:

- Unable to save analysis results
- "Quota exceeded" error

**Solutions**:

1. **Check Firebase usage**:
   - Go to Firebase Console → Storage
   - Review usage statistics

2. **Upgrade Firebase plan**:
   - Go to Firebase Console → Usage and billing
   - Upgrade to Blaze plan for higher quotas

3. **Clean up old data**:

   ```typescript
   import {
     getFirestore,
     collection,
     query,
     where,
     getDocs,
     deleteDoc,
     doc,
   } from "firebase/firestore";

   const db = getFirestore();
   const oldAnalyses = query(
     collection(db, "analyses"),
     where("timestamp", "<", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
   );

   const snapshot = await getDocs(oldAnalyses);
   snapshot.forEach(async (doc) => {
     await deleteDoc(doc.ref);
   });
   ```

---

## GitHub API Authentication Problems

### Problem: "403 Forbidden" error when accessing repositories

**Symptoms**:

```
Error: 403 Forbidden
Resource not accessible by integration
```

**Solutions**:

1. **Check OAuth token permissions**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Verify token has correct scopes:
     - `repo` (for private repositories)
     - `public_repo` (for public repositories)

2. **Regenerate GitHub token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate new token with required permissions
   - Update `.env.local` with new token

3. **Verify repository access**:
   - Ensure your GitHub account has access to the repository
   - Check if repository is private and you have proper permissions

4. **Check rate limits**:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit
   ```

---

### Problem: Repository analysis timeout

**Symptoms**:

- Analysis hangs indefinitely
- "Request timeout" error

**Solutions**:

1. **Analyze smaller branches**:
   - Choose a branch with fewer files
   - Exclude large binary files

2. **Increase timeout**:

   ```typescript
   const options = {
     timeout: 60000, // 60 seconds
   };
   ```

3. **Check network connectivity**:
   - Ensure stable internet connection
   - Try again with better connection

4. **Use incremental analysis**:
   - Analyze specific directories instead of entire repository
   - Exclude test files and documentation

---

### Problem: GitHub OAuth callback fails

**Symptoms**:

- Redirect loop after OAuth
- "Invalid redirect URI" error

**Solutions**:

1. **Verify callback URL**:
   - Go to GitHub OAuth App settings
   - Ensure callback URL matches:
     ```
     http://localhost:3000/api/auth/github/callback
     ```
   - For production:
     ```
     https://your-domain.com/api/auth/github/callback
     ```

2. **Check environment variables**:

   ```bash
   # .env.local
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
   ```

3. **Clear browser cookies**:
   - Clear cookies for localhost/your domain
   - Try OAuth flow again

---

## PWA Installation Issues

### Problem: PWA not installing

**Symptoms**:

- No install prompt appears
- "Add to Home Screen" option not available

**Solutions**:

1. **Verify HTTPS is enabled**:
   - PWA requires HTTPS (except localhost)
   - Check SSL certificate is valid

2. **Check manifest.json**:

   ```json
   {
     "name": "Code Guardian Report",
     "short_name": "Code Guardian",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#0070f3",
     "icons": [
       {
         "src": "/favicon-192x192.svg",
         "sizes": "192x192",
         "type": "image/svg+xml"
       }
     ]
   }
   ```

3. **Verify service worker is registered**:

   ```typescript
   if ("serviceWorker" in navigator) {
     navigator.serviceWorker
       .register("/sw.js")
       .then((registration) => {
         console.log("SW registered:", registration);
       })
       .catch((error) => {
         console.log("SW registration failed:", error);
       });
   }
   ```

4. **Check browser console for errors**:
   - Open Developer Tools
   - Look for service worker errors
   - Check Application tab for service worker status

---

### Problem: PWA not updating

**Symptoms**:

- Old version persists after deployment
- Changes not reflected

**Solutions**:

1. **Force service worker update**:

   ```javascript
   navigator.serviceWorker.getRegistrations().then((registrations) => {
     registrations.forEach((registration) => {
       registration.update();
     });
   });
   ```

2. **Clear service worker cache**:

   ```javascript
   caches.keys().then((names) => {
     names.forEach((name) => caches.delete(name));
   });
   ```

3. **Unregister service worker**:

   ```javascript
   navigator.serviceWorker.getRegistrations().then((registrations) => {
     registrations.forEach((registration) => registration.unregister());
   });
   ```

4. **Hard refresh browser**:
   - Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

---

### Problem: Offline mode not working

**Symptoms**:

- App doesn't work without internet
- "Network error" when offline

**Solutions**:

1. **Verify service worker caching strategy**:

   ```typescript
   // src/sw.ts
   const serwist = new Serwist({
     precacheEntries: self.__SW_MANIFEST,
     skipWaiting: true,
     clientsClaim: true,
     runtimeCaching: [
       {
         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
         handler: "CacheFirst",
         options: {
           cacheName: "google-fonts-cache",
           expiration: {
             maxEntries: 10,
             maxAgeSeconds: 60 * 60 * 24 * 365,
           },
         },
       },
     ],
   });
   ```

2. **Check offline capabilities**:
   - Open Developer Tools → Network tab
   - Select "Offline" throttling
   - Refresh page and test functionality

3. **Verify IndexedDB is working**:

   ```typescript
   import { openDB } from "idb";

   const db = await openDB("code-guardian", 1);
   console.log("IndexedDB opened:", !!db);
   ```

---

## Performance Optimization

### Problem: Slow analysis on large codebases

**Symptoms**:

- Analysis takes very long time
- Browser becomes unresponsive

**Solutions**:

1. **Optimize analysis options**:

   ```typescript
   const options = {
     includeTests: false, // Skip test files
     includeDocs: false, // Skip documentation
     maxFileSize: 1024 * 1024, // 1MB per file limit
     parallelAnalysis: true, // Enable parallel processing
     cacheResults: true, // Cache intermediate results
   };
   ```

2. **Use chunked analysis**:
   - Analyze directories separately
   - Process files in batches

3. **Close unused browser tabs**:
   - Free up memory
   - Reduce browser resource usage

4. **Increase browser memory**:
   - Chrome: `--max-old-space-size=4096` flag
   - Firefox: Adjust `dom.ipc.processCount` in `about:config`

---

### Problem: High memory usage

**Symptoms**:

- Browser crashes during analysis
- "Out of memory" errors

**Solutions**:

1. **Clear analysis history**:

   ```typescript
   import { AnalysisStorage } from "@/services/storage/analysisStorage";

   const storage = new AnalysisStorage();
   await storage.clearAll();
   ```

2. **Restart browser**:
   - Close all tabs
   - Restart browser completely

3. **Use incremental analysis**:
   - Analyze smaller portions at a time
   - Save intermediate results

4. **Disable AI features** (if not needed):
   ```typescript
   const options = {
     enableAI: false,
   };
   ```

---

### Problem: Slow page load times

**Symptoms**:

- Initial page load takes > 5 seconds
- Poor Lighthouse scores

**Solutions**:

1. **Enable production build**:

   ```bash
   npm run build:prod
   ```

2. **Check bundle size**:

   ```bash
   npm run build:analyze
   ```

3. **Optimize images**:
   - Use Next.js Image component
   - Compress images before adding to project

4. **Enable code splitting**:

   ```typescript
   const HeavyComponent = lazy(() => import("./HeavyComponent"));
   ```

5. **Check Lighthouse report**:
   - Open Developer Tools → Lighthouse
   - Run audit and follow recommendations

---

## Analysis Issues

### Problem: False positive vulnerabilities

**Symptoms**:

- Security issues reported that aren't actually vulnerabilities
- Too many warnings

**Solutions**:

1. **Review and adjust rules**:

   ```typescript
   const customRules = [
     {
       id: "custom-rule-1",
       pattern: /your-pattern/,
       severity: "low",
       description: "Custom rule description",
     },
   ];
   ```

2. **Exclude specific patterns**:

   ```typescript
   const options = {
     excludePatterns: [/test\.ts$/, /\.spec\.ts$/],
   };
   ```

3. **Report false positives**:
   - Create issue on GitHub
   - Include code example and expected behavior

---

### Problem: Language detection fails

**Symptoms**:

- Language not detected correctly
- "Unknown language" error

**Solutions**:

1. **Check file extensions**:
   - Ensure files have correct extensions
   - Use standard extensions (.js, .ts, .py, etc.)

2. **Manually specify language**:

   ```typescript
   const options = {
     language: "javascript",
   };
   ```

3. **Verify language support**:
   - Check if language is in supported list
   - See README.md for supported languages

---

### Problem: Analysis results not saving

**Symptoms**:

- Results disappear after refresh
- "Storage error" message

**Solutions**:

1. **Check IndexedDB**:

   ```typescript
   import { openDB } from "idb";

   const db = await openDB("code-guardian", 1);
   console.log("DB stores:", (await db.listKeys()).length);
   ```

2. **Clear and reset storage**:

   ```typescript
   // Clear IndexedDB
   indexedDB.deleteDatabase("code-guardian");

   // Clear LocalStorage
   localStorage.clear();
   ```

3. **Check browser storage limits**:
   - Chrome: `chrome://settings/cookies`
   - Firefox: `about:preferences#privacy`
   - Ensure sufficient storage is available

---

## Browser Compatibility

### Problem: Safari-specific issues

**Symptoms**:

- Features not working on Safari
- Different behavior than Chrome/Firefox

**Solutions**:

1. **Enable "Disable Cross-Origin Restrictions"** (for local development):
   - Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"
   - Develop → Disable Cross-Origin Restrictions

2. **Check IndexedDB storage limits**:
   - Safari has stricter storage limits
   - Monitor storage usage

3. **Test on Safari**:
   - Use Safari Technology Preview for testing
   - Check console for Safari-specific errors

---

### Problem: Firefox-specific issues

**Symptoms**:

- Features not working on Firefox
- Different behavior than Chrome

**Solutions**:

1. **Allow pop-ups for PDF downloads**:
   - Firefox → Preferences → Privacy & Security
   - Permissions → Pop-ups and Redirects
   - Add exception for your domain

2. **Check IndexedDB permissions**:
   - Firefox → Preferences → Privacy & Security
   - Permissions → Cookies and Site Data
   - Ensure IndexedDB is allowed

3. **Test on Firefox**:
   - Use Firefox Developer Edition for testing
   - Check console for Firefox-specific errors

---

### Problem: Mobile browser issues

**Symptoms**:

- Poor performance on mobile
- UI not responsive

**Solutions**:

1. **Test on mobile devices**:
   - Use Chrome DevTools device emulation
   - Test on actual mobile devices

2. **Optimize for mobile**:
   - Reduce bundle size
   - Optimize images
   - Use responsive design

3. **Check touch events**:
   - Ensure touch targets are large enough (44x44px minimum)
   - Test touch interactions

---

## Getting Help

### Before Asking for Help

1. **Search existing issues**:
   - Check [GitHub Issues](https://github.com/Xenonesis/code-guardian-report/issues)
   - Search for similar problems

2. **Check documentation**:
   - [README.md](README.md) - General documentation
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture details
   - [API.md](API.md) - API reference
   - [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

3. **Gather information**:
   - Operating system and version
   - Browser and version
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Error messages and stack traces
   - Steps to reproduce

### Creating an Issue

When creating a GitHub issue, include:

1. **Title**: Clear, descriptive title
2. **Description**: Detailed description of the problem
3. **Steps to Reproduce**:
   ```bash
   1. Run `npm install`
   2. Run `npm run dev`
   3. Navigate to http://localhost:3000
   4. Upload a ZIP file
   5. Error occurs
   ```
4. **Expected Behavior**: What you expected to happen
5. **Actual Behavior**: What actually happened
6. **Screenshots**: If applicable
7. **Environment Details**:
   - OS: Windows 11
   - Browser: Chrome 120
   - Node.js: v22.0.0
   - npm: v10.0.0

### Community Support

- **GitHub Discussions**: Ask questions and share ideas
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Review all documentation files

### Professional Support

For enterprise support:

- Create issue with label "enterprise-support"
- Include detailed requirements
- Response time: 48-72 hours

---

## Common Error Messages

### "Module not found: Can't resolve 'X'"

**Cause**: Missing dependency or incorrect import path

**Solution**:

```bash
npm install <package-name>
```

### "ReferenceError: X is not defined"

**Cause**: Variable or function not imported

**Solution**:

```typescript
import { X } from "./path/to/X";
```

### "TypeError: Cannot read property 'X' of undefined"

**Cause**: Accessing property of undefined object

**Solution**:

```typescript
// Add null check
if (obj && obj.X) {
  // Use obj.X
}
```

### "Network Error"

**Cause**: Network connectivity issue

**Solution**:

- Check internet connection
- Verify API endpoints are accessible
- Check firewall settings

---

## Performance Tips

1. **Use production build**:

   ```bash
   npm run build:prod
   ```

2. **Enable caching**:
   - Service worker caching
   - Browser caching headers

3. **Optimize images**:
   - Use Next.js Image component
   - Compress images

4. **Code splitting**:
   - Lazy load components
   - Dynamic imports

5. **Minimize re-renders**:
   - Use React.memo
   - Use useCallback and useMemo

---

## Security Tips

1. **Keep dependencies updated**:

   ```bash
   npm update
   npm audit fix
   ```

2. **Use environment variables**:
   - Never commit secrets
   - Use `.env.local` for local development

3. **Enable security headers**:
   - CSP
   - HSTS
   - X-Frame-Options

4. **Validate all inputs**:
   - Use Zod schemas
   - Sanitize user input

---

_Last updated: February 11, 2026_
