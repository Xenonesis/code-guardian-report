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
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-[#1e1e2f] to-[#2a2a3d] rounded-xl shadow-2xl border border-gray-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Github className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            Connect GitHub Account
          </h2>

          {/* Description */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-300 text-center text-sm">
              We couldn't automatically detect a GitHub account for{" "}
              <span className="font-semibold text-white">{email}</span>
            </p>

            <div className="bg-[#252538] rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-300 mb-3">
                If you have a GitHub account, enter your username below to
                access your repositories:
              </p>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="github-username"
                    className="block text-xs font-medium text-gray-400 mb-1"
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
                    className="w-full px-3 py-2 bg-[#2c2c3e] text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={verifying}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-sm">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  onClick={handleVerify}
                  disabled={verifying || !username.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
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
            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
          >
            Skip for now
          </button>

          {/* Privacy note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            We'll only access your public repositories
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubUsernameInput;
