"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react";
import { neonAuth } from "@/lib/neon-auth";
import { logger } from "@/utils/logger";

interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  githubId?: string;
  // Legacy compatibility properties
  displayName?: string | null;
  photoURL?: string | null;
  githubUsername?: string | null;
  githubMetadata?: {
    avatarUrl?: string;
    username?: string;
    htmlUrl?: string;
    login?: string;
    publicRepos?: number;
  };
  providerData?: Array<{
    providerId: string;
    id?: string;
    uid?: string;
    photoURL?: string | null;
  }>;
  isGitHubUser?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  isGitHubUser: boolean;
  accountConflict: {
    isOpen: boolean;
    email: string;
    existingProvider: string;
    attemptedProvider: string;
  };
  setAccountConflict: React.Dispatch<
    React.SetStateAction<{
      isOpen: boolean;
      email: string;
      existingProvider: string;
      attemptedProvider: string;
    }>
  >;
  handleSignInWithExisting: () => Promise<void>;
  isLinkingAccounts: boolean;
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
  // v0.2: useSession is a React hook (Better Auth React adapter)
  const sessionData = neonAuth.useSession();

  const [accountConflict, setAccountConflict] = useState({
    isOpen: false,
    email: "",
    existingProvider: "password",
    attemptedProvider: "github.com",
  });
  const [isLinkingAccounts, setIsLinkingAccounts] = useState(false);
  const [resolvedGithubUsername, setResolvedGithubUsername] = useState<
    string | null
  >(() => {
    // Initialize from localStorage cache to avoid async delay on first render
    if (typeof window !== "undefined") {
      return localStorage.getItem("github_username");
    }
    return null;
  });

  // Resolve the real GitHub username (login) from the avatar URL numeric ID
  useEffect(() => {
    const avatarUrl = sessionData.data?.user?.image;
    if (!avatarUrl) return;

    // GitHub avatar URLs follow the pattern: https://avatars.githubusercontent.com/u/{numericId}?v=4
    const match = avatarUrl.match(
      /avatars\.githubusercontent\.com\/u\/([0-9]+)/
    );
    if (!match) return;

    const githubNumericId = match[1];
    const cacheKey = `github_login_id_${githubNumericId}`;

    // Check localStorage cache first (24h TTL)
    const cached =
      typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    if (cached) {
      const parsed = (() => {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      })();
      if (
        parsed?.login &&
        parsed?.cachedAt &&
        Date.now() - parsed.cachedAt < 24 * 60 * 60 * 1000
      ) {
        setResolvedGithubUsername(parsed.login);
        localStorage.setItem("github_username", parsed.login);
        localStorage.setItem("github_repo_permission", "granted");
        return;
      }
    }

    // Fetch the GitHub login by numeric user ID (no auth token needed, 60 req/hr limit)
    fetch(`https://api.github.com/user/${githubNumericId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`GitHub API ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data.login) {
          logger.debug(`Resolved GitHub login: ${data.login}`);
          setResolvedGithubUsername(data.login);
          localStorage.setItem("github_username", data.login);
          localStorage.setItem("github_repo_permission", "granted");
          localStorage.setItem(
            cacheKey,
            JSON.stringify({ login: data.login, cachedAt: Date.now() })
          );
        }
      })
      .catch((err) => {
        logger.debug("Could not resolve GitHub username from avatar URL:", err);
      });
  }, [sessionData.data?.user?.image]);

  const loading = sessionData.isPending;

  const userProfile: UserProfile | null = useMemo(() => {
    return sessionData.data?.user
      ? {
          id: sessionData.data.user.id || "",
          email: sessionData.data.user.email || null,
          name: sessionData.data.user.name || null,
          image: sessionData.data.user.image || null,
          githubId: sessionData.data.user.id,
          isGitHubUser: true,
          displayName: sessionData.data.user.name || null,
          photoURL: sessionData.data.user.image || null,
          githubUsername: resolvedGithubUsername,
          githubMetadata: {
            login: resolvedGithubUsername || undefined,
            avatarUrl: sessionData.data.user.image || undefined,
            htmlUrl: resolvedGithubUsername
              ? `https://github.com/${resolvedGithubUsername}`
              : undefined,
          },
        }
      : null;
  }, [sessionData.data?.user, resolvedGithubUsername]);

  const user = userProfile;
  const isAuthenticated = !!userProfile;
  const isGitHubUser = !!userProfile?.githubId;

  const signInWithGithub = async () => {
    try {
      await neonAuth.signIn.social({
        provider: "github",
        callbackURL: window.location.origin + "/",
      });
    } catch (error) {
      logger.error("Error signing in with GitHub:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await neonAuth.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      });
      try {
        localStorage.removeItem("github_oauth_token");
        localStorage.removeItem("github_copilot_auth");
      } catch {
        // Ignore localStorage errors
      }
    } catch (error) {
      logger.error("Error signing out:", error);
    }
  };

  const handleSignInWithExisting = async () => {
    setIsLinkingAccounts(true);
    try {
      await signInWithGithub();
      setAccountConflict((prev) => ({ ...prev, isOpen: false }));
    } finally {
      setIsLinkingAccounts(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated,
    signInWithGithub,
    logout,
    isGitHubUser,
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
