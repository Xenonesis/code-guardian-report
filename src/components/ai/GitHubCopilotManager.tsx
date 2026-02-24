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
      <div className="bg-card border-border text-foreground rounded-xl border p-6">
        <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
            <div className="bg-muted ring-border relative rounded-full p-4 ring-1">
              <Github className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="font-display text-foreground text-xl font-bold">
              GitHub Copilot Integration
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
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
      <div className="bg-card border-border rounded-xl border p-6 shadow-xl transition-all duration-300 hover:shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2 transition-all duration-300 ${
                authState.isAuthenticated
                  ? "bg-green-500/10 ring-1 ring-green-500/20"
                  : "bg-muted"
              }`}
            >
              {statusIcon}
            </div>
            <div>
              <h3 className="font-display text-foreground text-lg font-bold">
                GITHUB COPILOT STATUS
              </h3>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>{statusText}</span>
                {authState.isAuthenticated && (
                  <Badge
                    variant={
                      authState.hasCopilotAccess ? "default" : "secondary"
                    }
                    className={`h-5 px-2 py-0 text-[10px] ${
                      authState.hasCopilotAccess
                        ? "border-blue-500/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        : "border-border bg-muted text-muted-foreground"
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
                  className="border-border bg-background text-muted-foreground hover:text-foreground h-8 transition-all duration-300"
                >
                  {isTesting || verificationStatus === "verifying" ? (
                    <Skeleton className="bg-muted-foreground/40 h-3 w-3 rounded-full" />
                  ) : (
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Test
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 transition-all duration-300"
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
          <div className="border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3 rounded-lg border p-4">
            <CheckCircle className="mt-0.5 h-5 w-5 text-green-400" />
            <div>
              <h4 className="text-sm font-medium text-emerald-600 dark:text-emerald-300">
                Subscription Active
              </h4>
              <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/70">
                GitHub Copilot subscription verified. You have full access to AI
                analysis features.
              </p>
            </div>
          </div>
        )}

        {authState.isAuthenticated &&
          verificationStatus === "verifying" &&
          !isLoading && (
            <div className="border-primary/30 bg-primary/10 flex items-center gap-3 rounded-lg border p-4">
              <Skeleton className="h-5 w-5 rounded-full bg-blue-500/20" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-blue-500/20" />
                <p className="text-primary text-xs">
                  Verifying Copilot subscription...
                </p>
              </div>
            </div>
          )}

        {error && verificationStatus === "failed" && (
          <div className="border-destructive/30 bg-destructive/10 flex items-start gap-3 rounded-lg border p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <h4 className="text-destructive text-sm font-medium">
                Connection Failed
              </h4>
              <p className="text-destructive/80 mt-1 text-xs">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Model Selection */}
      {authState.isAuthenticated &&
        modelSelection.availableModels.length > 0 && (
          <div className="bg-card border-border rounded-xl border p-6 shadow-xl transition-all duration-300 hover:shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-display text-foreground text-lg font-bold">
                    SELECT AI MODEL
                  </h3>
                  <p className="text-muted-foreground text-xs">
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
                <SelectTrigger className="border-border bg-background text-foreground h-12 w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover text-popover-foreground max-h-[300px]">
                  {modelSelection.availableModels.map((model) => (
                    <SelectItem
                      key={model.id}
                      value={model.id}
                      className="focus:bg-muted cursor-pointer py-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {model.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {model.version}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedModel && (
                <div className="bg-primary/5 border-primary/20 animate-in fade-in rounded-xl border p-5 shadow-lg duration-500">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 rounded-full bg-purple-500/20 p-2 text-purple-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="text-foreground text-base font-bold">
                            {selectedModel.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className="border-purple-500/30 bg-purple-500/10 text-[10px] text-purple-300"
                          >
                            {selectedModel.version}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {selectedModel.description}
                        </p>
                      </div>

                      <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-1">
                          <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
                            <Activity className="h-3 w-3" />
                            Max Tokens
                          </div>
                          <p className="text-foreground font-mono text-sm">
                            {selectedModel.maxTokens.toLocaleString()}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase">
                            <Brain className="h-3 w-3" />
                            Context Window
                          </div>
                          <p className="text-foreground font-mono text-sm">
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
                              className="bg-muted/70 border-border text-muted-foreground flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium"
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
        <div className="bg-card border-border flex items-center justify-center rounded-xl border p-12">
          <div className="flex animate-pulse flex-col items-center gap-3">
            <div className="bg-muted h-10 w-10 rounded-full"></div>
            <div className="bg-muted h-4 w-32 rounded"></div>
            <span className="text-muted-foreground text-sm">
              Connecting to GitHub Copilot...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
