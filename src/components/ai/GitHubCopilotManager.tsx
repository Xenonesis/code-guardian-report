// src/components/ai/ImprovedGitHubCopilotManager.tsx
// Enhanced GitHub Copilot Manager with better UI/UX and performance

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGitHubCopilot } from "@/hooks/useGitHubCopilot";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Zap,
  Brain,
  Eye,
  AlertCircle,
  Github,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type VerificationStatus = "idle" | "verifying" | "success" | "failed";

export function GitHubCopilotManager() {
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
      return <Skeleton className="h-5 w-5 rounded-full bg-blue-900/20" />;
    }
    if (authState.isAuthenticated) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
    return <XCircle className="h-5 w-5 text-slate-500" />;
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
      <div className="rounded-xl border border-slate-800 bg-[#0B1120] p-6 text-slate-200">
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
            <div className="relative rounded-full bg-slate-800 p-4 ring-1 ring-slate-700">
              <Github className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="font-display text-xl font-bold text-white">
              GitHub Copilot Integration
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Sign in with GitHub to unlock AI-powered code analysis,
              intelligent suggestions, and automated fixes using GitHub Copilot
              models.
            </p>
          </div>
          <Button
            onClick={handleSignIn}
            className="mt-4 border-none bg-[#2da44e] text-white shadow-lg shadow-green-900/20 transition-all duration-300 hover:scale-105 hover:bg-[#2c974b]"
          >
            <Github className="mr-2 h-4 w-4" />
            Connect GitHub Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication Status */}
      <div className="rounded-xl border border-blue-900/30 bg-[#0B1120] p-6 shadow-xl transition-all duration-300 hover:shadow-blue-900/10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 transition-all duration-300 ${
                authState.isAuthenticated
                  ? "bg-green-500/10 ring-1 ring-green-500/20"
                  : "bg-slate-800"
              }`}
            >
              {statusIcon}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-100">
                GITHUB COPILOT STATUS
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>{statusText}</span>
                {authState.isAuthenticated && (
                  <Badge
                    variant={
                      authState.hasCopilotAccess ? "default" : "secondary"
                    }
                    className={`h-5 px-2 py-0 text-[10px] ${
                      authState.hasCopilotAccess
                        ? "border-blue-500/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}
                  >
                    {authState.hasCopilotAccess ? "Active" : "Auth Only"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {authState.isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTesting || verificationStatus === "verifying"}
                  className="h-8 border-slate-700 bg-slate-800 text-slate-300 transition-all duration-300 hover:bg-slate-700 hover:text-white"
                >
                  {isTesting || verificationStatus === "verifying" ? (
                    <Skeleton className="h-3 w-3 rounded-full bg-slate-600" />
                  ) : (
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="h-8 text-slate-400 transition-all duration-300 hover:bg-red-900/10 hover:text-red-400"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {authState.isAuthenticated && verificationStatus === "success" && (
          <div className="flex items-start gap-3 rounded-lg border border-green-900/30 bg-green-900/10 p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 text-green-400" />
            <div>
              <h4 className="text-sm font-medium text-green-300">
                Subscription Active
              </h4>
              <p className="mt-1 text-xs text-green-400/70">
                GitHub Copilot subscription verified. You have full access to AI
                analysis features.
              </p>
            </div>
          </div>
        )}

        {authState.isAuthenticated &&
          verificationStatus === "verifying" &&
          !isLoading && (
            <div className="flex items-center gap-3 rounded-lg border border-blue-900/30 bg-blue-900/10 p-4">
              <Skeleton className="h-5 w-5 rounded-full bg-blue-500/20" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-blue-500/20" />
                <p className="text-xs text-blue-300">
                  Verifying Copilot subscription...
                </p>
              </div>
            </div>
          )}

        {error && verificationStatus === "failed" && (
          <div className="flex items-start gap-3 rounded-lg border border-red-900/30 bg-red-900/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <h4 className="text-sm font-medium text-red-300">
                Connection Failed
              </h4>
              <p className="mt-1 text-xs text-red-400/70">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Model Selection */}
      {authState.isAuthenticated &&
        modelSelection.availableModels.length > 0 && (
          <div className="rounded-xl border border-blue-900/30 bg-[#0B1120] p-6 shadow-xl transition-all duration-300 hover:shadow-blue-900/10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-100">
                    SELECT AI MODEL
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose the optimal model for your analysis needs
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Select
                value={modelSelection.selectedModelId ?? undefined}
                onValueChange={handleModelSelect}
              >
                <SelectTrigger className="h-12 w-full border-slate-700 bg-[#0F1629] text-slate-200">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] border-slate-700 bg-[#0F1629] text-slate-200">
                  {modelSelection.availableModels.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="cursor-pointer py-3 focus:bg-slate-800 focus:text-white"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {model.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {model.version}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedModel && (
                <div className="animate-in fade-in rounded-xl border border-purple-900/30 bg-[#161F36] p-5 shadow-lg shadow-purple-900/10 duration-500">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-full bg-purple-500/20 p-2 text-purple-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="text-base font-bold text-purple-100">
                            {selectedModel.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-300"
                          >
                            {selectedModel.version}
                          </Badge>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-400">
                          {selectedModel.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                            <Activity className="h-3 w-3" />
                            Max Tokens
                          </div>
                          <p className="font-mono text-sm text-slate-200">
                            {selectedModel.maxTokens.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                            <Brain className="h-3 w-3" />
                            Context Window
                          </div>
                          <p className="font-mono text-sm text-slate-200">
                            {(selectedModel.contextWindow / 1000).toFixed(0)}k
                            tokens
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {Array.isArray(selectedModel.capabilities) &&
                          selectedModel.capabilities.map((capability) => (
                            <div
                              key={capability}
                              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-[10px] font-medium text-slate-300"
                            >
                              {getCapabilityIcon(capability)}
                              <span className="capitalize">{capability}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Loading State */}
      {isLoading && !authState.isAuthenticated && (
        <div className="flex items-center justify-center rounded-xl border border-slate-800 bg-[#0B1120] p-12">
          <div className="flex animate-pulse flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800"></div>
            <div className="h-4 w-32 rounded bg-slate-800"></div>
            <span className="text-sm text-slate-500">
              Connecting to GitHub Copilot...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
