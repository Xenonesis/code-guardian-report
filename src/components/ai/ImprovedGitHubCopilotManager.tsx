// src/components/ai/ImprovedGitHubCopilotManager.tsx
// Enhanced GitHub Copilot Manager with better UI/UX and performance

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type VerificationStatus = "idle" | "verifying" | "success" | "failed";

export function ImprovedGitHubCopilotManager() {
  const { isGitHubUser, signInWithGithub } = useAuth();
  const {
    authState,
    modelSelection,
    selectedModel,
    isLoading,
    error,
    selectModel,
    disconnect,
    testConnection,
  } = useGitHubCopilot();

  const [isTesting, setIsTesting] = useState(false);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("idle");

  // Update verification status based on auth state
  useEffect(() => {
    if (authState.isAuthenticated) {
      if (authState.hasCopilotAccess) {
        setVerificationStatus("success");
      } else if (isLoading) {
        setVerificationStatus("verifying");
      } else {
        setVerificationStatus("idle");
      }
    } else {
      setVerificationStatus("idle");
    }
  }, [authState.isAuthenticated, authState.hasCopilotAccess, isLoading]);

  // Memoize capability icon to avoid re-renders
  const getCapabilityIcon = useCallback((capability: string) => {
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
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      await signInWithGithub();
      toast.success("Signed in with GitHub successfully!");
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
      console.error("GitHub sign-in error:", error);
    }
  }, [signInWithGithub]);

  const handleTestConnection = useCallback(async () => {
    setIsTesting(true);
    try {
      const result = await testConnection();
      if (result.success) {
        toast.success(result.message);
        setVerificationStatus("success");
      } else {
        toast.error(result.message);
        setVerificationStatus("failed");
      }
    } catch {
      toast.error("Connection test failed");
      setVerificationStatus("failed");
    } finally {
      setIsTesting(false);
    }
  }, [testConnection]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setVerificationStatus("idle");
    toast.info("Disconnected from GitHub Copilot");
  }, [disconnect]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      selectModel(modelId);
      toast.success("Model selected successfully");
    },
    [selectModel]
  );

  // Memoize status icon to avoid re-renders
  const statusIcon = useMemo(() => {
    if (verificationStatus === "verifying") {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    }
    if (authState.isAuthenticated) {
      return (
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      );
    }
    return <XCircle className="h-5 w-5 text-gray-400" />;
  }, [verificationStatus, authState.isAuthenticated]);

  // Memoize status text
  const statusText = useMemo(() => {
    if (!authState.isAuthenticated) return "Not connected";
    if (verificationStatus === "verifying") return "Verifying subscription...";
    return `Connected as ${authState.userId || "user"}`;
  }, [authState.isAuthenticated, authState.userId, verificationStatus]);

  // Not signed in with GitHub
  if (!isGitHubUser) {
    return (
      <Card className="border-2 bg-gradient-to-br from-slate-50 to-slate-100 p-6 transition-all duration-300 hover:shadow-lg dark:from-slate-900 dark:to-slate-800">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="animate-pulse rounded-full bg-blue-100 p-4 dark:bg-blue-900/30">
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
            className="transform bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
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
      <Card className="p-6 transition-all duration-300 hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-2 transition-all duration-300 ${
                authState.isAuthenticated
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {statusIcon}
            </div>
            <div>
              <h3 className="text-lg font-semibold">GitHub Copilot Status</h3>
              <p className="text-muted-foreground text-sm">{statusText}</p>
              {authState.isAuthenticated && (
                <Badge
                  variant={authState.hasCopilotAccess ? "default" : "secondary"}
                  className="mt-1 transition-all duration-300"
                >
                  {authState.hasCopilotAccess
                    ? "Copilot Active"
                    : "GitHub Auth Only"}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {authState.isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTesting || verificationStatus === "verifying"}
                  className="transition-all duration-300 hover:scale-105"
                >
                  {isTesting || verificationStatus === "verifying" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Test</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Disconnect</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {authState.isAuthenticated && verificationStatus === "success" && (
          <Alert className="animate-in fade-in border-green-200 bg-green-50 duration-500 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="ml-2 text-sm text-green-800 dark:text-green-200">
              GitHub Copilot subscription verified. All features available.
            </p>
          </Alert>
        )}

        {authState.isAuthenticated &&
          verificationStatus === "verifying" &&
          !isLoading && (
            <Alert className="animate-in fade-in border-blue-200 bg-blue-50 duration-500 dark:border-blue-800 dark:bg-blue-900/20">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <p className="ml-2 text-sm text-blue-800 dark:text-blue-200">
                Verifying Copilot subscription...
              </p>
            </Alert>
          )}

        {error && verificationStatus === "failed" && (
          <Alert className="animate-in fade-in border-red-200 bg-red-50 duration-500 dark:border-red-800 dark:bg-red-900/20">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <p className="ml-2 text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </Alert>
        )}
      </Card>

      {/* Model Selection */}
      {authState.isAuthenticated &&
        modelSelection.availableModels.length > 0 && (
          <Card className="p-6 transition-all duration-300 hover:shadow-md">
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
                    className={`relative transform cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 hover:scale-102 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-950/30"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-blue-700"
                    }`}
                    onClick={() => handleModelSelect(model.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleModelSelect(model.id);
                      }
                    }}
                  >
                    {isSelected && (
                      <div className="animate-in zoom-in absolute top-2 right-2 duration-300">
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
                          className="flex items-center space-x-1 text-xs transition-all duration-200 hover:scale-105"
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
              <div className="animate-in slide-in-from-bottom mt-4 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 duration-500 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20">
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
      {isLoading && !authState.isAuthenticated && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-muted-foreground ml-2 text-sm">
            Loading GitHub Copilot...
          </span>
        </div>
      )}
    </div>
  );
}
