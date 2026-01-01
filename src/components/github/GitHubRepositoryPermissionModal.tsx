// components/github/GitHubRepositoryPermissionModal.tsx
import React, { useState } from "react";
import { X, Github, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";

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
            GitHub Repository Access
          </h2>

          {/* Description */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-300 text-center">
              We detected that your Google account email{" "}
              <span className="font-semibold text-white">{email}</span> may be
              associated with a GitHub account.
            </p>

            <div className="bg-[#252538] rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                What we'll access:
              </h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Your public repositories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Repository metadata (name, description, stars)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2">•</span>
                  <span>Basic profile information</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
              <p className="text-sm text-blue-300 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
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
              className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Not Now
            </Button>
            <Button
              onClick={onAllow}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white"
            >
              Allow Access
            </Button>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            You can revoke this permission anytime in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubRepositoryPermissionModal;
