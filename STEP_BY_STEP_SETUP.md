# 🚀 Step-by-Step Setup for code-guardian-report

## ✅ CONFIRMED: Using code-guardian-report

Let's get this set up properly!

---

## 🎯 SCENARIO 1: If Project Doesn't Exist (Most Likely)

### Quick Create Project Flow:

#### Step 1: Create in Firebase Console (2 minutes)

1. **Open**: https://console.firebase.google.com
2. **Click**: "Add project" button
3. **Enter name**: "Code Guardian Report"
4. **Project ID**: 
   - Try to set it as: `code-guardian-report`
   - If taken, accept suggested ID (e.g., `code-guardian-report-a1b2c`)
   - **IMPORTANT**: Note the exact ID Firebase assigns

5. **Google Analytics**: Select "Not right now" (skip it)
6. **Click**: "Create project"
7. **Wait**: ~30 seconds for creation
8. **Click**: "Continue" when ready

#### Step 2: Enable Firestore (1 minute)

1. **In dashboard, click**: "Build" → "Firestore Database"
2. **Click**: "Create database"
3. **Choose**: "Production mode"
4. **Select location**: us-central (or your region)
5. **Click**: "Enable"
6. **Wait**: ~30 seconds

#### Step 3: Enable Authentication (1 minute)

1. **Click**: "Build" → "Authentication"
2. **Click**: "Get started"
3. **Enable Google**:
   - Click "Google"
   - Toggle "Enable"
   - Click "Save"
4. **Enable GitHub** (if needed):
   - Click "GitHub"  
   - Toggle "Enable"
   - Click "Save"

#### Step 4: Get Firebase Config (1 minute)

1. **Click**: ⚙️ "Project settings" (gear icon, bottom left)
2. **Scroll down** to "Your apps"
3. **Click**: Web icon `</>`
4. **App nickname**: "Code Guardian Web"
5. **Click**: "Register app"
6. **Copy** the firebaseConfig object shown

**You'll see:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "code-guardian-report.firebaseapp.com",
  projectId: "code-guardian-report", // ← Note this!
  storageBucket: "code-guardian-report.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

#### Step 5: Update .env.local

Create/update your `.env.local` file:

```env
VITE_FIREBASE_API_KEY="[apiKey from step 4]"
VITE_FIREBASE_AUTH_DOMAIN="[authDomain from step 4]"
VITE_FIREBASE_PROJECT_ID="[projectId from step 4]"
VITE_FIREBASE_STORAGE_BUCKET="[storageBucket from step 4]"
VITE_FIREBASE_MESSAGING_SENDER_ID="[messagingSenderId from step 4]"
VITE_FIREBASE_APP_ID="[appId from step 4]"
```

---

## 🎯 SCENARIO 2: If Project Already Exists

### If you found the project in console:

#### Step 1: Note the Exact Project ID

Look under the project name in Firebase Console. 

**Examples:**
- `code-guardian-report` ✅ Perfect!
- `code-guardian-report-a1b2c` ✅ That's fine
- `codeguardian` ✅ That works too

#### Step 2: Verify Your .env.local

Make sure `.env.local` has the correct project ID.

If project ID is different (e.g., `code-guardian-report-a1b2c`):

```env
VITE_FIREBASE_PROJECT_ID="code-guardian-report-a1b2c"
```

**Tell me the ID and I'll update everything!**

---

## 🔧 AFTER SETUP: Deploy Indexes

Once you have the project ready:

### Step 1: Add Project to Firebase CLI

```bash
firebase login
firebase use --add
```

Select your project from the list.

### Step 2: Verify Connection

```bash
firebase projects:list
```

Should show your `code-guardian-report` (or variant).

### Step 3: Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

**Expected output:**
```
=== Deploying to 'code-guardian-report'...
✔ firestore: deployed indexes successfully
✔ Deploy complete!
```

### Step 4: Verify Indexes Building

```bash
firebase firestore:indexes
```

Should show 3 indexes building/ready.

---

## 🧪 TESTING

### Step 1: Hard Refresh Browser

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### Step 2: Test Application

1. Open: http://localhost:5173
2. Sign in with Google
3. Navigate to GitHub Analysis
4. Try analyzing a repository

### Step 3: Verify Console

Open browser console (F12):

**Expected** (good):
```
✅ [DEBUG] Connected to Firebase
✅ [INFO] Fetched repositories
✅ No errors
```

**Not Expected** (bad):
```
❌ [ERROR] Firebase: Permission denied
❌ [ERROR] Query requires an index
```

---

## 📋 QUICK CHECKLIST

### Firebase Console Setup:
- [ ] Project created/found
- [ ] Firestore enabled
- [ ] Authentication enabled (Google, GitHub)
- [ ] Got Firebase config values

### Local Configuration:
- [ ] Updated `.env.local` with correct values
- [ ] Updated `.firebaserc` with project ID
- [ ] All config values match Firebase Console

### Firebase CLI:
- [ ] Authenticated with `firebase login`
- [ ] Added project with `firebase use --add`
- [ ] Deployed indexes with `firebase deploy`
- [ ] Verified indexes with `firebase firestore:indexes`

### Application Testing:
- [ ] Hard refreshed browser
- [ ] Signed in successfully
- [ ] No Firebase errors in console
- [ ] Features work correctly

---

## 💡 ALTERNATIVE: Use Template Config

If you just created the project, I can provide a template `.env.local`:

```env
# Firebase Configuration for Code Guardian Report
VITE_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
VITE_FIREBASE_AUTH_DOMAIN="code-guardian-report.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="code-guardian-report"
VITE_FIREBASE_STORAGE_BUCKET="code-guardian-report.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID_HERE"
VITE_FIREBASE_APP_ID="YOUR_APP_ID_HERE"
```

Replace the `YOUR_*_HERE` values with actual values from Firebase Console.

---

## 🆘 TROUBLESHOOTING

### Issue: "Project ID already in use"

**Solution**: Use the suggested ID Firebase provides, then tell me what it is.

### Issue: "Permission denied" after setup

**Solution**: 
- Verify you're signed in with correct Google account
- Check Firebase Auth is enabled
- Check Firestore security rules

### Issue: "Cannot connect to Firebase"

**Solution**:
- Verify .env.local values are correct
- Check no typos in configuration
- Restart dev server: `npm run dev`

---

## 📞 TELL ME WHEN READY

After creating/finding the project, tell me:

**Template:**
```
✅ Project created/found
Project ID: [exact ID]
Got Firebase config: Yes/No
Ready for index deployment: Yes/No
```

Then I'll help with the next steps!

---

**Current Status**: ⏸️ Waiting for Firebase Console action

**Next**: Create project OR tell me the existing project ID
