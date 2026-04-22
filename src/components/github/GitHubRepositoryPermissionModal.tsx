// components/github/GitHubRepositoryPermissionModal.tsx
import React from "react";
import { X, GitFork, CheckCircle, AlertCircle } from "lucide-react";
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
            GitHub Repository Access
          </h2>

          {/* Description */}
          <div className="mb-6 space-y-4">
            <p className="text-muted-foreground text-center">
              We detected that your account email{" "}
              <span className="text-foreground font-semibold">{email}</span> may
              be associated with a GitHub account.
            </p>

            <div className="border-border bg-muted/50 rounded-lg border p-4">
              <h3 className="text-foreground mb-3 flex items-center text-sm font-semibold">
                <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                What we'll access:
              </h3>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Your public repositories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Repository metadata (name, description, stars)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Basic profile information</span>
                </li>
              </ul>
            </div>

            <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
              <p className="text-primary flex items-start text-sm">
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
            <Button onClick={onDeny} variant="outline" className="flex-1">
              Not Now
            </Button>
            <Button onClick={onAllow} className="flex-1">
              Allow Access
            </Button>
          </div>

          {/* Privacy note */}
          <p className="text-muted-foreground mt-4 text-center text-xs">
            You can revoke this permission anytime in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitHubRepositoryPermissionModal;
