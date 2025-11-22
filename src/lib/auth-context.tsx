// lib/auth-context.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, githubProvider, db } from './firebase';
import { safeGetDoc, safeSetDoc, isConnectionError } from './firestore-utils';
import { showAuthFallbackMessage, handleAuthError, cleanupRedirectUrl, showRedirectLoadingMessage } from './auth-utils';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<UserCredential>;
  createUser: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithGithub: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  isGitHubUser: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLogin: Date;
  // GitHub-specific fields
  isGitHubUser?: boolean;
  githubUsername?: string;
  githubId?: string;
  githubMetadata?: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
    bio?: string;
    company?: string;
    location?: string;
    publicRepos: number;
    followers: number;
    following: number;
  };
  repositoriesAnalyzed?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Utility function to detect if user is from GitHub
  const isGitHubUser = (user: User): boolean => {
    // Check provider data
    if (user.providerData) {
      const hasGitHubProvider = user.providerData.some(
        provider => provider.providerId === 'github.com'
      );
      if (hasGitHubProvider) return true;
    }
    
    // Check email patterns (GitHub uses noreply.github.com)
    if (user.email && user.email.includes('@users.noreply.github.com')) {
      return true;
    }
    
    return false;
  };

  // Extract GitHub metadata from user credential
  const extractGitHubMetadata = (user: User): any => {
    const githubProvider = user.providerData?.find(p => p.providerId === 'github.com');
    if (!githubProvider) return null;

    // GitHub stores additional info in the user object
    // We'll extract what we can from the display name and photoURL
    return {
      login: githubProvider.displayName || user.displayName || 'unknown',
      avatarUrl: githubProvider.photoURL || user.photoURL || '',
      htmlUrl: `https://github.com/${githubProvider.displayName || user.displayName || ''}`,
      publicRepos: 0,
      followers: 0,
      following: 0
    };
  };

  // Create user profile in Firestore with better error handling
  const createUserProfile = async (user: User, displayName?: string, isFromGitHub?: boolean) => {
    const isGitHub = isFromGitHub || isGitHubUser(user);
    const githubMetadata = isGitHub ? extractGitHubMetadata(user) : undefined;
    
    // Create fallback profile immediately
    const fallbackProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: displayName || user.displayName || 'Anonymous User',
      createdAt: new Date(),
      lastLogin: new Date(),
      isGitHubUser: isGitHub,
      githubUsername: isGitHub ? (githubMetadata?.login || user.displayName) : undefined,
      githubMetadata: githubMetadata,
      repositoriesAnalyzed: 0
    };
    
    // Set fallback profile first to avoid blocking UI
    setUserProfile(fallbackProfile);
    
    // Try to sync with Firestore in background with timeout
    const syncWithFirestore = async () => {
      try {
        // Wait for auth to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify user is still authenticated
        if (!user || !auth.currentUser) {
          return;
        }
        
        // Get auth token with longer timeout
        const tokenPromise = user.getIdToken(true);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Token timeout')), 10000)
        );
        
        const token = await Promise.race([tokenPromise, timeoutPromise]) as string;
        if (!token) {
          return;
        }

        const userDoc = doc(db, 'users', user.uid);
        const { data: existingProfile, exists, error } = await safeGetDoc<UserProfile>(userDoc, undefined, { suppressErrorToast: true });
        
        if (error) {
          // Store profile in localStorage as backup
          try {
            localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(fallbackProfile));
          } catch (e) {
            // Silent fallback
          }
          return; // Keep fallback profile
        }
        
        if (!exists) {
          const { success } = await safeSetDoc(userDoc, fallbackProfile);
          if (success) {
            // Clear localStorage backup since Firestore is working
            try {
              localStorage.removeItem(`userProfile_${user.uid}`);
            } catch (e) {
              // Silent fallback
            }
          } else {
            try {
              localStorage.setItem(`userProfile_${user.uid}`, JSON.stringify(fallbackProfile));
            } catch (e) {
              // Silent fallback
            }
          }
        } else if (existingProfile) {
          // Update last login
          const updatedProfile = {
            ...existingProfile,
            lastLogin: new Date()
          };
          
          const { success } = await safeSetDoc(userDoc, updatedProfile, { merge: true });
          if (success) {
            setUserProfile(updatedProfile);
            // Clear localStorage backup since Firestore is working
            try {
              localStorage.removeItem(`userProfile_${user.uid}`);
            } catch (e) {
              // Silent fallback
            }
          } else {
            setUserProfile(existingProfile);
          }
        }
      } catch (error) {
        // Try to load from localStorage as fallback
        try {
          const storedProfile = localStorage.getItem(`userProfile_${user.uid}`);
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            setUserProfile({
              ...parsedProfile,
              lastLogin: new Date() // Update last login time
            });
          }
        } catch (e) {
          // Silent fallback
        }
        
        // Keep the fallback profile we already set if localStorage fails too
      }
    };
    
    // Run sync in background without blocking
    syncWithFirestore();
  };

  // Sign in with email and password
  const signInWithEmailAndPasswordHandler = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user);
      return result;
    } catch (error: any) {
      handleAuthError(error, 'Email/password sign-in');
      throw error;
    }
  };

  // Create user with email and password
  const createUser = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(result.user, displayName);
      return result;
    } catch (error: any) {
      handleAuthError(error, 'Account creation');
      throw error;
    }
  };

  // Sign in with Google (with redirect fallback for COOP issues)
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      return result;
    } catch (error: any) {
      // Check if it's a COOP-related error or popup blocked
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('Cross-Origin-Opener-Policy')) {
        showAuthFallbackMessage('google');
        // Fall back to redirect-based authentication
        await signInWithRedirect(auth, googleProvider);
        // The redirect will handle the rest, so we return a promise that never resolves
        // The actual result will be handled by getRedirectResult in the useEffect
        return new Promise(() => {}) as Promise<UserCredential>;
      }
      handleAuthError(error, 'Google sign-in');
      throw error;
    }
  };

  // Sign in with GitHub (with redirect fallback for COOP issues)
  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await createUserProfile(result.user, undefined, true);
      return result;
    } catch (error: any) {
      // Check if it's a COOP-related error or popup blocked
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('Cross-Origin-Opener-Policy')) {
        showAuthFallbackMessage('github');
        // Fall back to redirect-based authentication
        await signInWithRedirect(auth, githubProvider);
        // The redirect will handle the rest, so we return a promise that never resolves
        // The actual result will be handled by getRedirectResult in the useEffect
        return new Promise(() => {}) as Promise<UserCredential>;
      }
      handleAuthError(error, 'GitHub sign-in');
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    // Show loading message if we're in a redirect flow
    showRedirectLoadingMessage();

    // Check for redirect result first (for fallback authentication)
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await createUserProfile(result.user);
          // Clean up the URL after successful redirect
          cleanupRedirectUrl();
        }
      } catch (error) {
        handleAuthError(error, 'Redirect authentication');
      }
    };

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // If no user, clear profile and finish loading
      if (!firebaseUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
      // Create fallback profile immediately to avoid blocking UI
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous User',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      setUserProfile(fallbackProfile);
      setLoading(false);
      
      // Only sync with Firestore if we haven't already done so for this user
      // This prevents redundant calls when the auth state changes multiple times
      if (!userProfile || userProfile.uid !== firebaseUser.uid) {
        // Use the existing createUserProfile function which handles Firestore sync
        createUserProfile(firebaseUser);
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithEmailAndPassword: signInWithEmailAndPasswordHandler,
    createUser,
    signInWithGoogle,
    signInWithGithub,
    logout,
    isGitHubUser: userProfile?.isGitHubUser || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};