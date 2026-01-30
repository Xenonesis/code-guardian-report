// src/pages/TestAuthConflict.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { AccountConflictModal } from "@/components/auth/AccountConflictModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";

import { logger } from "@/utils/logger";
export const TestAuthConflict: React.FC = () => {
  // Prevent access in production
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      logger.warn("Test pages are not available in production");
      window.location.href = "/";
    }
  }, []);
  const {
    user,
    signInWithGithub,
    logout,
    accountConflict,
    setAccountConflict,
    handleSignInWithExisting,
    isLinkingAccounts,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await signInWithGithub();
      setMessage({
        type: "success",
        text: "Successfully signed in with GitHub!",
      });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code !== "auth/account-exists-with-different-credential") {
        setMessage({
          type: "error",
          text: err.message || "Failed to sign in with GitHub",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMessage({ type: "info", text: "Logged out successfully" });
    } catch (error: unknown) {
      const err = error as { message?: string };
      setMessage({ type: "error", text: err.message || "Failed to logout" });
    }
  };

  const handleTryDifferentMethod = () => {
    setAccountConflict((prev) => ({ ...prev, isOpen: false }));
    setMessage({ type: "info", text: "Try a different sign-in method" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6 sm:px-6 sm:py-8 md:py-12 lg:px-8 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center sm:space-y-4">
          <h1 className="text-2xl font-bold break-words text-gray-900 sm:text-3xl md:text-4xl dark:text-gray-100">
            <span className="inline-flex items-center justify-center gap-2">
              <ShieldAlert className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              Account Conflict Modal - Real Functionality Test
            </span>
          </h1>
          <p className="px-2 text-base text-gray-600 sm:text-lg dark:text-gray-400">
            Test the actual Firebase authentication with conflict handling
          </p>
        </div>

        {/* User Status */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Current Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Signed In:</strong> {user.email || "No email"}
                  </AlertDescription>
                </Alert>
                <div className="space-y-2 rounded-lg bg-gray-50 p-3 sm:p-4 dark:bg-gray-800">
                  <p className="text-xs break-all sm:text-sm">
                    <strong>UID:</strong> {user.uid}
                  </p>
                  <p className="text-xs break-words sm:text-sm">
                    <strong>Display Name:</strong>{" "}
                    {user.displayName || "Not set"}
                  </p>
                  <p className="text-xs sm:text-sm">
                    <strong>Email Verified:</strong>{" "}
                    {user.emailVerified ? "Yes" : "No"}
                  </p>
                  <p className="text-xs break-words sm:text-sm">
                    <strong>Provider(s):</strong>{" "}
                    {user.providerData.map((p) => p.providerId).join(", ")}
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Not signed in. Try signing in with different providers to test
                  conflict handling.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Message Display */}
        {message && (
          <Alert
            className={
              message.type === "success"
                ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
                : message.type === "error"
                  ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                  : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20"
            }
          >
            <AlertDescription
              className={
                message.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : message.type === "error"
                    ? "text-red-800 dark:text-red-200"
                    : "text-blue-800 dark:text-blue-200"
              }
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Controls */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* OAuth Providers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                GitHub Sign-In
              </CardTitle>
              <CardDescription className="text-sm">
                Test GitHub authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <Button
                onClick={handleGitHubSignIn}
                disabled={loading}
                className="h-10 w-full bg-gray-800 text-sm text-white hover:bg-gray-900 sm:h-11 sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 flex-shrink-0 animate-spin" />
                    <span className="truncate">Processing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span className="truncate">Sign In with GitHub</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                GitHub Authentication Test
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4 dark:border-blue-900 dark:bg-blue-950/20">
              <h3 className="mb-2 text-sm font-semibold text-blue-900 sm:text-base dark:text-blue-100">
                Test GitHub Sign-In
              </h3>
              <ol className="list-inside list-decimal space-y-1.5 pl-2 text-xs text-blue-800 sm:space-y-2 sm:text-sm dark:text-blue-200">
                <li>Click &quot;Sign In with GitHub&quot;</li>
                <li>Authorize the application on GitHub</li>
                <li>Verify you are signed in successfully</li>
                <li>Test signing out and signing back in</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Conflict Status */}
        {accountConflict.isOpen && (
          <Card className="border-2 border-amber-500">
            <CardHeader>
              <CardTitle className="text-lg text-amber-600 sm:text-xl dark:text-amber-400">
                Account Conflict Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 overflow-x-auto rounded-lg bg-amber-50 p-3 sm:p-4 dark:bg-amber-950/20">
                <p className="text-xs break-words sm:text-sm">
                  <strong>Email:</strong> {accountConflict.email}
                </p>
                <p className="text-xs break-words sm:text-sm">
                  <strong>Existing Provider:</strong>{" "}
                  {accountConflict.existingProvider}
                </p>
                <p className="text-xs break-words sm:text-sm">
                  <strong>Attempted Provider:</strong>{" "}
                  {accountConflict.attemptedProvider}
                </p>
                <p className="text-xs sm:text-sm">
                  <strong>Modal Open:</strong> Yes
                </p>
              </div>
            </CardContent>
          </Card>
        )}
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
    </div>
  );
};
