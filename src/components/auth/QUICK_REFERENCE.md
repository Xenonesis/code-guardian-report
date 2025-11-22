# Account Conflict Modal - Quick Reference

## 🚀 One-Minute Integration

```tsx
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';

// In your auth error handler:
if (error.code === 'auth/account-exists-with-different-credential') {
  const email = error.customData?.email;
  const methods = await fetchSignInMethodsForEmail(auth, email);
  
  setShowConflictModal({
    isOpen: true,
    email,
    existingProvider: methods[0], // 'password', 'google.com', etc.
    attemptedProvider: error.credential?.providerId || 'google.com',
  });
}

// Render the modal:
<AccountConflictModal
  isOpen={conflictState.isOpen}
  onClose={() => setConflictState({ ...conflictState, isOpen: false })}
  email={conflictState.email}
  existingProvider={conflictState.existingProvider}
  attemptedProvider={conflictState.attemptedProvider}
  onSignInWithExisting={handleSignIn}
  onTryDifferentMethod={handleCancel}
  isLinking={isProcessing}
/>
```

## 📋 Props Cheatsheet

| Prop | Type | Example |
|------|------|---------|
| `isOpen` | `boolean` | `true` |
| `onClose` | `() => void` | `() => setOpen(false)` |
| `email` | `string` | `"user@example.com"` |
| `existingProvider` | `Provider` | `"password"` |
| `attemptedProvider` | `Provider` | `"google.com"` |
| `onSignInWithExisting` | `() => void` | `() => signIn()` |
| `onTryDifferentMethod` | `() => void` | `() => goBack()` |
| `isLinking?` | `boolean` | `false` |

## 🎨 Provider Types

```typescript
'google.com'    // Google OAuth
'github.com'    // GitHub OAuth
'password'      // Email/Password
'facebook.com'  // Facebook OAuth
'twitter.com'   // Twitter OAuth
```

## 🔥 Firebase Error Detection

```tsx
// Catch the error
try {
  await signInWithPopup(auth, new GoogleAuthProvider());
} catch (error: any) {
  if (error.code === 'auth/account-exists-with-different-credential') {
    showAccountConflictModal(error);
  }
}

// Extract info
const email = error.customData?.email || error.email;
const credential = error.credential;
const methods = await fetchSignInMethodsForEmail(auth, email);
```

## ⚡ Common Patterns

### Pattern 1: Simple Modal (No Auto-Linking)
```tsx
const handleSignInWithExisting = () => {
  setShowModal(false);
  // Let user manually sign in
};
```

### Pattern 2: Auto-Link Accounts
```tsx
const handleSignInWithExisting = async () => {
  setIsLinking(true);
  try {
    // Sign in with existing method
    const result = await signInWithPopup(auth, provider);
    
    // Link the new credential
    if (pendingCredential) {
      await linkWithCredential(result.user, pendingCredential);
    }
    
    toast.success('Accounts linked!');
  } finally {
    setIsLinking(false);
    setShowModal(false);
  }
};
```

### Pattern 3: Email/Password Special Case
```tsx
if (existingProvider === 'password') {
  // Show password input modal instead
  setShowPasswordModal(true);
}
```

## 🎯 State Management

```tsx
interface ConflictState {
  isOpen: boolean;
  email: string;
  existingProvider: Provider;
  attemptedProvider: Provider;
  pendingCredential: AuthCredential | null;
}

const [conflict, setConflict] = useState<ConflictState>({
  isOpen: false,
  email: '',
  existingProvider: 'password',
  attemptedProvider: 'google.com',
  pendingCredential: null,
});
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Modal won't open | Check `isOpen` prop |
| Wrong provider shown | Verify provider string matches exactly |
| Loading state stuck | Ensure `isLinking` resets to false |
| Email not displaying | Check error object has email field |

## 📱 Access Demo

Navigate to the demo page to test all scenarios:
```tsx
navigateTo('account-conflict-demo');
```

## 🔗 Related Files

- `src/components/auth/AccountConflictModal.tsx` - Component
- `src/components/auth/AccountConflictModal.example.tsx` - Full example
- `src/components/auth/README.md` - Detailed docs
- `src/lib/auth-utils.ts` - Helper functions
- `ACCOUNT_CONFLICT_MODAL.md` - Complete guide

## 💡 Pro Tips

1. **Cache provider methods**: Avoid multiple `fetchSignInMethodsForEmail` calls
2. **Show friendly names**: Use provider config to display "Google" not "google.com"
3. **Handle edge cases**: User might close browser during linking
4. **Provide escape hatch**: Always offer "Try Different Method"
5. **Log for debugging**: Track modal opens for analytics

## 🎓 Learning Path

1. ✅ Read this quick reference
2. ✅ Try the demo page
3. ✅ Review the example integration
4. ✅ Implement in your auth flow
5. ✅ Test all provider combinations

---

**Need more help?** Check `ACCOUNT_CONFLICT_MODAL.md` for the complete guide.
