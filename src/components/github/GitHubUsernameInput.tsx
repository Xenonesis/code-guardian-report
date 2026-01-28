import React, { useState } from "react";
import { Github, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

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
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/users/${username.trim()}`
      );

      if (response.ok) {
        const userData = await response.json();
        logger.debug("GitHub account verified:", userData.login);
        onSuccess(username.trim());
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-gray-700 bg-gradient-to-br from-[#1e1e2f] to-[#2a2a3d] shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 transition-colors hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
              <Github className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-center text-2xl font-bold text-white">
            Connect GitHub Account
          </h2>

          {/* Description */}
          <div className="mb-6 space-y-4">
            <p className="text-center text-sm text-gray-300">
              We couldn't automatically detect a GitHub account for{" "}
              <span className="font-semibold text-white">{email}</span>
            </p>

            <div className="rounded-lg border border-gray-700 bg-[#252538] p-4">
              <p className="mb-3 text-sm text-gray-300">
                If you have a GitHub account, enter your username below to
                access your repositories:
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="github-username"
                    className="mb-1 block text-xs font-medium text-gray-400"
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
                    className="w-full rounded-md border border-gray-600 bg-[#2c2c3e] px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    disabled={verifying}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-400">
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={verifying || !username.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
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
            className="w-full text-sm text-gray-400 transition-colors hover:text-white"
          >
            Skip for now
          </button>

          {/* Privacy note */}
          <p className="mt-4 text-center text-xs text-gray-500">
            We'll only access your public repositories
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubUsernameInput;
