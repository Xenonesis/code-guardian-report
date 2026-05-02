"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/utils/logger";

interface AnalysisHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  results: {
    summary: {
      securityScore: number;
      qualityScore: number;
      criticalIssues: number;
      highIssues: number;
      mediumIssues: number;
      lowIssues: number;
    };
  };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load from localStorage using the same key as analysisStorage
      const storedHistory = localStorage.getItem("codeGuardianHistory");
      if (storedHistory) {
        const parsed = JSON.parse(storedHistory);
        // Combine current analysis and previous analyses
        const allAnalyses = [];

        if (parsed.currentAnalysis) {
          allAnalyses.push(parsed.currentAnalysis);
        }

        if (parsed.previousAnalyses && Array.isArray(parsed.previousAnalyses)) {
          allAnalyses.push(...parsed.previousAnalyses);
        }

        setHistory(allAnalyses);
      } else {
        setHistory([]);
      }
    } catch (err) {
      logger.error("Error loading analysis history:", err);
      setError("Failed to load analysis history");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (count: number, severity: string) => {
    if (count === 0) return null;

    const colors = {
      critical: "bg-red-500 text-white",
      high: "bg-orange-500 text-white",
      medium: "bg-yellow-500 text-black",
      low: "bg-blue-500 text-white",
    };

    return (
      <Badge className={colors[severity as keyof typeof colors]}>
        {count} {severity}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const handleViewAnalysis = (_analysisId: string) => {
    // Navigate to analysis results view
    // This would need to be implemented based on your routing structure
    window.location.href = `/`;
  };

  const handleDeleteAnalysis = (analysisId: string) => {
    try {
      const storedHistory = localStorage.getItem("codeGuardianHistory");
      if (!storedHistory) return;

      const parsed = JSON.parse(storedHistory);

      // Remove from previousAnalyses
      if (parsed.previousAnalyses && Array.isArray(parsed.previousAnalyses)) {
        parsed.previousAnalyses = parsed.previousAnalyses.filter(
          (item: { id?: string }) => item.id !== analysisId
        );
      }

      // Remove currentAnalysis if it matches
      if (parsed.currentAnalysis?.id === analysisId) {
        parsed.currentAnalysis = null;
      }

      localStorage.setItem("codeGuardianHistory", JSON.stringify(parsed));
      loadHistory(); // Reload to reflect changes
    } catch (err) {
      logger.error("Error deleting analysis:", err);
      setError("Failed to delete analysis");
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 w-64 rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">
            Analysis History
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your previous code analysis reports
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!error && history.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <h3 className="text-foreground mb-2 text-xl font-semibold">
                No Analysis History
              </h3>
              <p className="text-muted-foreground mb-4">
                You haven't analyzed any files yet. Start by uploading a file
                for analysis.
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Analyze Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div className="space-y-4">
            {history.map((analysis) => (
              <Card
                key={analysis.id}
                className="transition-all hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="text-primary h-5 w-5" />
                        {analysis.fileName}
                      </CardTitle>
                      <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(analysis.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {(analysis.fileSize / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAnalysis(analysis.id)}
                      >
                        View Results
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAnalysis(analysis.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {/* Security Score */}
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Shield className="text-primary h-4 w-4" />
                        <span className="text-sm font-medium">Security</span>
                      </div>
                      <p
                        className={`mt-1 text-2xl font-bold ${getScoreColor(analysis.results.summary.securityScore)}`}
                      >
                        {analysis.results.summary.securityScore}/100
                      </p>
                    </div>

                    {/* Quality Score */}
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-primary h-4 w-4" />
                        <span className="text-sm font-medium">Quality</span>
                      </div>
                      <p
                        className={`mt-1 text-2xl font-bold ${getScoreColor(analysis.results.summary.qualityScore)}`}
                      >
                        {analysis.results.summary.qualityScore}/100
                      </p>
                    </div>

                    {/* Issues Summary */}
                    <div className="bg-muted col-span-2 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="text-primary h-4 w-4" />
                        <span className="text-sm font-medium">
                          Issues Found
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getSeverityBadge(
                          analysis.results.summary.criticalIssues,
                          "critical"
                        )}
                        {getSeverityBadge(
                          analysis.results.summary.highIssues,
                          "high"
                        )}
                        {getSeverityBadge(
                          analysis.results.summary.mediumIssues,
                          "medium"
                        )}
                        {getSeverityBadge(
                          analysis.results.summary.lowIssues,
                          "low"
                        )}
                        {analysis.results.summary.criticalIssues +
                          analysis.results.summary.highIssues +
                          analysis.results.summary.mediumIssues +
                          analysis.results.summary.lowIssues ===
                          0 && (
                          <Badge className="bg-green-500 text-white">
                            No Issues
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
