// components/github/GitHubRepositoryPermissionModal.tsx
import React from "react";
import { X, Github, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GitHubRepositoryPermissionModalProps {
  isOpen: boolean;
  email: string;
  onAllow: () => void;
  onDeny: () => void;
  onClose: () => void;
}

const GitHubRepositoryPermissionModal: React.FC<
  GitHubRepositoryPermissionModalProps
> = ({ isOpen, email, onAllow, onDeny, onClose }) => {
  if (!isOpen) return null;

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
            GitHub Repository Access
          </h2>

          {/* Description */}
          <div className="mb-6 space-y-4">
            <p className="text-center text-gray-300">
              We detected that your Google account email{" "}
              <span className="font-semibold text-white">{email}</span> may be
              associated with a GitHub account.
            </p>

            <div className="rounded-lg border border-gray-700 bg-[#252538] p-4">
              <h3 className="mb-3 flex items-center text-sm font-semibold text-white">
                <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                What we'll access:
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Your public repositories</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Repository metadata (name, description, stars)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-400">•</span>
                  <span>Basic profile information</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="flex items-start text-sm text-blue-300">
                <AlertCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                <span>
                  This will help you quickly analyze your GitHub repositories
                  for security vulnerabilities.
                </span>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onDeny}
              variant="outline"
              className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Not Now
            </Button>
            <Button
              onClick={onAllow}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:opacity-90"
            >
              Allow Access
            </Button>
          </div>

          {/* Privacy note */}
          <p className="mt-4 text-center text-xs text-gray-500">
            You can revoke this permission anytime in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubRepositoryPermissionModal;
