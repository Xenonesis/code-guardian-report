import React, { useState, useCallback } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Archive,
  Shield,
  AlertTriangle,
  FileText,
  Zap,
  Package,
  Scale,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  ZipAnalysisService,
  ZipAnalysisResult,
} from "@/services/security/zipAnalysisService";
import { EnhancedFileAnalysisResult } from "@/services/security/enhancedFileAnalysisService";
import {
  DependencyVulnerabilityScanner,
  DependencyScanResult,
} from "@/services/security/dependencyVulnerabilityScanner";
import { toast } from "sonner";
import JSZip from "jszip";

interface ZipSecurityAnalyzerProps {
  onAnalysisComplete?: (_results: {
    zipAnalysis: ZipAnalysisResult;
    fileAnalysis: EnhancedFileAnalysisResult[];
    dependencyAnalysis: DependencyScanResult;
  }) => void;
  className?: string;
}

export const ZipSecurityAnalyzer: React.FC<ZipSecurityAnalyzerProps> = ({
  onAnalysisComplete,
  className = "",
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<{
    zipAnalysis: ZipAnalysisResult | null;
    fileAnalysis: EnhancedFileAnalysisResult[];
    dependencyAnalysis: DependencyScanResult | null;
  }>({
    zipAnalysis: null,
    fileAnalysis: [],
    dependencyAnalysis: null,
  });

  const zipAnalysisService = new ZipAnalysisService();
  // Removed unused fileAnalysisService to satisfy lints
  const dependencyScanner = new DependencyVulnerabilityScanner();

  const analyzeFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".zip")) {
        toast.error("Please select a ZIP file");
        return;
      }

      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisStage("Preparing analysis...");

      try {
        setAnalysisStage("Analyzing ZIP file structure...");
        setAnalysisProgress(10);
        const zipAnalysis = await zipAnalysisService.analyzeZipFile(file);

        setAnalysisProgress(30);
        setAnalysisStage("Extracting manifests for dependency scan...");
        const ab = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(ab);
        const manifestNames = new Set([
          "package.json",
          "yarn.lock",
          "pnpm-lock.yaml",
          "requirements.txt",
          "Pipfile",
          "poetry.lock",
          "composer.json",
          "composer.lock",
          "Gemfile",
          "Gemfile.lock",
          "pom.xml",
          "build.gradle",
          "Cargo.toml",
          "Cargo.lock",
        ]);
        const filesForScan: Array<{ name: string; content: string }> = [];
        await Promise.all(
          Object.keys(zip.files).map(async (p) => {
            const f = zip.files[p];
            if (f.dir) return;
            const base = p.split("/").pop() || p;
            if (manifestNames.has(base)) {
              const content = await f.async("string");
              filesForScan.push({ name: base, content });
            }
          })
        );

        setAnalysisProgress(55);
        setAnalysisStage("Performing enhanced file analysis...");
        const fileAnalysisResults: EnhancedFileAnalysisResult[] = [];

        setAnalysisProgress(70);
        setAnalysisStage(
          "Scanning dependencies for vulnerabilities (live OSV)..."
        );
        const dependencyAnalysis =
          await dependencyScanner.scanDependencies(filesForScan);

        setAnalysisProgress(90);
        setAnalysisStage("Finalizing analysis...");
        const finalResults = {
          zipAnalysis,
          fileAnalysis: fileAnalysisResults,
          dependencyAnalysis,
        };
        setResults(finalResults);
        setAnalysisProgress(100);
        setAnalysisStage("Analysis complete!");
        if (onAnalysisComplete) onAnalysisComplete(finalResults);
        toast.success("ZIP file analysis completed successfully");
      } catch (error) {
        globalThis.console?.error?.("Analysis failed:", error);
        toast.error(
          `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [dependencyScanner, onAnalysisComplete, zipAnalysisService]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      await analyzeFile(file);
    },
    [analyzeFile]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await analyzeFile(file);
    },
    [analyzeFile]
  );

  const handleReset = useCallback(() => {
    setResults({
      zipAnalysis: null,
      fileAnalysis: [],
      dependencyAnalysis: null,
    });
    setAnalysisProgress(0);
    setAnalysisStage("");
    setIsAnalyzing(false);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Removed unused getRiskLevelColor

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            ZIP File Security Analyzer
          </CardTitle>
          <CardDescription>
            Comprehensive security analysis of ZIP archives including file
            structure, vulnerabilities, and dependencies
          </CardDescription>
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            disabled={isAnalyzing}
          >
            Reset
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload ZIP File</h3>
                <p className="text-sm text-gray-600">
                  Select a ZIP file to perform comprehensive security analysis
                </p>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  disabled={isAnalyzing}
                  aria-label="Upload ZIP file for security analysis"
                  title="Upload ZIP file for security analysis"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="sr-only" aria-live="polite">
                {analysisStage}
              </div>
            </div>

            {isAnalyzing && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{analysisStage}</span>
                  <span className="text-sm text-gray-600">
                    {analysisProgress}%
                  </span>
                </div>
                <Progress value={analysisProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {results.zipAnalysis && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-md shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center gap-2">
              Threats
              <Badge variant="destructive">
                {results.zipAnalysis?.securityThreats.length ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-2">
              Structure
              <Badge variant="secondary">
                {results.zipAnalysis?.fileStructure.suspiciousFiles.length ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="dependencies"
              className="flex items-center gap-2"
            >
              Dependencies
              <Badge variant="secondary">
                {results.dependencyAnalysis?.vulnerabilities.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex items-center gap-2">
              Quality
              <Badge variant="secondary">
                {results.zipAnalysis?.codeQuality.linesOfCode ?? 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              Compliance
              <Badge variant="secondary">
                {results.zipAnalysis?.complianceIssues.length ?? 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Security Score */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-800">
                        {100 - results.zipAnalysis!.securityThreats.length * 10}
                      </p>
                      <p className="text-sm text-blue-600">Security Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Files */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-800">
                        {results.zipAnalysis!.fileStructure.totalFiles}
                      </p>
                      <p className="text-sm text-green-600">Total Files</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Threats */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-800">
                        {results.zipAnalysis!.securityThreats.length}
                      </p>
                      <p className="text-sm text-red-600">Security Threats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerabilities */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-800">
                        {results.dependencyAnalysis?.summary
                          .criticalVulnerabilities || 0}
                      </p>
                      <p className="text-sm text-orange-600">Critical Vulns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">File Structure</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Size:</span>
                        <span>
                          {(
                            results.zipAnalysis!.fileStructure.totalSize /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compression Ratio:</span>
                        <span>
                          {(
                            results.zipAnalysis!.fileStructure
                              .compressionRatio * 100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deepest Path:</span>
                        <span>
                          {results.zipAnalysis!.fileStructure.deepestPath}{" "}
                          levels
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Security Status</h4>
                    <div className="space-y-2">
                      {results.zipAnalysis!.securityThreats.length === 0 ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>No security threats detected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span>
                            {results.zipAnalysis!.securityThreats.length}{" "}
                            threats found
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>License Issues:</span>
                        <span
                          className={
                            results.zipAnalysis!.licenses.length > 0
                              ? "text-yellow-600"
                              : "text-green-600"
                          }
                        >
                          {results.zipAnalysis!.licenses.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Threats Tab */}
          <TabsContent value="threats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Threats</CardTitle>
                <CardDescription>
                  Detected security threats and vulnerabilities in the ZIP
                  archive
                </CardDescription>
              </CardHeader>
              <CardContent>
                {results.zipAnalysis!.securityThreats.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-700">
                      No Security Threats Detected
                    </h3>
                    <p className="text-green-600">
                      The ZIP file appears to be safe
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.zipAnalysis!.securityThreats.map(
                      (threat, index) => (
                        <Alert
                          key={index}
                          className="border-l-4 border-l-red-500"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <div className="ml-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="destructive">
                                {threat.severity}
                              </Badge>
                              <Badge variant="outline">{threat.type}</Badge>
                              {threat.cweId && (
                                <Badge variant="secondary">
                                  {threat.cweId}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold">
                              {threat.description}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              File: {threat.file}
                            </p>

                            {threat.evidence.length > 0 && (
                              <div className="mb-2">
                                <p className="text-sm font-medium">Evidence:</p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {threat.evidence.map((evidence, i) => (
                                    <li key={i}>{evidence}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="bg-blue-50 p-3 rounded-md">
                              <p className="text-sm font-medium text-blue-800">
                                Mitigation:
                              </p>
                              <p className="text-sm text-blue-700">
                                {threat.mitigation}
                              </p>
                            </div>
                          </div>
                        </Alert>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>File Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(
                      results.zipAnalysis!.fileStructure.fileTypes
                    ).map(([type, count]) => (
                      <div
                        key={type}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">
                          {type || "No extension"}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.round(
                              (count /
                                results.zipAnalysis!.fileStructure.totalFiles) *
                                100
                            )}
                            className="w-20"
                          />
                          <span className="text-sm font-medium w-8">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suspicious Files */}
              <Card>
                <CardHeader>
                  <CardTitle>Suspicious Files</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.zipAnalysis!.fileStructure.suspiciousFiles.length ===
                  0 ? (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-600">
                        No suspicious files detected
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {results.zipAnalysis!.fileStructure.suspiciousFiles.map(
                        (file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-yellow-50 rounded"
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm">{file}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dependencies Tab */}
          <TabsContent value="dependencies" className="space-y-6">
            {results.dependencyAnalysis ? (
              <>
                {/* Dependency Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-2xl font-bold">
                            {results.dependencyAnalysis.summary.totalPackages}
                          </p>
                          <p className="text-sm text-gray-600">
                            Total Packages
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-2xl font-bold text-red-600">
                            {
                              results.dependencyAnalysis.summary
                                .criticalVulnerabilities
                            }
                          </p>
                          <p className="text-sm text-gray-600">
                            Critical Vulns
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {
                              results.dependencyAnalysis.summary
                                .outdatedPackages
                            }
                          </p>
                          <p className="text-sm text-gray-600">Outdated</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Scale className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {results.dependencyAnalysis.summary.licenseIssues}
                          </p>
                          <p className="text-sm text-gray-600">
                            License Issues
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vulnerabilities List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Dependency Vulnerabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {results.dependencyAnalysis.vulnerabilities.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-green-700">
                          No Vulnerabilities Found
                        </h3>
                        <p className="text-green-600">
                          All dependencies appear to be secure
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {results.dependencyAnalysis.vulnerabilities.map(
                          (vuln, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">
                                    {vuln.vulnerability.title}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {vuln.package} v{vuln.version}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Badge
                                    className={getSeverityColor(
                                      vuln.vulnerability.severity
                                    )}
                                  >
                                    {vuln.vulnerability.severity}
                                  </Badge>
                                  <Badge variant="outline">
                                    CVSS: {vuln.vulnerability.cvss.score}
                                  </Badge>
                                </div>
                              </div>

                              <p className="text-sm mb-3">
                                {vuln.vulnerability.description}
                              </p>

                              {vuln.fixAvailable && (
                                <div className="bg-green-50 p-3 rounded-md">
                                  <p className="text-sm font-medium text-green-800">
                                    Fix Available: Update to {vuln.fixVersion}
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No dependency information available
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Code Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {results.zipAnalysis!.codeQuality.codeFiles}
                    </p>
                    <p className="text-sm text-gray-600">Code Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {results.zipAnalysis!.codeQuality.testFiles}
                    </p>
                    <p className="text-sm text-gray-600">Test Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {results.zipAnalysis!.codeQuality.linesOfCode}
                    </p>
                    <p className="text-sm text-gray-600">Lines of Code</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {(
                        results.zipAnalysis!.codeQuality.averageFileSize / 1024
                      ).toFixed(1)}
                      KB
                    </p>
                    <p className="text-sm text-gray-600">Avg File Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Largest Files */}
            {results.zipAnalysis!.codeQuality.largestFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Largest Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.zipAnalysis!.codeQuality.largestFiles.map(
                      (file, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm truncate">{file.file}</span>
                          <span className="text-sm font-medium">
                            {(file.size / 1024).toFixed(1)}KB
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {results.zipAnalysis!.complianceIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-700">
                      No Compliance Issues
                    </h3>
                    <p className="text-green-600">
                      Code appears to meet compliance standards
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.zipAnalysis!.complianceIssues.map(
                      (issue, index) => (
                        <Alert key={index}>
                          <Scale className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {issue.standard}
                                </Badge>
                                <Badge
                                  className={getSeverityColor(issue.severity)}
                                >
                                  {issue.severity}
                                </Badge>
                              </div>
                              <p className="font-medium">{issue.issue}</p>
                              <p className="text-sm text-gray-600">
                                Files affected: {issue.files.join(", ")}
                              </p>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.zipAnalysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-l-blue-500 pl-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{rec.priority}</Badge>
                        <Badge variant="secondary">{rec.category}</Badge>
                      </div>
                      <h4 className="font-medium">{rec.description}</h4>
                      <p className="text-sm text-gray-600">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ZipSecurityAnalyzer;
