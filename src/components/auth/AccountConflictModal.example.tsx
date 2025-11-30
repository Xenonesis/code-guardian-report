// src/components/auth/AccountConflictModal.example.tsx
/**
 * Example integration of AccountConflictModal with Firebase Authentication
 * 
 * This file demonstrates how to handle the 'account-exists-with-different-credential'
 * error in a real application using Firebase Auth.
 */

import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  AuthError,
  AuthCredential,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AccountConflictModal } from './AccountConflictModal';
import { getProviderFromError, getEmailFromError } from '@/lib/auth-utils';
import { toast } from 'sonner';

import { logger } from '@/utils/logger';
type Provider = 'google.com' | 'github.com' | 'password' | 'facebook.com' | 'twitter.com';

interface ConflictState {
  isOpen: boolean;
  email: string;
  existingProvider: Provider;
  attemptedProvider: Provider;
  pendingCredential: AuthCredential | null;
}

export const AuthWithConflictHandling: React.FC = () => {
  const [conflictState, setConflictState] = useState<ConflictState>({
    isOpen: false,
    email: '',
    existingProvider: 'password',
    attemptedProvider: 'google.com',
    pendingCredential: null,
  });
  const [isLinking, setIsLinking] = useState(false);

  /**
   * Handle Google Sign-In with conflict detection
   */
  const handleGoogleSignIn = async (): Promise<UserCredential | undefined> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success('Successfully signed in with Google!');
      return result;
    } catch (error: any) {
      handleAuthError(error, 'google.com');
      return undefined;
    }
  };

  /**
   * Handle GitHub Sign-In with conflict detection
   */
  const handleGitHubSignIn = async (): Promise<UserCredential | undefined> => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success('Successfully signed in with GitHub!');
      return result;
    } catch (error: any) {
      handleAuthError(error, 'github.com');
      return undefined;
    }
  };

  /**
   * Handle authentication errors, specifically looking for account conflicts
   */
  const handleAuthError = async (error: AuthError, attemptedProvider: Provider) => {
    if (error.code === 'auth/account-exists-with-different-credential') {
      // Extract information from the error
      const email = getEmailFromError(error) || '';
      const pendingCredential = (error as any).credential || null;

      // Fetch the existing sign-in methods for this email
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        
        // Determine the existing provider
        let existingProvider: Provider = 'password';
        if (signInMethods.includes('google.com')) {
          existingProvider = 'google.com';
        } else if (signInMethods.includes('github.com')) {
          existingProvider = 'github.com';
        } else if (signInMethods.includes('facebook.com')) {
          existingProvider = 'facebook.com';
        } else if (signInMethods.includes('twitter.com')) {
          existingProvider = 'twitter.com';
        } else if (signInMethods.includes('password')) {
          existingProvider = 'password';
        }

        // Show the conflict modal
        setConflictState({
          isOpen: true,
          email,
          existingProvider,
          attemptedProvider,
          pendingCredential,
        });
      } catch (fetchError) {
        logger.error('Error fetching sign-in methods:', fetchError);
        toast.error('Unable to determine existing sign-in method. Please try again.');
      }
    } else {
      // Handle other errors normally
      logger.error('Auth error:', error);
      toast.error(error.message || 'An authentication error occurred');
    }
  };

  /**
   * Handle user choosing to sign in with their existing provider
   */
  const handleSignInWithExisting = async () => {
    const { existingProvider, email, pendingCredential } = conflictState;

    setIsLinking(true);

    try {
      // Sign in with the existing provider
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
          // For email/password, we need to prompt the user for their password
          // In a real app, you'd show a password input modal here
          toast.info('Please sign in with your email and password');
          setIsLinking(false);
          setConflictState(prev => ({ ...prev, isOpen: false }));
          return;
        }
        default:
          throw new Error('Unsupported provider');
      }

      // After successful sign-in, link the pending credential if available
      if (pendingCredential && userCredential.user) {
        try {
          await linkWithCredential(userCredential.user, pendingCredential);
          toast.success('Successfully linked accounts! You can now use both sign-in methods.');
        } catch (linkError: any) {
          // If linking fails, it's okay - the user is still signed in
          logger.error('Error linking accounts:', linkError);
          toast.info('Signed in successfully. You can link additional providers from your profile.');
        }
      } else {
        toast.success('Successfully signed in!');
      }

      // Close the modal
      setConflictState(prev => ({ ...prev, isOpen: false }));
    } catch (error: any) {
      logger.error('Error signing in with existing provider:', error);
      toast.error('Failed to sign in. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  /**
   * Handle user choosing to try a different sign-in method
   */
  const handleTryDifferentMethod = () => {
    setConflictState(prev => ({ ...prev, isOpen: false }));
    toast.info('Please choose a different sign-in method or contact support for help.');
  };

  return (
    <>
      {/* Your authentication UI */}
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
    </>
  );
};

/**
 * Alternative: Simpler integration without automatic account linking
 * Use this if you prefer to handle linking separately in user settings
 */
export const SimpleAuthWithConflictHandling: React.FC = () => {
  const [conflictState, setConflictState] = useState<ConflictState>({
    isOpen: false,
    email: '',
    existingProvider: 'password',
    attemptedProvider: 'google.com',
    pendingCredential: null,
  });

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = getEmailFromError(error) || '';
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        
        // Show conflict modal (without auto-linking)
        setConflictState({
          isOpen: true,
          email,
          existingProvider: signInMethods[0] as Provider,
          attemptedProvider: 'google.com',
          pendingCredential: null,
        });
      } else {
        toast.error('Authentication failed. Please try again.');
      }
    }
  };

  return (
    <>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      
      <AccountConflictModal
        isOpen={conflictState.isOpen}
        onClose={() => setConflictState(prev => ({ ...prev, isOpen: false }))}
        email={conflictState.email}
        existingProvider={conflictState.existingProvider}
        attemptedProvider={conflictState.attemptedProvider}
        onSignInWithExisting={() => {
          // Simply close and let user manually sign in
          setConflictState(prev => ({ ...prev, isOpen: false }));
        }}
        onTryDifferentMethod={() => {
          setConflictState(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </>
  );
};
