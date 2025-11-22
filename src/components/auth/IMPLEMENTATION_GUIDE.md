# Account Conflict Modal - Step-by-Step Implementation Guide

This guide walks you through implementing the Account Conflict Modal in your Firebase authentication flow.

## 📋 Prerequisites

- ✅ Firebase Auth configured in your project
- ✅ At least two auth providers enabled (e.g., Google + Email/Password)
- ✅ Basic understanding of React hooks and async/await

## 🎯 Implementation Steps

### Step 1: Import Required Dependencies

```tsx
// src/components/YourAuthComponent.tsx
import { useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  AuthError,
  AuthCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';
import { getEmailFromError } from '@/lib/auth-utils';
import { toast } from 'sonner';
```

### Step 2: Set Up State Management

```tsx
type Provider = 'google.com' | 'github.com' | 'password' | 'facebook.com' | 'twitter.com';

interface ConflictState {
  isOpen: boolean;
  email: string;
  existingProvider: Provider;
  attemptedProvider: Provider;
  pendingCredential: AuthCredential | null;
}

function YourAuthComponent() {
  const [conflictState, setConflictState] = useState<ConflictState>({
    isOpen: false,
    email: '',
    existingProvider: 'password',
    attemptedProvider: 'google.com',
    pendingCredential: null,
  });
  const [isLinking, setIsLinking] = useState(false);

  // ... rest of your component
}
```

### Step 3: Create Error Handler

```tsx
const handleAuthError = async (error: AuthError, attemptedProvider: Provider) => {
  if (error.code === 'auth/account-exists-with-different-credential') {
    try {
      // Extract email from error
      const email = getEmailFromError(error) || '';
      
      // Get existing sign-in methods for this email
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      // Determine the existing provider
      let existingProvider: Provider = 'password';
      if (signInMethods.includes('google.com')) {
        existingProvider = 'google.com';
      } else if (signInMethods.includes('github.com')) {
        existingProvider = 'github.com';
      } else if (signInMethods.includes('password')) {
        existingProvider = 'password';
      }
      
      // Save pending credential for later linking
      const pendingCredential = (error as any).credential || null;
      
      // Show the conflict modal
      setConflictState({
        isOpen: true,
        email,
        existingProvider,
        attemptedProvider,
        pendingCredential,
      });
    } catch (fetchError) {
      console.error('Error fetching sign-in methods:', fetchError);
      toast.error('Unable to determine existing sign-in method');
    }
  } else {
    // Handle other auth errors normally
    console.error('Auth error:', error);
    toast.error(error.message || 'Authentication failed');
  }
};
```

### Step 4: Implement Sign-In Methods

```tsx
const handleGoogleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    toast.success('Successfully signed in!');
    return result;
  } catch (error: any) {
    handleAuthError(error, 'google.com');
  }
};

const handleGitHubSignIn = async () => {
  try {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    toast.success('Successfully signed in!');
    return result;
  } catch (error: any) {
    handleAuthError(error, 'github.com');
  }
};
```

### Step 5: Handle "Sign In With Existing Provider"

```tsx
const handleSignInWithExisting = async () => {
  const { existingProvider, email, pendingCredential } = conflictState;
  
  setIsLinking(true);
  
  try {
    let userCredential;
    
    // Sign in with the existing provider
    switch (existingProvider) {
      case 'google.com': {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ login_hint: email });
        userCredential = await signInWithPopup(auth, provider);
        break;
      }
      
      case 'github.com': {
        const provider = new GithubAuthProvider();
        provider.setCustomParameters({ login: email });
        userCredential = await signInWithPopup(auth, provider);
        break;
      }
      
      case 'password': {
        // For email/password, redirect to password input
        toast.info('Please sign in with your email and password');
        setConflictState(prev => ({ ...prev, isOpen: false }));
        setIsLinking(false);
        // You might want to open a password modal here
        return;
      }
      
      default:
        throw new Error('Unsupported provider');
    }
    
    // Optional: Link the pending credential
    if (pendingCredential && userCredential.user) {
      try {
        await linkWithCredential(userCredential.user, pendingCredential);
        toast.success('Successfully linked accounts! You can now use both sign-in methods.');
      } catch (linkError: any) {
        // Linking failed, but user is still signed in
        console.error('Error linking accounts:', linkError);
        toast.info('Signed in successfully. Link providers from your profile.');
      }
    } else {
      toast.success('Successfully signed in!');
    }
    
    // Close the modal
    setConflictState(prev => ({ ...prev, isOpen: false }));
    
  } catch (error: any) {
    console.error('Error signing in with existing provider:', error);
    toast.error('Failed to sign in. Please try again.');
  } finally {
    setIsLinking(false);
  }
};
```

### Step 6: Handle "Try Different Method"

```tsx
const handleTryDifferentMethod = () => {
  setConflictState(prev => ({ ...prev, isOpen: false }));
  toast.info('Please choose a different sign-in method or contact support.');
  // Optionally, scroll to sign-in options or show a provider selection modal
};
```

### Step 7: Render the Component

```tsx
return (
  <div>
    {/* Your sign-in UI */}
    <div className="space-y-4">
      <button
        onClick={handleGoogleSignIn}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
      >
        Sign in with Google
      </button>
      
      <button
        onClick={handleGitHubSignIn}
        className="w-full bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900"
      >
        Sign in with GitHub
      </button>
    </div>
    
    {/* Account Conflict Modal */}
    <AccountConflictModal
      isOpen={conflictState.isOpen}
      onClose={() => setConflictState(prev => ({ ...prev, isOpen: false }))}
      email={conflictState.email}
      existingProvider={conflictState.existingProvider}
      attemptedProvider={conflictState.attemptedProvider}
      onSignInWithExisting={handleSignInWithExisting}
      onTryDifferentMethod={handleTryDifferentMethod}
      isLinking={isLinking}
    />
  </div>
);
```

## 🎓 Complete Example

Here's the full component code:

```tsx
// src/components/auth/YourAuthComponent.tsx
import { useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  AuthError,
  AuthCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AccountConflictModal } from '@/components/auth/AccountConflictModal';
import { getEmailFromError } from '@/lib/auth-utils';
import { toast } from 'sonner';

type Provider = 'google.com' | 'github.com' | 'password' | 'facebook.com' | 'twitter.com';

interface ConflictState {
  isOpen: boolean;
  email: string;
  existingProvider: Provider;
  attemptedProvider: Provider;
  pendingCredential: AuthCredential | null;
}

export function YourAuthComponent() {
  const [conflictState, setConflictState] = useState<ConflictState>({
    isOpen: false,
    email: '',
    existingProvider: 'password',
    attemptedProvider: 'google.com',
    pendingCredential: null,
  });
  const [isLinking, setIsLinking] = useState(false);

  const handleAuthError = async (error: AuthError, attemptedProvider: Provider) => {
    if (error.code === 'auth/account-exists-with-different-credential') {
      try {
        const email = getEmailFromError(error) || '';
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        
        let existingProvider: Provider = 'password';
        if (signInMethods.includes('google.com')) existingProvider = 'google.com';
        else if (signInMethods.includes('github.com')) existingProvider = 'github.com';
        else if (signInMethods.includes('password')) existingProvider = 'password';
        
        setConflictState({
          isOpen: true,
          email,
          existingProvider,
          attemptedProvider,
          pendingCredential: (error as any).credential || null,
        });
      } catch (fetchError) {
        toast.error('Unable to determine existing sign-in method');
      }
    } else {
      toast.error(error.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success('Successfully signed in!');
    } catch (error: any) {
      handleAuthError(error, 'google.com');
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      toast.success('Successfully signed in!');
    } catch (error: any) {
      handleAuthError(error, 'github.com');
    }
  };

  const handleSignInWithExisting = async () => {
    const { existingProvider, email, pendingCredential } = conflictState;
    setIsLinking(true);
    
    try {
      let userCredential;
      
      switch (existingProvider) {
        case 'google.com': {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ login_hint: email });
          userCredential = await signInWithPopup(auth, provider);
          break;
        }
        case 'github.com': {
          const provider = new GithubAuthProvider();
          provider.setCustomParameters({ login: email });
          userCredential = await signInWithPopup(auth, provider);
          break;
        }
        case 'password': {
          toast.info('Please sign in with your email and password');
          setConflictState(prev => ({ ...prev, isOpen: false }));
          setIsLinking(false);
          return;
        }
        default:
          throw new Error('Unsupported provider');
      }
      
      if (pendingCredential && userCredential.user) {
        try {
          await linkWithCredential(userCredential.user, pendingCredential);
          toast.success('Successfully linked accounts!');
        } catch (linkError) {
          toast.info('Signed in successfully.');
        }
      }
      
      setConflictState(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleTryDifferentMethod = () => {
    setConflictState(prev => ({ ...prev, isOpen: false }));
    toast.info('Please choose a different sign-in method.');
  };

  return (
    <div>
      <div className="space-y-4">
        <button onClick={handleGoogleSignIn}>Sign in with Google</button>
        <button onClick={handleGitHubSignIn}>Sign in with GitHub</button>
      </div>
      
      <AccountConflictModal
        isOpen={conflictState.isOpen}
        onClose={() => setConflictState(prev => ({ ...prev, isOpen: false }))}
        email={conflictState.email}
        existingProvider={conflictState.existingProvider}
        attemptedProvider={conflictState.attemptedProvider}
        onSignInWithExisting={handleSignInWithExisting}
        onTryDifferentMethod={handleTryDifferentMethod}
        isLinking={isLinking}
      />
    </div>
  );
}
```

## ✅ Testing Your Implementation

### Test Case 1: Google with Existing Email/Password
1. Create account with email/password
2. Try to sign in with Google using same email
3. Modal should show: Email/Password (existing) vs Google (attempted)

### Test Case 2: Email/Password with Existing Google
1. Sign in with Google
2. Sign out
3. Try to create account with email/password using same email
4. Modal should show: Google (existing) vs Email/Password (attempted)

### Test Case 3: Account Linking
1. Trigger the conflict modal
2. Click "Sign In with [Existing Provider]"
3. Complete sign-in
4. Verify accounts are linked in Firebase Console

## 🐛 Troubleshooting

### Modal doesn't show
- Check that error.code is exactly `'auth/account-exists-with-different-credential'`
- Verify Firebase Auth is properly initialized
- Check browser console for errors

### Wrong provider displayed
- Log the `signInMethods` array to debug
- Ensure provider strings match Firebase's format exactly
- Check if account was created with a different provider

### Account linking fails
- Verify both providers are enabled in Firebase Console
- Check that user completes the sign-in flow
- Review Firebase Auth error messages

## 📚 Next Steps

1. ✅ Test with all provider combinations
2. ✅ Add analytics tracking for modal opens
3. ✅ Customize styling to match your brand
4. ✅ Add support for more OAuth providers
5. ✅ Implement proper error logging

## 🔗 Resources

- [Complete Example](./AccountConflictModal.example.tsx)
- [Component Docs](./README.md)
- [Quick Reference](./QUICK_REFERENCE.md)
- [Firebase Account Linking](https://firebase.google.com/docs/auth/web/account-linking)

---

**Need help?** Try the interactive demo page or review the example integration file.
