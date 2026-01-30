import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  FileCheck,
  FileX,
  Scan,
  Clock,
  TrendingUp,
  Eye,
  CheckCircle,
  Activity,
  Database,
  Settings,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import {
  CodeProvenanceService,
  TamperingAlert,
  ProvenanceReport,
} from "../../services/detection/codeProvenanceService";
import { toast } from "sonner";

import { logger } from "@/utils/logger";
interface CodeProvenanceCardProps {
  files?: { filename: string; content: string }[];
  onInitializeMonitoring?: () => void;
  className?: string;
}

export const CodeProvenanceCard: React.FC<CodeProvenanceCardProps> = ({
  files = [],
  onInitializeMonitoring,
  className = "",
}) => {
  const [provenanceService] = useState(() => new CodeProvenanceService());
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<ProvenanceReport | null>(null);
  const [alerts, setAlerts] = useState<TamperingAlert[]>([]);
  const [statistics, setStatistics] = useState({
    totalFiles: 0,
    criticalFiles: 0,
    alertCount: 0,
    lastScanTime: null as Date | null,
    monitoringStatus: false,
  });

  const loadInitialData = useCallback(() => {
    const stats = provenanceService.getMonitoringStatistics();
    setStatistics(
      stats || {
        totalFiles: 0,
        criticalFiles: 0,
        alertCount: 0,
        lastScanTime: null,
        monitoringStatus: false,
      }
    );

    const currentAlerts = provenanceService.getAlerts();
    setAlerts(currentAlerts || []);
  }, [provenanceService]);

  const performIntegrityScan = useCallback(async () => {
    if (files.length === 0) return;

    setIsScanning(true);
    try {
      const scanReport = await provenanceService.performIntegrityScan(files);
      if (scanReport) {
        setReport(scanReport);
        loadInitialData();

        if (
          scanReport.integrityViolations &&
          scanReport.integrityViolations > 0
        ) {
          toast.warning(
            `Integrity scan complete: ${scanReport.integrityViolations} violations found`
          );
        } else {
          toast.success("Integrity scan complete: No violations detected");
        }
      } else {
        toast.error("Integrity scan failed: No report generated");
      }
    } catch (error) {
      toast.error("Integrity scan failed");
      logger.error("Scan error:", error);
    } finally {
      setIsScanning(false);
    }
  }, [files, provenanceService, loadInitialData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (files.length > 0) {
      performIntegrityScan();
    }
  }, [performIntegrityScan, files]);

  const initializeMonitoring = async () => {
    if (files.length === 0) {
      toast.error("No files available for monitoring");
      return;
    }

    setIsScanning(true);
    try {
      await provenanceService.initializeMonitoring(files);
      loadInitialData();
      toast.success(`Monitoring initialized for ${files.length} files`);
      onInitializeMonitoring?.();
    } catch (error) {
      toast.error("Failed to initialize monitoring");
      logger.error("Monitoring initialization error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    const success = provenanceService.resolveAlert(alertId);
    if (success) {
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      toast.success("Alert resolved");
    } else {
      toast.error("Failed to resolve alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "modification":
        return <FileCheck className="h-4 w-4" />;
      case "deletion":
        return <FileX className="h-4 w-4" />;
      case "unauthorized_access":
        return <Eye className="h-4 w-4" />;
      case "suspicious_pattern":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card
      className={`border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-900/20 ${className}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Code Provenance & Integrity Monitoring
          <Badge variant="outline" className="border-green-300 text-green-600">
            {statistics.monitoringStatus ? "Active" : "Inactive"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Monitor file integrity, detect unauthorized changes, and track code
          provenance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="border-border bg-card/80 grid w-full grid-cols-2 gap-1 rounded-xl border p-1 shadow-lg backdrop-blur-sm sm:grid-cols-4 sm:gap-0">
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white sm:text-sm"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white sm:text-sm"
            >
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger
              value="monitoring"
              className="flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white sm:text-sm"
            >
              Monitoring
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white sm:text-sm"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Status Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500 p-2">
                      <Database className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                        {statistics.totalFiles}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Total Files
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-500 p-2">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                        {statistics.criticalFiles}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Critical Files
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500 p-2">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                        {statistics.alertCount}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">
                        Active Alerts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500 p-2">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-bold ${getRiskScoreColor(report?.riskScore || 0)}`}
                      >
                        {report?.riskScore || 0}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Risk Score
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Assessment */}
            {report && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">
                          Overall Risk Score
                        </span>
                        <span
                          className={`text-sm font-bold ${getRiskScoreColor(report.riskScore)}`}
                        >
                          {report.riskScore}/100
                        </span>
                      </div>
                      <Progress value={report.riskScore} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                      <div>
                        <span className="font-medium">
                          Integrity Violations:
                        </span>
                        <span className="ml-2 text-red-600">
                          {report.integrityViolations || 0}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Last Scan:</span>
                        <span className="ml-2 text-slate-600">
                          {report.lastScanTime.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Monitored Files:</span>
                        <span className="ml-2 text-green-600">
                          {report.monitoredFiles}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!statistics.monitoringStatus ? (
                <Button
                  onClick={initializeMonitoring}
                  disabled={isScanning || files.length === 0}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Initialize Monitoring
                </Button>
              ) : (
                <Button onClick={performIntegrityScan} disabled={isScanning}>
                  {isScanning ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Scan className="mr-2 h-4 w-4" />
                  )}
                  {isScanning ? "Scanning..." : "Run Integrity Scan"}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            {alerts.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <p className="text-slate-600 dark:text-slate-400">
                  No integrity alerts detected
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  All monitored files are secure
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {getAlertTypeIcon(alert.alertType)}
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{alert.alertType}</Badge>
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Clock className="h-3 w-3" />
                              {alert.detectedAt.toLocaleString()}
                            </div>
                          </div>
                          <CardTitle className="text-lg">
                            {alert.filename}
                          </CardTitle>
                          <CardDescription>{alert.description}</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Resolve
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="mb-2 font-semibold">
                            Risk Assessment
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {alert.riskAssessment}
                          </p>
                        </div>

                        {alert.changes.length > 0 && (
                          <div>
                            <h4 className="mb-2 font-semibold">
                              Detected Changes
                            </h4>
                            <div className="space-y-2">
                              {alert.changes.map((change, index) => (
                                <div
                                  key={index}
                                  className="rounded bg-slate-50 p-3 dark:bg-slate-800"
                                >
                                  <div className="mb-1 flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {change.type}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {change.field}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {change.confidence}% confidence
                                    </span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-red-600">
                                      - {change.oldValue}
                                    </span>
                                    <br />
                                    <span className="text-green-600">
                                      + {change.newValue}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="mb-2 font-semibold">
                            Recommended Actions
                          </h4>
                          <ul className="space-y-1">
                            {alert.recommendedActions.map((action, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                                <span className="text-slate-600 dark:text-slate-400">
                                  {action}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            False Positive Risk:
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {alert.falsePositiveRisk}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Monitoring Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Monitoring Status</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      File integrity monitoring is{" "}
                      {statistics.monitoringStatus ? "active" : "inactive"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      statistics.monitoringStatus ? "default" : "secondary"
                    }
                  >
                    {statistics.monitoringStatus ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-semibold">File Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Files:</span>
                        <span>{statistics.totalFiles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Critical Files:</span>
                        <span className="text-red-600">
                          {statistics.criticalFiles}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Alerts:</span>
                        <span className="text-orange-600">
                          {statistics.alertCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold">Last Activity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {statistics.lastScanTime
                            ? statistics.lastScanTime.toLocaleString()
                            : "No scans performed"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {report ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Latest Integrity Report
                  </CardTitle>
                  <CardDescription>
                    Generated on {report.lastScanTime.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {Object.entries(report.fileStatistics.byCategory).map(
                      ([category, count]) => (
                        <div key={category} className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {count}
                          </p>
                          <p className="text-sm text-slate-600 capitalize">
                            {category} Files
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  <div>
                    <h4 className="mb-2 font-semibold">
                      File Distribution by Importance
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(report.fileStatistics.byImportance).map(
                        ([importance, count]) => (
                          <div
                            key={importance}
                            className="flex items-center gap-2"
                          >
                            <Badge
                              variant="outline"
                              className="w-20 justify-center"
                            >
                              {importance}
                            </Badge>
                            <Progress
                              value={(count / report.totalFiles) * 100}
                              className="h-2 flex-1"
                            />
                            <span className="w-12 text-right text-sm">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="py-8 text-center">
                <Activity className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">
                  No integrity reports available
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Run an integrity scan to generate a report
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
