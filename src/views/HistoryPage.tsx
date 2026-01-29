"use client";

/**
 * Analysis History Page
 * Shows user's personal analysis history from Firebase
 */

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AnimatedBackground } from "@/components/pages/about/AnimatedBackground";
import {
  History,
  Filter,
  Download,
  Trash2,
  Eye,
  Calendar,
  FileText,
  Bug,
  Shield,
  User,
  Database,
  Search,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  firebaseAnalysisStorage,
  type FirebaseAnalysisData,
} from "../services/storage/firebaseAnalysisStorage";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

import { logger } from "@/utils/logger";
interface HistoryPageProps {
  onAnalysisSelect?: (analysis: FirebaseAnalysisData) => void;
  onNavigateBack?: () => void;
}

export const HistoryPage = ({
  onAnalysisSelect,
  onNavigateBack,
}: HistoryPageProps) => {
  const { toast } = useToast();

  const [analysisHistory, setAnalysisHistory] = useState<
    FirebaseAnalysisData[]
  >([]);
  const [filteredHistory, setFilteredHistory] = useState<
    FirebaseAnalysisData[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "all" | "week" | "month" | "year"
  >("all");
  const [selectedSeverity, setSelectedSeverity] = useState<
    "all" | "critical" | "high" | "medium" | "low"
  >("all");
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  type UserStats = {
    totalAnalyses?: number;
    totalIssuesFound?: number;
    totalFilesAnalyzed?: number;
    averageSecurityScore?: number;
  };
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const { user: currentUser } = useAuth();

  const loadAnalysisHistory = useCallback(async () => {
    if (!currentUser?.uid) {
      logger.debug("No user authenticated for history loading");
      return;
    }

    logger.debug("Loading analysis history for user:", currentUser.uid);
    setIsLoading(true);

    try {
      firebaseAnalysisStorage.setUserId(currentUser.uid);
      logger.debug("Firebase service user ID set");

      const history = await firebaseAnalysisStorage.getUserAnalysisHistory(
        currentUser.uid
      );
      logger.debug(`Retrieved history: ${history.length} analyses`);
      logger.debug("History data:", history);

      // Deduplicate history entries based on fileName and fileHash
      const deduplicatedHistory = history.filter((analysis, index, array) => {
        const firstOccurrence = array.findIndex(
          (item) =>
            item.fileName === analysis.fileName &&
            item.fileHash === analysis.fileHash
        );
        return index === firstOccurrence;
      });

      logger.debug(
        `Deduplicated history: ${deduplicatedHistory.length} unique analyses`
      );

      setAnalysisHistory(deduplicatedHistory);

      toast({
        title: "History Loaded",
        description: `Found ${deduplicatedHistory.length} unique analysis results.`,
      });

      if (deduplicatedHistory.length === 0) {
        logger.debug("No analysis history found for this user");
        toast({
          title: "No History Yet",
          description: "Upload and analyze some code to see your history here.",
        });
      }
    } catch (err) {
      logger.error("Error loading analysis history:", err);

      toast({
        title: "Failed to Load History",
        description: `Could not load your analysis history: ${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Subscribe first so we don't miss the initial snapshot
    const unsubscribe = firebaseAnalysisStorage.subscribe((data) => {
      setAnalysisHistory(data);
    });

    // Then start realtime listener for this user
    firebaseAnalysisStorage.setUserId(currentUser.uid);
    // Also perform an immediate load as a fallback (in case the snapshot requires indexes)
    loadAnalysisHistory();

    // Load user stats separately
    loadUserStats();

    return () => {
      unsubscribe?.();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    filterHistory();
  }, [analysisHistory, searchTerm, selectedTimeRange, selectedSeverity]);

  const loadUserStats = async () => {
    if (!currentUser?.uid) return;

    try {
      const stats = await firebaseAnalysisStorage.getUserStats(currentUser.uid);
      setUserStats(stats);
    } catch (error) {
      logger.error("Error loading user stats:", error);
    }
  };

  const filterHistory = () => {
    let filtered = [...analysisHistory];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (analysis) =>
          analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          analysis.tags?.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          analysis.results.issues?.some(
            (issue) =>
              issue.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
              issue.message?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by time range
    if (selectedTimeRange !== "all") {
      const now = new Date();
      const timeRanges = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000,
      } as const;

      const cutoff = new Date(now.getTime() - timeRanges[selectedTimeRange]);
      filtered = filtered.filter((analysis) => {
        type FireTimestamp = { toDate?: () => Date; seconds?: number };
        const t = analysis.createdAt as
          | FireTimestamp
          | Date
          | string
          | number
          | null
          | undefined;
        let analysisDate: Date;
        if (t && typeof (t as FireTimestamp).toDate === "function") {
          analysisDate = (t as FireTimestamp).toDate!();
        } else if (t && typeof (t as FireTimestamp).seconds === "number") {
          analysisDate = new Date((t as FireTimestamp).seconds! * 1000);
        } else if (t instanceof Date) {
          analysisDate = t as Date;
        } else if (typeof t === "string" || typeof t === "number") {
          analysisDate = new Date(t);
        } else {
          analysisDate = new Date();
        }
        return analysisDate >= cutoff;
      });
    }

    // Filter by severity
    if (selectedSeverity !== "all") {
      filtered = filtered.filter((analysis) =>
        analysis.results.issues?.some(
          (issue) => issue.severity.toLowerCase() === selectedSeverity
        )
      );
    }

    setFilteredHistory(filtered);
  };

  const confirmDelete = (analysisId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnalysisToDelete(analysisId);
    setIsDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!analysisToDelete) return;

    try {
      await firebaseAnalysisStorage.deleteAnalysisResults(analysisToDelete);
      setAnalysisHistory((prev) =>
        prev.filter((a) => a.id !== analysisToDelete)
      );

      toast({
        title: "Analysis Deleted",
        description: "Analysis has been permanently deleted.",
      });

      // Reload stats after deletion
      loadUserStats();
    } catch (error) {
      logger.error("Error deleting analysis:", error);
      toast({
        title: "Delete Failed",
        description: "Could not delete analysis.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteOpen(false);
      setAnalysisToDelete(null);
    }
  };

  const handleViewAnalysis = (
    analysis: FirebaseAnalysisData,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();

    if (onAnalysisSelect) {
      onAnalysisSelect(analysis);
    }

    toast({
      title: "Analysis Loaded",
      description: `Viewing results for ${analysis.fileName}`,
    });
  };

  const exportAnalysisHistory = () => {
    try {
      const exportData = {
        user: {
          id: currentUser?.uid,
          email: currentUser?.email,
          exportDate: new Date().toISOString(),
        },
        stats: userStats,
        analyses: filteredHistory.map((analysis) => ({
          ...analysis,
          createdAt: analysis.createdAt?.toDate
            ? analysis.createdAt.toDate().toISOString()
            : analysis.createdAt,
          updatedAt: analysis.updatedAt?.toDate
            ? analysis.updatedAt.toDate().toISOString()
            : analysis.updatedAt,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analysis-history-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "Your analysis history has been exported.",
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export analysis history.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: unknown) => {
    try {
      let date: Date;

      type FireTimestamp = { toDate?: () => Date; seconds?: number };
      const t = timestamp as
        | FireTimestamp
        | Date
        | string
        | number
        | null
        | undefined;
      // Handle null, undefined, or empty values silently
      if (!t || t === "") {
        return "N/A";
      }

      if (typeof (t as FireTimestamp).toDate === "function") {
        // Firebase Timestamp
        date = (t as FireTimestamp).toDate!();
      } else if (typeof (t as FireTimestamp).seconds === "number") {
        // Firebase Timestamp object with seconds
        date = new Date((t as FireTimestamp).seconds! * 1000);
      } else if (timestamp instanceof Date) {
        // Already a Date object
        date = timestamp;
      } else if (typeof t === "string" || typeof t === "number") {
        // String or number timestamp
        const parsed = new Date(t);
        // Check if the date is valid
        if (isNaN(parsed.getTime())) {
          return "N/A";
        }
        date = parsed;
      } else {
        // Unknown format - return N/A instead of logging warning
        return "N/A";
      }

      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (error) {
      logger.error("Error formatting date:", { error, timestamp });
      return "Invalid Date";
    }
  };

  const _getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please sign in to view your analysis history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onNavigateBack}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AnimatedBackground />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute top-20 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-[128px]" />
      <div className="pointer-events-none absolute right-20 bottom-40 h-96 w-96 rounded-full bg-cyan-500/15 blur-[128px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-500/10 blur-[200px]" />

      <div className="relative z-10 container mx-auto space-y-8 py-12">
        {/* Premium Header */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 blur-xl" />
          <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-3 shadow-lg shadow-violet-500/30">
                    <History className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                      Analysis History
                    </h1>
                    <p className="mt-1 text-lg text-slate-400">
                      Your personal security analysis results & statistics
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {onNavigateBack && (
                  <Button
                    variant="outline"
                    onClick={onNavigateBack}
                    className="rounded-xl border-white/10 bg-white/5 px-5 text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                  >
                    Back to Home
                  </Button>
                )}
                <Button
                  onClick={exportAnalysisHistory}
                  className="rounded-xl border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export History
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Row */}
        {userStats && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "Total Analyses",
                value: userStats.totalAnalyses || 0,
                icon: Database,
                gradient: "from-blue-500 to-cyan-500",
                glow: "blue",
              },
              {
                label: "Issues Found",
                value: userStats.totalIssuesFound || 0,
                icon: Bug,
                gradient: "from-amber-500 to-orange-500",
                glow: "amber",
              },
              {
                label: "Files Analyzed",
                value: userStats.totalFilesAnalyzed || 0,
                icon: FileText,
                gradient: "from-emerald-500 to-teal-500",
                glow: "emerald",
              },
              {
                label: "Avg Score",
                value: userStats.averageSecurityScore || "--",
                icon: Shield,
                gradient: "from-violet-500 to-purple-500",
                glow: "violet",
              },
            ].map((stat, index) => (
              <div key={index} className="group relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}
                />
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]">
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={`rounded-xl bg-gradient-to-br p-2 ${stat.gradient} shadow-lg`}
                    >
                      <stat.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-400">
                      {stat.label}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium Filters Section */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-lg" />
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-cyan-400" />
                <span className="font-semibold text-white">
                  Filters & Search
                </span>
              </div>
              {(searchTerm ||
                selectedTimeRange !== "all" ||
                selectedSeverity !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTimeRange("all");
                    setSelectedSeverity("all");
                  }}
                  className="h-8 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="mr-2 h-3 w-3" />
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
              <div className="relative lg:col-span-4">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search by filename, tags, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-xl border-white/10 bg-white/5 pl-9 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                />
              </div>

              <div className="lg:col-span-3">
                <Select
                  value={selectedTimeRange}
                  onValueChange={(value) =>
                    setSelectedTimeRange(
                      value as "all" | "week" | "month" | "year"
                    )
                  }
                >
                  <SelectTrigger className="h-10 border-white/10 bg-white/5 text-white focus:ring-cyan-500/20">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900 text-white">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-3">
                <Select
                  value={selectedSeverity}
                  onValueChange={(value) =>
                    setSelectedSeverity(
                      value as "all" | "critical" | "high" | "medium" | "low"
                    )
                  }
                >
                  <SelectTrigger className="h-10 border-white/10 bg-white/5 text-white focus:ring-cyan-500/20">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-900 text-white">
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-2">
                <Button
                  onClick={loadAnalysisHistory}
                  className="h-10 w-full rounded-xl border-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/40"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis History Section */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-fuchsia-500/5 via-transparent to-violet-500/5" />
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
            {/* Section Header */}
            <div className="border-b border-white/5 bg-white/[0.02] px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                    <span className="h-8 w-2 rounded-full bg-gradient-to-b from-fuchsia-500 to-violet-500" />
                    Your Analysis Results
                    <span className="ml-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-violet-300">
                      {filteredHistory.length}
                    </span>
                  </h2>
                  {filteredHistory.length !== analysisHistory.length && (
                    <p className="mt-1 text-sm text-slate-500">
                      Showing {filteredHistory.length} of{" "}
                      {analysisHistory.length} analyses
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-violet-500" />
                    <div
                      className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-r-fuchsia-500"
                      style={{
                        animationDirection: "reverse",
                        animationDuration: "1.5s",
                      }}
                    />
                  </div>
                  <span className="mt-4 text-slate-400">
                    Loading your analysis history...
                  </span>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-2xl" />
                    <div className="relative rounded-full border border-white/10 bg-white/5 p-6">
                      <History className="h-16 w-16 text-slate-600" />
                    </div>
                  </div>
                  <h3 className="mt-6 mb-2 text-xl font-semibold text-white">
                    {analysisHistory.length === 0
                      ? "No Analysis History Yet"
                      : "No Results Found"}
                  </h3>
                  <p className="mx-auto max-w-md text-slate-500">
                    {analysisHistory.length === 0
                      ? "Start analyzing your code to see results here. Your analysis history will appear once you upload and scan some code."
                      : "Try adjusting your search filters to find what you're looking for."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredHistory.map((analysis, index) => (
                    <div
                      key={analysis.id}
                      className="group relative cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={(e) => handleViewAnalysis(analysis, e)}
                    >
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/0 via-fuchsia-500/0 to-cyan-500/0 opacity-0 blur-xl transition-all duration-500 group-hover:from-violet-500/10 group-hover:via-fuchsia-500/5 group-hover:to-cyan-500/10 group-hover:opacity-100" />

                      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 group-hover:translate-x-1 group-hover:shadow-2xl group-hover:shadow-violet-500/10 group-active:scale-[0.99] hover:border-white/20 hover:bg-white/[0.05]">
                        {/* Severity indicator bar */}
                        <div
                          className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl ${
                            analysis.results.issues?.some(
                              (i) => i.severity.toLowerCase() === "critical"
                            )
                              ? "bg-gradient-to-b from-red-500 to-rose-600"
                              : analysis.results.issues?.some(
                                    (i) => i.severity.toLowerCase() === "high"
                                  )
                                ? "bg-gradient-to-b from-orange-500 to-amber-600"
                                : analysis.results.issues?.some(
                                      (i) =>
                                        i.severity.toLowerCase() === "medium"
                                    )
                                  ? "bg-gradient-to-b from-yellow-500 to-amber-500"
                                  : "bg-gradient-to-b from-emerald-500 to-teal-600"
                          }`}
                        />

                        <div className="flex flex-col gap-5 pl-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1 space-y-4">
                            {/* File name and badges */}
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-bold text-white transition-colors duration-300 group-hover:text-violet-200">
                                {analysis.fileName}
                              </h3>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  analysis.syncStatus === "synced"
                                    ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                                    : "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {analysis.syncStatus}
                              </span>
                              {analysis.tags && analysis.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {analysis.tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                              {[
                                {
                                  icon: Calendar,
                                  value: formatDate(analysis.createdAt),
                                  label: "",
                                },
                                {
                                  icon: FileText,
                                  value: `${analysis.results.totalFiles} files`,
                                  label: "",
                                },
                                {
                                  icon: Bug,
                                  value: `${analysis.results.issues?.length || 0} issues`,
                                  label: "",
                                },
                                {
                                  icon: Shield,
                                  value: `Score: ${analysis.results.summary?.securityScore || "--"}`,
                                  label: "",
                                },
                              ].map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-sm text-slate-400 transition-colors duration-300 group-hover:text-slate-300"
                                >
                                  <item.icon className="h-4 w-4 text-slate-500" />
                                  <span>{item.value}</span>
                                </div>
                              ))}
                            </div>

                            {/* Severity badges */}
                            {analysis.results.issues &&
                              analysis.results.issues.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {["critical", "high", "medium", "low"].map(
                                    (severity) => {
                                      const count =
                                        analysis.results.issues?.filter(
                                          (issue) =>
                                            issue.severity.toLowerCase() ===
                                            severity
                                        ).length || 0;

                                      if (count === 0) return null;

                                      const severityStyles: Record<
                                        string,
                                        string
                                      > = {
                                        critical:
                                          "bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20",
                                        high: "bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-orange-500/20",
                                        medium:
                                          "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20",
                                        low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20",
                                      };

                                      return (
                                        <span
                                          key={severity}
                                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase shadow-lg ${severityStyles[severity]}`}
                                        >
                                          {severity}: {count}
                                        </span>
                                      );
                                    }
                                  )}
                                </div>
                              )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 lg:flex-col lg:gap-2">
                            <Button
                              onClick={(e) => handleViewAnalysis(analysis, e)}
                              className="flex-1 rounded-xl border-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-105 hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40 lg:flex-none"
                              size="sm"
                            >
                              <Eye className="mr-1.5 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              onClick={(e) => confirmDelete(analysis.id, e)}
                              className="rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:scale-105 hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-400"
                              variant="outline"
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to delete this analysis? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteOpen(false)}
                className="hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={executeDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Analysis
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
