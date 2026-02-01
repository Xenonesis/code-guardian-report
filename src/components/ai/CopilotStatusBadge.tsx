// src/components/ai/CopilotStatusBadge.tsx
// Status badge showing GitHub Copilot connection status

"use client";

import { useGitHubCopilot } from "@/hooks/useGitHubCopilot";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CopilotStatusBadge() {
  const { authState, selectedModel, error } = useGitHubCopilot();

  if (!authState.isAuthenticated) {
    return null;
  }

  const hasError = !!error;
  const statusColor = hasError
    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
    : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`flex items-center space-x-1 ${statusColor}`}>
            {hasError ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span className="text-xs font-medium">
              {hasError
                ? "Copilot Error"
                : selectedModel
                  ? `Copilot: ${selectedModel.name}`
                  : "Copilot Active"}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            {hasError ? (
              <p className="text-red-600 dark:text-red-400">{error}</p>
            ) : (
              <>
                <p className="font-semibold">GitHub Copilot Active</p>
                {selectedModel && (
                  <>
                    <p>Model: {selectedModel.name}</p>
                    <p>
                      Context: {(selectedModel.contextWindow / 1000).toFixed(0)}
                      k tokens
                    </p>
                  </>
                )}
                {authState.userId && <p>User: {authState.userId}</p>}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
