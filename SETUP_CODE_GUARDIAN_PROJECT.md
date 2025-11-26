# 🔧 Setting Up Firebase CLI for code-guardian-report

## ✅ CONFIRMED PROJECT

**Using**: `code-guardian-report`

---

## 🎯 WHAT WE NEED TO DO

1. Add Firebase CLI access to `code-guardian-report` project
2. Deploy indexes to the correct project
3. Verify everything works

---

## 📋 STEP-BY-STEP SETUP

### Step 1: Check Project Access

First, let's verify you can access the project in Firebase Console:

**Open**: https://console.firebase.google.com/project/code-guardian-report

**Expected**: You should see the project dashboard

**If you can't access it:**
- You may need to be added as a collaborator
- Or the project might not exist yet
- Or the project ID might be slightly different

---

### Step 2: Add Project to Firebase CLI

Run this command to add the project:

```bash
firebase use --add
```

**What happens:**
1. Firebase CLI will show you a list of your accessible projects
2. Select `code-guardian-report` from the list
3. Give it an alias (e.g., "production" or "default")

**If you don't see `code-guardian-report` in the list:**
- You need owner/editor access to the project
- Check Firebase Console → Project Settings → Users and permissions
- Ask the project owner to add your Google account

---

### Step 3: Verify Project Connection

Check that Firebase CLI is connected:

```bash
firebase projects:list
```

**Expected Output:**
```
✔ Preparing the list of your Firebase projects
┌──────────────────────┬───────────────────────┬────────────────┐
│ Project Display Name │ Project ID            │ Project Number │
├──────────────────────┼───────────────────────┼────────────────┤
│ Code Guardian Report │ code-guardian-report  │ XXXXXXXXXXXXX  │
└──────────────────────┴───────────────────────┴────────────────┘
```

---

### Step 4: Deploy Indexes

Once connected, deploy the indexes:

```bash
firebase deploy --only firestore:indexes --project code-guardian-report
```

**Expected Output:**
```
=== Deploying to 'code-guardian-report'...

i  deploying firestore
i  firestore: reading indexes from firestore.indexes.json...
✔  firestore: deployed indexes successfully

✔ Deploy complete!
```

---

### Step 5: Verify Indexes

Check that indexes are building/deployed:

```bash
firebase firestore:indexes --project code-guardian-report
```

**Expected**: Should show 3 indexes for:
- `github_analyses`
- `github_repositories`
- `analysisResults`

---

## 🆘 TROUBLESHOOTING

### Issue 1: Project Not Found

**Error**: `Project code-guardian-report not found`

**Possible Causes:**
1. Project doesn't exist
2. You don't have access
3. Project ID is different

**Solutions:**
- Check Firebase Console for the exact project ID
- Verify project exists: https://console.firebase.google.com
- Check your account has access to the project

---

### Issue 2: Permission Denied

**Error**: `The caller does not have permission`

**Possible Causes:**
1. Not authenticated with correct Google account
2. Account doesn't have Editor/Owner role

**Solutions:**
```bash
# Re-authenticate with correct account
firebase logout
firebase login

# Add project again
firebase use --add
```

---

### Issue 3: Project Exists But Different ID

**Error**: Project list shows different ID

**Solution**: Update `.env.local` and `.firebaserc` with the actual project ID

---

## 🔄 ALTERNATIVE: Create New Project

If `code-guardian-report` doesn't exist, you might want to create it:

### Option A: Use Existing Project (neofi-5e481)

We already deployed indexes there. Just update `.env.local`:

```env
VITE_FIREBASE_PROJECT_ID="neofi-5e481"
```

### Option B: Create New Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it "Code Guardian Report"
4. Choose project ID: `code-guardian-report` (if available)
5. Follow the setup wizard
6. Then come back and deploy indexes

---

## 📞 NEXT STEPS AFTER SETUP

Once you have Firebase CLI access:

1. **Deploy Indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

2. **Wait for Build** (2-3 minutes)

3. **Verify in Console**:
   ```
   https://console.firebase.google.com/project/code-guardian-report/firestore/indexes
   ```

4. **Hard Refresh Browser**:
   ```
   Ctrl+Shift+R (or Cmd+Shift+R)
   ```

5. **Test Application**:
   - Sign in
   - Test GitHub features
   - Verify no errors

---

## ✅ SUCCESS INDICATORS

You'll know it's working when:

### Firebase CLI:
```bash
$ firebase projects:list
✔ Code Guardian Report | code-guardian-report | ✅
```

### Index Deployment:
```bash
$ firebase deploy --only firestore:indexes
✔ Deploy complete!
```

### Application:
- No console errors
- GitHub features work
- Analytics display data

---

## 🎯 CURRENT STATUS

- [x] `.firebaserc` updated to `code-guardian-report`
- [x] `firestore.indexes.json` has correct indexes
- [ ] Need Firebase CLI access to project
- [ ] Need to deploy indexes
- [ ] Need to verify in console

---

**Ready to proceed?**

Try running:
```bash
firebase use --add
```

And let me know what you see!
