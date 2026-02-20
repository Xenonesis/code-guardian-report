"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
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
  Terminal,
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

    const unsubscribe = firebaseAnalysisStorage.subscribe((data) => {
      setAnalysisHistory(data);
    });

    firebaseAnalysisStorage.setUserId(currentUser.uid);

    loadAnalysisHistory();

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

      if (!t || t === "") {
        return "N/A";
      }

      if (typeof (t as FireTimestamp).toDate === "function") {
        date = (t as FireTimestamp).toDate!();
      } else if (typeof (t as FireTimestamp).seconds === "number") {
        date = new Date((t as FireTimestamp).seconds! * 1000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof t === "string" || typeof t === "number") {
        const parsed = new Date(t);

        if (isNaN(parsed.getTime())) {
          return "N/A";
        }
        date = parsed;
      } else {
        return "N/A";
      }

      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (error) {
      logger.error("Error formatting date:", { error, timestamp });
      return "Invalid Date";
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="text-primary h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription className="text-slate-400">
              Please sign in to view your analysis history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onNavigateBack}
              className="border-primary/50 text-primary hover:bg-primary/10"
              variant="outline"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative min-h-screen overflow-hidden">
      {/* Industrial Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      </div>

      <div className="relative z-10 container mx-auto space-y-6 px-4 py-8 sm:space-y-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="group hover:border-primary/30 relative overflow-hidden rounded-lg border border-white/10 bg-black/40 p-6 backdrop-blur-sm transition-all duration-300">
            <div className="absolute top-0 right-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
              <Terminal className="text-primary h-16 w-16" />
            </div>
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="border-primary/30 bg-primary/10 text-primary rounded-full border p-3 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      ANALYSIS <span className="text-primary">HISTORY</span>
                    </h1>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      SYSTEM_LOGS // ARCHIVED_SCANS
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
                {onNavigateBack && (
                  <Button
                    variant="outline"
                    onClick={onNavigateBack}
                    className="border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    Back to Home
                  </Button>
                )}
                <Button
                  onClick={exportAnalysisHistory}
                  className="bg-primary hover:bg-primary/90 font-bold text-black shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export History
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats Grid */}
        {userStats && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "Total Analyses",
                value: userStats.totalAnalyses || 0,
                icon: Database,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                label: "Issues Found",
                value: userStats.totalIssuesFound || 0,
                icon: Bug,
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
              },
              {
                label: "Files Analyzed",
                value: userStats.totalFilesAnalyzed || 0,
                icon: FileText,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                label: "Avg Score",
                value: userStats.averageSecurityScore || "--",
                icon: Shield,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 ${stat.border} ${stat.bg}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`rounded-md bg-black/20 p-2 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-mono text-xs tracking-wider text-slate-400 uppercase">
                      {stat.label}
                    </p>
                    <p
                      className={`font-display text-2xl font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Bar */}
        <div className="rounded-lg border border-white/10 bg-black/40 p-4 shadow-sm backdrop-blur-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Filter className="text-primary h-5 w-5" />
              <span className="font-mono text-sm font-semibold tracking-wider text-white uppercase">
                System Filters
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
                className="h-8 font-mono text-xs text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="mr-2 h-3 w-3" />
                RESET_FILTERS
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
            <div className="relative lg:col-span-4">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:border-primary/50 focus:ring-primary/20 h-10 w-full border-white/10 bg-black/20 pl-9 text-slate-200 placeholder:text-slate-600"
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
                <SelectTrigger className="focus:border-primary/50 focus:ring-primary/20 h-10 border-white/10 bg-black/20 text-slate-200">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-black/90 text-slate-200">
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
                <SelectTrigger className="focus:border-primary/50 focus:ring-primary/20 h-10 border-white/10 bg-black/20 text-slate-200">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-black/90 text-slate-200">
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
                className="text-primary border-primary/20 hover:border-primary/50 h-10 w-full border bg-white/5 shadow-[0_0_10px_-4px_rgba(16,185,129,0.2)] hover:bg-white/10"
              >
                <Terminal className="mr-2 h-4 w-4" />
                REFRESH
              </Button>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm">
          {/* List Header */}
          <div className="border-b border-white/10 bg-black/20 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display flex items-center gap-3 text-lg font-bold tracking-wide text-white">
                  <div className="bg-primary h-2 w-2 animate-pulse rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                  ANALYSIS RESULTS
                  <span className="ml-2 rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-slate-400">
                    COUNT: {filteredHistory.length}
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* List Body */}
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/5 bg-black/20 p-6"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Title row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <Skeleton className="h-5 w-48 rounded" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        {/* Stats row */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          <Skeleton className="h-3 w-28 rounded" />
                          <Skeleton className="h-3 w-20 rounded" />
                          <Skeleton className="h-3 w-20 rounded" />
                          <Skeleton className="h-3 w-24 rounded" />
                        </div>
                        {/* Severity tags */}
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 lg:flex-col">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="py-16 text-center">
                <div className="relative inline-block">
                  <div className="bg-primary/20 absolute inset-0 rounded-full blur-xl" />
                  <div className="border-primary/30 relative rounded-full border bg-black/50 p-6">
                    <Terminal className="text-primary h-12 w-12" />
                  </div>
                </div>
                <h3 className="font-display mt-6 mb-2 text-xl font-bold tracking-wide text-white">
                  NO_DATA_FOUND
                </h3>
                <p className="mx-auto max-w-md font-mono text-sm text-slate-400">
                  {analysisHistory.length === 0
                    ? "INITIATE_FIRST_SCAN"
                    : "ADJUST_FILTER_PARAMETERS"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="group hover:border-primary/50 relative cursor-pointer rounded-lg border border-white/5 bg-black/20 p-6 transition-all duration-300 hover:bg-black/40 hover:shadow-[0_0_20px_-10px_rgba(16,185,129,0.2)]"
                    onClick={(e) => handleViewAnalysis(analysis, e)}
                  >
                    <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1 space-y-4">
                        {/* Title Row */}
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="group-hover:text-primary font-mono text-lg font-bold tracking-tight text-white transition-colors">
                            {analysis.fileName}
                          </h3>
                          <span
                            className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                              analysis.syncStatus === "synced"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {analysis.syncStatus}
                          </span>
                          {analysis.tags && analysis.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          {[
                            {
                              icon: Calendar,
                              value: formatDate(analysis.createdAt),
                            },
                            {
                              icon: FileText,
                              value: `${analysis.results.totalFiles} files`,
                            },
                            {
                              icon: Bug,
                              value: `${analysis.results.issues?.length || 0} issues`,
                            },
                            {
                              icon: Shield,
                              value: `Score: ${analysis.results.summary?.securityScore || "--"}`,
                            },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 font-mono text-xs text-slate-400"
                            >
                              <item.icon className="text-primary/50 h-3.5 w-3.5" />
                              <span>{item.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Severity Tags */}
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

                                  const severityStyles: Record<string, string> =
                                    {
                                      critical:
                                        "border-red-500/30 bg-red-500/10 text-red-400",
                                      high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
                                      medium:
                                        "border-amber-500/30 bg-amber-500/10 text-amber-400",
                                      low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                                    };

                                  return (
                                    <span
                                      key={severity}
                                      className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${severityStyles[severity]} font-mono`}
                                    >
                                      {severity}: {count}
                                    </span>
                                  );
                                }
                              )}
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 lg:flex-col lg:gap-2">
                        <Button
                          onClick={(e) => handleViewAnalysis(analysis, e)}
                          className="hover:bg-primary text-primary border-primary/30 w-full border bg-white/5 transition-all duration-300 hover:font-bold hover:text-black"
                          size="sm"
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          VIEW
                        </Button>
                        <Button
                          onClick={(e) => confirmDelete(analysis.id, e)}
                          variant="ghost"
                          className="w-full text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="border-red-500/30 bg-black/95 text-slate-200 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2 tracking-wide text-red-500">
                <AlertTriangle className="h-5 w-5" />
                CONFIRM_DELETION
              </DialogTitle>
              <DialogDescription className="font-mono text-xs text-slate-400">
                WARNING: This action is irreversible. The analysis data will be
                permanently purged from the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="ghost"
                onClick={() => setIsDeleteOpen(false)}
                className="text-slate-400 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={executeDelete}
                className="border border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/40"
              >
                PURGE_DATA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
