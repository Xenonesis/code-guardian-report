// src/components/ai/CopilotModelSelector.tsx
// Compact model selector component for quick access

"use client";

import { useGitHubCopilot } from "@/hooks/useGitHubCopilot";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, CheckCircle } from "lucide-react";

export function CopilotModelSelector() {
  const { authState, modelSelection, selectedModel, selectModel } =
    useGitHubCopilot();

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30 dark:hover:from-blue-950/50 dark:hover:to-purple-950/50"
        >
          <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium">
            {selectedModel?.name || "Select Model"}
          </span>
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">GitHub Copilot Models</h3>
            <Badge variant="secondary" className="text-xs">
              {modelSelection.availableModels.length} available
            </Badge>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {modelSelection.availableModels.map((model) => {
              const isSelected = model.id === modelSelection.selectedModelId;
              return (
                <button
                  key={model.id}
                  onClick={() => selectModel(model.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {model.name}
                        </span>
                        {isSelected && (
                          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {model.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-muted-foreground text-xs">
                          {(model.contextWindow / 1000).toFixed(0)}k context
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
