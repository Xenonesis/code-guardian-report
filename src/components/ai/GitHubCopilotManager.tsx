// src/components/ai/GitHubCopilotManager.tsx
// Component for managing GitHub Copilot authentication and model selection

"use client";

import React, { useState } from "react";
import { useGitHubCopilot } from "@/hooks/useGitHubCopilot";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Zap,
  Brain,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

export function GitHubCopilotManager() {
  const { isGitHubUser, signInWithGithub } = useAuth();
  const {
    authState,
    modelSelection,
    selectedModel,
    isLoading,
    selectModel,
    disconnect,
    testConnection,
  } = useGitHubCopilot();

  const [isTesting, setIsTesting] = useState(false);

  // Component doesn't need to auto-initialize (handled by hook)

  const handleSignIn = async () => {
    try {
      await signInWithGithub();
      toast.success("Signed in with GitHub successfully!");
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
      console.error("GitHub sign-in error:", error);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const result = await testConnection();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.info("Disconnected from GitHub Copilot");
  };

  const handleModelSelect = (modelId: string) => {
    selectModel(modelId);
    toast.success("Model selected successfully");
  };

  const getCapabilityIcon = (capability: string) => {
    switch (capability.toLowerCase()) {
      case "code":
        return <Sparkles className="h-3 w-3" />;
      case "text":
        return <Brain className="h-3 w-3" />;
      case "vision":
        return <Eye className="h-3 w-3" />;
      case "reasoning":
        return <Zap className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (!isGitHubUser) {
    return (
      <Card className="border-2 bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
            <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="mb-2 text-xl font-semibold">
              GitHub Copilot AI Integration
            </h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Sign in with GitHub to unlock AI-powered code analysis with GitHub
              Copilot models
            </p>
          </div>
          <Button
            onClick={handleSignIn}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Sign in with GitHub
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-2 ${
                authState.isAuthenticated
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {authState.isAuthenticated ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">GitHub Copilot Status</h3>
              <p className="text-muted-foreground text-sm">
                {authState.isAuthenticated
                  ? `Connected as ${authState.userId || "user"}`
                  : "Not connected"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {authState.isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Test</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Disconnect</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {!authState.hasCopilotAccess && authState.isAuthenticated && (
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              GitHub Copilot subscription not detected. You can still use the
              integration, but some features may be limited.
            </p>
          </Alert>
        )}

        {error && (
          <Alert className="mt-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </Alert>
        )}
      </Card>

      {/* Model Selection */}
      {authState.isAuthenticated &&
        modelSelection.availableModels.length > 0 && (
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">Select AI Model</h3>
              <p className="text-muted-foreground text-sm">
                Choose the GitHub Copilot model for your analysis tasks
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {modelSelection.availableModels.map((model) => {
                const isSelected = model.id === modelSelection.selectedModelId;
                return (
                  <div
                    key={model.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30"
                        : "border-gray-200 hover:border-blue-300 dark:border-gray-700 dark:hover:border-blue-700"
                    }`}
                    onClick={() => handleModelSelect(model.id)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}

                    <div className="mb-2">
                      <h4 className="text-base font-semibold">{model.name}</h4>
                      <p className="text-muted-foreground text-xs">
                        {model.version}
                      </p>
                    </div>

                    <p className="text-muted-foreground mb-3 text-sm">
                      {model.description}
                    </p>

                    <div className="mb-2 flex flex-wrap gap-2">
                      {model.capabilities.map((capability) => (
                        <Badge
                          key={capability}
                          variant="secondary"
                          className="flex items-center space-x-1 text-xs"
                        >
                          {getCapabilityIcon(capability)}
                          <span>{capability}</span>
                        </Badge>
                      ))}
                    </div>

                    <div className="text-muted-foreground mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-xs dark:border-gray-700">
                      <span>
                        Max tokens: {model.maxTokens.toLocaleString()}
                      </span>
                      <span>
                        Context: {(model.contextWindow / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedModel && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold">
                      Currently using: {selectedModel.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      This model will be used for all AI analysis tasks
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-muted-foreground ml-2 text-sm">
            Loading GitHub Copilot...
          </span>
        </div>
      )}
    </div>
  );
}
