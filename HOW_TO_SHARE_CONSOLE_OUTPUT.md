# 📋 How to Share Console Output

## 🎯 METHOD 1: Copy & Paste Here

### Steps:
1. Open http://localhost:5173
2. Press `F12` to open DevTools
3. Click "Console" tab
4. Right-click in console
5. Select "Save as..." or copy all text
6. Paste it here in the chat

---

## 🎯 METHOD 2: Screenshot

### Steps:
1. Open console (F12)
2. Take screenshot of any errors
3. Describe what you see

---

## 🎯 METHOD 3: Just Tell Me

### Answer these:
1. **Any red errors?** (Yes/No)
   - If yes, what does it say?

2. **Repos loading?** (Yes/No)
   - See a list of repositories?

3. **Can click Analyze?** (Yes/No)
   - Does it work or show error?

---

## ❓ WHAT I NEED TO SEE

**Most important errors to look for:**

### ❌ Firebase Errors:
```
[ERROR] Query requires an index
[ERROR] Permission denied
[ERROR] Firebase: ...
```

### ❌ Network Errors:
```
Failed to fetch
403 Forbidden
404 Not Found
```

### ❌ Code Errors:
```
Uncaught Error: ...
TypeError: ...
```

---

## ✅ WHAT TO IGNORE

- React setState warning (we know about it, it's cached)
- Vercel Speed Insights debug messages
- [DEBUG] messages (these are normal)

---

## 📊 EXAMPLE REPORT

**Good format:**
```
Console shows:
- [DEBUG] Fetched 100 repositories ✅
- [INFO] Firebase connected ✅
- Warning: setState during render ⚠️ (known issue)

Repos: Loading fine ✅
Analyze: Works ✅
```

**Or if issues:**
```
Console shows:
- [ERROR] Query requires an index ❌
- [ERROR] Permission denied ❌

Repos: Not loading ❌
Analyze: Haven't tried yet
```

---

**Just share what you see and I'll diagnose!**
