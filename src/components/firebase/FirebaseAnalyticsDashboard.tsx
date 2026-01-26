/**
 * Firebase Analytics Dashboard
 * Displays cloud-stored analysis results and history
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import {
  firebaseAnalysisStorage,
  FirebaseAnalysisData,
} from "../../services/storage/firebaseAnalysisStorage";
import { useToast } from "@/hooks/use-toast";

import { logger } from "@/utils/logger";
interface FirebaseAnalyticsDashboardProps {
  userId?: string;
  onAnalysisSelect?: (analysis: FirebaseAnalysisData) => void;
}

export const FirebaseAnalyticsDashboard = ({
  userId,
  onAnalysisSelect,
}: FirebaseAnalyticsDashboardProps) => {
  const { toast } = useToast();

  const [analysisHistory, setAnalysisHistory] = useState<
    FirebaseAnalysisData[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<FirebaseAnalysisData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (userId && isOnline) {
      loadAnalysisHistory();
      setupRealtimeListener();
    }
  }, [userId, isOnline]);

  const loadAnalysisHistory = async () => {
    if (!userId || !isOnline) return;

    setIsLoading(true);
    try {
      const history =
        await firebaseAnalysisStorage.getUserAnalysisHistory(userId);
      setAnalysisHistory(history);
    } catch (error) {
      logger.error("Error loading analysis history:", error);
      toast({
        title: "❌ Failed to Load History",
        description: "Could not load analysis history from cloud storage.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeListener = () => {
    if (!userId || !isOnline) return;

    const unsubscribe = firebaseAnalysisStorage.subscribe((data) => {
      setAnalysisHistory(data);
    });

    firebaseAnalysisStorage.setupRealtimeListener();
    return unsubscribe;
  };

  const handleRefresh = () => {
    loadAnalysisHistory();
    toast({
      title: "🔄 Refreshing",
      description: "Updating analysis history...",
    });
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      await firebaseAnalysisStorage.deleteAnalysisResults(analysisId);
      setAnalysisHistory((prev) => prev.filter((a) => a.id !== analysisId));

      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
      }

      toast({
        title: "🗑️ Analysis Deleted",
        description: "Analysis has been deleted from cloud storage.",
      });
    } catch (error) {
      logger.error("Error deleting analysis:", error);
      toast({
        title: "❌ Delete Failed",
        description: "Could not delete analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAnalysis = (analysis: FirebaseAnalysisData) => {
    setSelectedAnalysis(analysis);
    if (onAnalysisSelect) {
      onAnalysisSelect(analysis);
    }
  };

  const handleSearchAnalysis = async () => {
    if (!userId || !searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const results = await firebaseAnalysisStorage.searchAnalysis(searchTerm);
      setAnalysisHistory(results);

      toast({
        title: "🔍 Search Complete",
        description: `Found ${results.length} matching analyses.`,
      });
    } catch (error) {
      logger.error("Error searching analysis:", error);
      toast({
        title: "❌ Search Failed",
        description: "Could not search analyses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: { toDate?: () => Date } | string | number | Date) => {
    const date = timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && timestamp.toDate ? timestamp.toDate() : new Date(timestamp as string | number | Date);
    return date.toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
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

  if (!userId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" />
            Cloud Storage Unavailable
          </CardTitle>
          <CardDescription>
            Please sign in to access cloud-stored analysis results.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isOnline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" />
            Offline Mode
          </CardTitle>
          <CardDescription>
            Cloud storage is unavailable while offline. Analysis history will
            sync when connection is restored.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Firebase Analytics Dashboard
              </CardTitle>
              <CardDescription>
                Manage your cloud-stored analysis results
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search analyses by filename, tags, or issue type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
              onKeyPress={(e) => e.key === "Enter" && handleSearchAnalysis()}
            />
            <Button onClick={handleSearchAnalysis} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={loadAnalysisHistory}
              disabled={isLoading}
            >
              <Filter className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Analysis History</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading analysis history...</span>
                </div>
              </CardContent>
            </Card>
          ) : analysisHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Cloud className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Analysis History
                  </h3>
                  <p className="text-muted-foreground">
                    Your analysis results will appear here once you start using
                    the tool.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {analysisHistory.map((analysis) => (
                <Card
                  key={analysis.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAnalysis?.id === analysis.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => handleSelectAnalysis(analysis)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{analysis.fileName}</h3>
                          <Badge
                            variant={
                              analysis.syncStatus === "synced"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {analysis.syncStatus}
                          </Badge>
                          {analysis.compressed && (
                            <Badge variant="outline" className="text-xs">
                              Compressed
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>
                            📁 {(analysis.fileSize / 1024).toFixed(1)} KB
                          </span>
                          <span>
                            🐛 {analysis.results.issues?.length || 0} issues
                          </span>
                          <span>📄 {analysis.results.totalFiles} files</span>
                          <span>⏱️ {formatDate(analysis.createdAt)}</span>
                        </div>

                        {analysis.tags && analysis.tags.length > 0 && (
                          <div className="flex gap-1 mb-2">
                            {analysis.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Issue severity breakdown */}
                        {analysis.results.issues &&
                          analysis.results.issues.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {["critical", "high", "medium", "low"].map(
                                (severity) => {
                                  const count =
                                    analysis.results.issues?.filter(
                                      (issue) =>
                                        issue.severity.toLowerCase() ===
                                        severity
                                    ).length || 0;

                                  if (count === 0) return null;

                                  return (
                                    <Badge
                                      key={severity}
                                      variant={getSeverityColor(severity)}
                                      className="text-xs"
                                    >
                                      {severity}: {count}
                                    </Badge>
                                  );
                                }
                              )}
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Export functionality can be added here
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnalysis(analysis.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  Analysis Details: {selectedAnalysis.fileName}
                </CardTitle>
                <CardDescription>
                  Detailed information about the selected analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">File Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Size:</strong>{" "}
                        {(selectedAnalysis.fileSize / 1024).toFixed(1)} KB
                      </p>
                      <p>
                        <strong>Hash:</strong>{" "}
                        {selectedAnalysis.fileHash.substring(0, 16)}...
                      </p>
                      <p>
                        <strong>Created:</strong>{" "}
                        {formatDate(selectedAnalysis.createdAt)}
                      </p>
                      <p>
                        <strong>Updated:</strong>{" "}
                        {formatDate(selectedAnalysis.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Analysis Results</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Total Issues:</strong>{" "}
                        {selectedAnalysis.results.issues?.length || 0}
                      </p>
                      <p>
                        <strong>Files Analyzed:</strong>{" "}
                        {selectedAnalysis.results.totalFiles}
                      </p>
                      <p>
                        <strong>Analysis Time:</strong>{" "}
                        {selectedAnalysis.results.analysisTime}
                      </p>
                      <p>
                        <strong>Engine:</strong>{" "}
                        {selectedAnalysis.metadata.analysisEngine}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedAnalysis.results.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedAnalysis.results.summary.criticalIssues}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Critical
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedAnalysis.results.summary.highIssues}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          High
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedAnalysis.results.summary.mediumIssues}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Medium
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Select an analysis from the list to view details.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <CardDescription>
                Your analysis usage and cloud storage stats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {analysisHistory.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Analyses
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {analysisHistory.reduce(
                      (sum, a) => sum + (a.results.issues?.length || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Issues Found
                  </div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {analysisHistory.reduce(
                      (sum, a) => sum + a.results.totalFiles,
                      0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Files Analyzed
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Storage Usage</h4>
                <div className="space-y-2">
                  <Progress value={75} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Using 75% of available cloud storage
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
