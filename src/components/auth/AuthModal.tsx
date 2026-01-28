// components/auth-modal.tsx
import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AccountConflictModal } from "./AccountConflictModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    signInWithEmailAndPassword,
    createUser,
    signInWithGoogle,
    signInWithGithub,
    accountConflict,
    setAccountConflict,
    handleSignInWithExisting,
    isLinkingAccounts,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(email, password);
      } else {
        await createUser(email, password, displayName);
      }
      onClose();
      resetForm();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      onClose();
      resetForm();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGithub();
      onClose();
      resetForm();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleTryDifferentMethod = () => {
    setAccountConflict((prev) => ({ ...prev, isOpen: false }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-gray-900 shadow-2xl dark:border-[#2A3B5F] dark:bg-gradient-to-b dark:from-[#121829] dark:to-[#1E293B] dark:text-white">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {isLogin ? "Sign In" : "Sign Up"}
            </h2>
            <button
              onClick={onClose}
              className="text-xl font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-[#9333ea] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                  autoComplete="name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-[#3b82f6] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-[#3b82f6] focus:outline-none dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-4 py-2 text-white hover:opacity-90 focus:ring-2 focus:ring-pink-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500 dark:bg-[#1E293B] dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-pink-600 px-4 py-2 text-white hover:opacity-90 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Loading..." : "Continue with Google"}
              </button>

              <button
                onClick={handleGithubSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white hover:opacity-90 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                {loading ? "Loading..." : "Continue with GitHub"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* Account Conflict Modal */}
      <AccountConflictModal
        isOpen={accountConflict.isOpen}
        onClose={() =>
          setAccountConflict((prev) => ({ ...prev, isOpen: false }))
        }
        email={accountConflict.email}
        existingProvider={accountConflict.existingProvider}
        attemptedProvider={accountConflict.attemptedProvider}
        onSignInWithExisting={handleSignInWithExisting}
        onTryDifferentMethod={handleTryDifferentMethod}
        isLinking={isLinkingAccounts}
      />
    </>
  );
};
