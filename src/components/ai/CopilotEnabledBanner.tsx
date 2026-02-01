// src/components/ai/CopilotEnabledBanner.tsx
// Banner to show when GitHub Copilot is enabled for the user

"use client";

import { useGitHubCopilot } from "@/hooks/useGitHubCopilot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle, Zap } from "lucide-react";

export function CopilotEnabledBanner() {
  const { authState, selectedModel } = useGitHubCopilot();

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Alert className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30">
      <div className="flex items-start space-x-3">
        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              GitHub Copilot AI Activated
            </h3>
            {authState.hasCopilotAccess && (
              <Badge className="bg-green-500 text-xs text-white">
                Subscription Active
              </Badge>
            )}
          </div>
          <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
            <div className="space-y-1">
              <p>
                Your AI analysis is now powered by{" "}
                <span className="font-semibold">
                  {selectedModel?.name || "GitHub Copilot"}
                </span>
              </p>
              <p className="flex items-center space-x-1 text-xs">
                <Zap className="h-3 w-3" />
                <span>
                  All AI features on this site will use your GitHub Copilot
                  subscription
                </span>
              </p>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
