import React, { useState } from "react";
import { GitFork, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isValidGitHubUsername,
  getGitHubUsernameError,
} from "@/utils/githubValidation";

interface GitHubUsernameInputProps {
  isOpen: boolean;
  email: string;
  onSuccess: (username: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

const GitHubUsernameInput: React.FC<GitHubUsernameInputProps> = ({
  isOpen,
  email,
  onSuccess,
  onSkip,
  onClose,
}) => {
  const [username, setUsername] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Please enter a username");
      return;
    }

    // Validate username format before making API call
    if (!isValidGitHubUsername(trimmedUsername)) {
      setError(getGitHubUsernameError(trimmedUsername));
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${trimmedUsername}`
      );

      if (response.ok) {
        const userData = await response.json();
        logger.debug("GitHub account verified:", userData.login);
        onSuccess(trimmedUsername);
      } else if (response.status === 404) {
        setError("GitHub user not found. Please check the username.");
      } else {
        setError("Unable to verify. Please try again.");
      }
    } catch (error) {
      logger.error("Error verifying GitHub username:", error);
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="border-border bg-background relative mx-4 w-full max-w-md rounded-xl border shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute top-4 right-4 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
              <GitFork className="text-primary h-8 w-8" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-foreground mb-4 text-center text-2xl font-bold">
            Connect GitHub Account
          </h2>

          {/* Description */}
          <div className="mb-6 space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              We couldn't automatically detect a GitHub account for{" "}
              <span className="text-foreground font-semibold">{email}</span>
            </p>

            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <p className="text-muted-foreground mb-3 text-sm">
                If you have a GitHub account, enter your username below to
                access your repositories:
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="github-username"
                    className="text-muted-foreground mb-1 block text-xs font-medium"
                  >
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    id="github-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., octocat"
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                    disabled={verifying}
                  />
                </div>

                {error && (
                  <div className="text-destructive flex items-start gap-2 text-sm">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={verifying || !username.trim()}
                  className="w-full"
                >
                  {verifying ? (
                    <>
                      <Skeleton className="mr-2 h-4 w-4 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Verify & Connect
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground w-full text-sm transition-colors"
          >
            Skip for now
          </button>

          {/* Privacy note */}
          <p className="text-muted-foreground mt-4 text-center text-xs">
            We'll only access your public repositories
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubUsernameInput;
