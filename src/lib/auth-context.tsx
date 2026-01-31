"use client";

// lib/auth-context.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  signOut,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  UserCredential,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  AuthError,
  AuthCredential,
} from "firebase/auth";
import { doc } from "firebase/firestore";
import { auth, githubProvider, db } from "./firebase";
import { safeGetDoc, safeSetDoc } from "./firestore-utils";
import {
  showAuthFallbackMessage,
  handleAuthError,
  cleanupRedirectUrl,
  showRedirectLoadingMessage,
  getEmailFromError,
} from "./auth-utils";

import { logger } from "@/utils/logger";

const removeUndefined = <T extends Record<string, any>>(obj: T): T => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => {
        if (
          value &&
          typeof value === "object" &&
          !(value instanceof Date) &&
          !Array.isArray(value)
        ) {
          return [key, removeUndefined(value as Record<string, any>)];
        }
        return [key, value];
      })
  ) as T;
};
type Provider =
  | "google.com"
  | "github.com"
  | "password"
  | "facebook.com"
  | "twitter.com";

interface AccountConflictState {
  isOpen: boolean;
  email: string;
  existingProvider: Provider;
  attemptedProvider: Provider;
  pendingCredential: AuthCredential | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGithub: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  isGitHubUser: boolean;
  accountConflict: AccountConflictState;
  setAccountConflict: React.Dispatch<
    React.SetStateAction<AccountConflictState>
  >;
  handleSignInWithExisting: () => Promise<void>;
  isLinkingAccounts: boolean;
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
    throw new Error("useAuth must be used within an AuthProvider");
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
  const [accountConflict, setAccountConflict] = useState<AccountConflictState>({
    isOpen: false,
    email: "",
    existingProvider: "password",
    attemptedProvider: "github.com",
    pendingCredential: null,
  });
  const [isLinkingAccounts, setIsLinkingAccounts] = useState(false);

  // Utility function to detect if user is from GitHub
  const isGitHubUser = (user: User): boolean => {
    // Check provider data
    if (user.providerData) {
      const hasGitHubProvider = user.providerData.some(
        (provider) => provider.providerId === "github.com"
      );
      if (hasGitHubProvider) return true;
    }

    // Check email patterns (GitHub uses noreply.github.com)
    if (user.email && user.email.includes("@users.noreply.github.com")) {
      return true;
    }

    return false;
  };

  // Extract GitHub user ID from Firebase user
  const extractGitHubUserId = (user: User): string | null => {
    const githubProvider = user.providerData?.find(
      (p) => p.providerId === "github.com"
    );
    if (!githubProvider) return null;
    // Firebase stores the GitHub user ID in the uid field of the provider
    return githubProvider.uid || null;
  };

  // Extract GitHub username from user - try noreply email first
  const extractGitHubUsername = (user: User): string | null => {
    const githubProvider = user.providerData?.find(
      (p) => p.providerId === "github.com"
    );
    if (!githubProvider) return null;

    // Try to get from email if it's a GitHub noreply email
    // Format: username@users.noreply.github.com or 123456789+username@users.noreply.github.com
    const email = githubProvider.email || user.email;
    if (email && email.includes("@users.noreply.github.com")) {
      const match = email.match(
        /^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/
      );
      if (match) return match[1];
    }

    // Return null - we'll fetch the username using the GitHub API with user ID
    return null;
  };

  // Extract GitHub metadata from user credential
  const extractGitHubMetadata = (user: User): any => {
    const githubProvider = user.providerData?.find(
      (p) => p.providerId === "github.com"
    );
    if (!githubProvider) return null;

    const username = extractGitHubUsername(user);
    const githubUserId = githubProvider.uid;
    const avatarUrl =
      githubProvider.photoURL ||
      user.photoURL ||
      (githubUserId
        ? `https://avatars.githubusercontent.com/u/${githubUserId}`
        : null);

    return {
      login: username || null,
      avatarUrl,
      htmlUrl: username ? `https://github.com/${username}` : null,
      publicRepos: 0,
      followers: 0,
      following: 0,
    };
  };

  // Fetch additional GitHub user data from API using username
  const fetchGitHubUserData = async (username: string) => {
    try {
      const { githubRepositoryService } =
        await import("@/services/githubRepositoryService");
      const userData =
        await githubRepositoryService.getGitHubUserInfo(username);
      return userData;
    } catch (error) {
      logger.error("Error fetching GitHub user data:", error);
      return null;
    }
  };

  // Fetch GitHub user data by user ID
  const fetchGitHubUserDataById = async (userId: string) => {
    try {
      const { githubRepositoryService } =
        await import("@/services/githubRepositoryService");
      const userData = await githubRepositoryService.getGitHubUserById(userId);
      return userData;
    } catch (error) {
      logger.error("Error fetching GitHub user data by ID:", error);
      return null;
    }
  };

  // Create user profile in Firestore with better error handling
  const createUserProfile = async (
    user: User,
    displayName?: string,
    isFromGitHub?: boolean
  ) => {
    const isGitHub = isFromGitHub || isGitHubUser(user);
    let githubMetadata = isGitHub ? extractGitHubMetadata(user) : undefined;
    const githubUsername = isGitHub ? extractGitHubUsername(user) : undefined;
    const githubUserId = isGitHub ? extractGitHubUserId(user) : undefined;

    // Create profile with real data from Firebase Auth
    const fallbackProfile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: displayName || user.displayName || "",
      createdAt: new Date(),
      lastLogin: new Date(),
      isGitHubUser: isGitHub,
      githubUsername: githubUsername || undefined,
      githubMetadata: githubMetadata || undefined,
      repositoriesAnalyzed: 0,
    };

    const sanitizedFallbackProfile = removeUndefined(fallbackProfile);

    // Set fallback profile first to avoid blocking UI
    setUserProfile(fallbackProfile);

    // If GitHub user, fetch additional data from GitHub API in background
    if (isGitHub && (githubUsername || githubUserId)) {
      // Use username if available, otherwise fetch by user ID
      const fetchPromise = githubUsername
        ? fetchGitHubUserData(githubUsername)
        : fetchGitHubUserDataById(githubUserId!);

      fetchPromise
        .then((userData) => {
          if (userData) {
            const enhancedMetadata = removeUndefined({
              login: userData.login,
              avatarUrl: userData.avatar_url,
              htmlUrl: userData.html_url,
              bio: userData.bio || undefined,
              company: userData.company || undefined,
              location: userData.location || undefined,
              publicRepos: userData.public_repos,
              followers: userData.followers,
              following: userData.following,
            });

            setUserProfile((prev) =>
              prev
                ? {
                    ...prev,
                    displayName: userData.name || prev.displayName,
                    githubUsername: userData.login,
                    githubMetadata: enhancedMetadata,
                  }
                : prev
            );
          }
        })
        .catch((err) => {
          logger.warn("Failed to fetch enhanced GitHub data:", err);
        });
    }

    // Try to sync with Firestore in background with timeout
    const syncWithFirestore = async () => {
      try {
        // Wait for auth to stabilize
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify user is still authenticated
        if (!user || !auth.currentUser) {
          return;
        }

        // Get auth token with longer timeout
        const tokenPromise = user.getIdToken(true);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Token timeout")), 10000)
        );

        const token = (await Promise.race([
          tokenPromise,
          timeoutPromise,
        ])) as string;
        if (!token) {
          return;
        }

        const userDoc = doc(db, "users", user.uid);
        const {
          data: existingProfile,
          exists,
          error,
        } = await safeGetDoc<UserProfile>(userDoc, undefined, {
          suppressErrorToast: true,
        });

        if (error) {
          // Store profile in localStorage as backup
          try {
            localStorage.setItem(
              `userProfile_${user.uid}`,
              JSON.stringify(sanitizedFallbackProfile)
            );
          } catch (e) {
            // Silent fallback
          }
          return; // Keep fallback profile
        }

        if (!exists) {
          const { success } = await safeSetDoc(
            userDoc,
            sanitizedFallbackProfile
          );
          if (success) {
            // Clear localStorage backup since Firestore is working
            try {
              localStorage.removeItem(`userProfile_${user.uid}`);
            } catch (e) {
              // Silent fallback
            }
          } else {
            try {
              localStorage.setItem(
                `userProfile_${user.uid}`,
                JSON.stringify(sanitizedFallbackProfile)
              );
            } catch (e) {
              // Silent fallback
            }
          }
        } else if (existingProfile) {
          // Update last login
          const updatedProfile = removeUndefined({
            ...existingProfile,
            lastLogin: new Date(),
          });

          const { success } = await safeSetDoc(userDoc, updatedProfile, {
            merge: true,
          });
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
              lastLogin: new Date(), // Update last login time
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

  // Handle account conflict error
  const handleAccountConflictError = async (
    error: AuthError,
    attemptedProvider: Provider
  ): Promise<boolean> => {
    if (error.code === "auth/account-exists-with-different-credential") {
      try {
        const email = getEmailFromError(error) || "";
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);

        let existingProvider: Provider = "password";
        if (signInMethods.includes("github.com")) {
          existingProvider = "github.com";
        } else if (signInMethods.includes("password")) {
          existingProvider = "password";
        }

        setAccountConflict({
          isOpen: true,
          email,
          existingProvider,
          attemptedProvider,
          pendingCredential: (error as any).credential || null,
        });

        return true; // Handled
      } catch (fetchError) {
        logger.error("Error fetching sign-in methods:", fetchError);
        handleAuthError(error, "Account conflict detection");
        return false;
      }
    }
    return false; // Not handled
  };

  // Handle signing in with existing provider from conflict modal
  const handleSignInWithExisting = async () => {
    const { existingProvider, email, pendingCredential } = accountConflict;

    setIsLinkingAccounts(true);

    try {
      let userCredential: UserCredential;

      switch (existingProvider) {
        case "github.com": {
          const provider = githubProvider;
          provider.setCustomParameters({ login: email });
          userCredential = await signInWithPopup(auth, provider);
          break;
        }
        case "password": {
          // For email/password, we can't auto-sign-in, close modal and let user sign in manually
          setAccountConflict((prev) => ({ ...prev, isOpen: false }));
          setIsLinkingAccounts(false);
          return;
        }
        default:
          throw new Error("Unsupported provider");
      }

      // Link the pending credential if available
      if (pendingCredential && userCredential.user) {
        try {
          await linkWithCredential(userCredential.user, pendingCredential);
          logger.debug("Successfully linked accounts");
        } catch (linkError) {
          logger.error("Error linking accounts:", linkError);
          // User is still signed in even if linking fails
        }
      }

      await createUserProfile(userCredential.user);
      setAccountConflict((prev) => ({ ...prev, isOpen: false }));
    } catch (error: any) {
      logger.error("Error signing in with existing provider:", error);
      handleAuthError(error, "Sign in with existing provider");
    } finally {
      setIsLinkingAccounts(false);
    }
  };

  // Sign in with GitHub (with redirect fallback for COOP issues)
  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await createUserProfile(result.user, undefined, true);
      return result;
    } catch (error: any) {
      // Check for account conflict first
      const handled = await handleAccountConflictError(error, "github.com");
      if (handled) {
        return new Promise(() => {}) as Promise<UserCredential>;
      }

      // Check if it's a COOP-related error or popup blocked
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user" ||
        error.message?.includes("Cross-Origin-Opener-Policy")
      ) {
        showAuthFallbackMessage("github");
        // Fall back to redirect-based authentication
        await signInWithRedirect(auth, githubProvider);
        // The redirect will handle the rest, so we return a promise that never resolves
        // The actual result will be handled by getRedirectResult in the useEffect
        return new Promise(() => {}) as Promise<UserCredential>;
      }
      handleAuthError(error, "GitHub sign-in");
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
        handleAuthError(error, "Redirect authentication");
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

      // Create initial profile with real data from Firebase Auth (no hardcoded values)
      const initialProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        createdAt: new Date(),
        lastLogin: new Date(),
      };
      setUserProfile(initialProfile);
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
    signInWithGithub,
    logout,
    isGitHubUser: userProfile?.isGitHubUser || false,
    accountConflict,
    setAccountConflict,
    handleSignInWithExisting,
    isLinkingAccounts,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
