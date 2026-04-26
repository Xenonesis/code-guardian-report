"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
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
  const { data: session, status } = useSession();
  const [accountConflict, setAccountConflict] = React.useState({
    isOpen: false,
    email: "",
    existingProvider: "password",
    attemptedProvider: "github.com",
  });
  const [isLinkingAccounts, setIsLinkingAccounts] = React.useState(false);

  const loading = status === "loading";

  const userProfile: UserProfile | null = session?.user
    ? {
        id: (session.user as any).id || "",
        email: session.user.email || null,
        name: session.user.name || null,
        image: session.user.image || null,
        githubId: (session.user as any).githubId,
      }
    : null;

  const user = userProfile;
  const isGitHubUser = !!userProfile?.githubId;

  const signInWithGithub = async () => {
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch (error) {
      logger.error("Error signing in with GitHub:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
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
