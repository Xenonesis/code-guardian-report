import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Package, Clock, Database } from "lucide-react";
import { DependencyScanResult } from "@/services/security/dependencyVulnerabilityScanner";

interface DependencyAnalysisDisplayProps {
  dependencyAnalysis: DependencyScanResult | null | undefined;
  onRetry?: () => void | Promise<void>;
  isLoading?: boolean;
}

export const DependencyAnalysisDisplay: React.FC<
  DependencyAnalysisDisplayProps
> = ({ dependencyAnalysis, onRetry: _onRetry, isLoading }) => {
  // Handle case where dependency analysis failed or is undefined
  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-900/10">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="h-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-80 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dependencyAnalysis) {
    const handleRetry = () => {
      try {
        // Simple retry: reload the page to re-run analysis flow
        if (typeof window !== "undefined") window.location.reload();
      } catch {
        // no-op fallback
      }
    };

    return (
      <div className="space-y-6">
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm dark:border-slate-800 dark:from-slate-900/40 dark:to-slate-900/10">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                <Package className="h-8 w-8 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-50">
                  Dependency Analysis Unavailable
                </h3>
                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  We couldn't complete dependency scanning. This often happens
                  when required package manifests are missing or the file
                  selection didn't include them.
                </p>
              </div>

              <div className="mt-2 flex flex-col items-center gap-3 md:flex-row">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-900"
                >
                  Try again
                </button>
                <a
                  href="#dependency-help"
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50/60 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                >
                  How to enable scanning
                </a>
              </div>

              <div id="dependency-help" className="mt-4 w-full">
                <div className="mx-auto max-w-2xl text-left">
                  <h4 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    To enable Dependency Scanning:
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                    <li>
                      Include at least one supported manifest when running
                      analysis or uploading archives.
                    </li>
                    <li>
                      Ensure the manifest files are at the project root inside
                      your zip or selection.
                    </li>
                  </ul>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        JavaScript/TypeScript
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        package.json, yarn.lock
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Python
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        requirements.txt
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Java (Maven/Gradle)
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        pom.xml, build.gradle
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        PHP
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        composer.json, composer.lock
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Rust
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Cargo.toml, Cargo.lock
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/30">
                      <p className="mb-1 text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Ruby
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Gemfile, Gemfile.lock
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Tip: If you uploaded a zip, make sure your manifests are not
                    nested too deeply. Place them near the root for best
                    results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    summary,
    vulnerabilities,
    licenseIssues,
    outdatedPackages,
    supplyChainRisks,
    recommendations,
  } = dependencyAnalysis;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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

  const getUpdateRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "immediate":
        return "text-red-600 border-red-600";
      case "planned":
        return "text-yellow-600 border-yellow-600";
      default:
        return "text-blue-600 border-blue-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Metadata Header */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900 dark:from-emerald-950/10 dark:to-teal-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Package className="h-5 w-5" />
            Dependencies Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-emerald-900/80 dark:text-emerald-200/80">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2">
                <span className="font-medium">Scanned:</span>
                <time
                  dateTime={new Date(
                    summary
                      ? dependencyAnalysis?.scanMetadata?.scanDate || new Date()
                      : new Date()
                  ).toISOString()}
                >
                  {dependencyAnalysis?.scanMetadata?.scanDate
                    ? new Date(
                        dependencyAnalysis.scanMetadata.scanDate
                      ).toLocaleString()
                    : "—"}
                </time>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="font-medium">Duration:</span>
                <span>
                  {typeof dependencyAnalysis?.scanMetadata?.scanDuration ===
                  "number"
                    ? `${Math.max(1, Math.round(dependencyAnalysis.scanMetadata.scanDuration))} ms`
                    : "—"}
                </span>
              </span>
            </div>
            <div className="text-xs opacity-80">
              Databases:{" "}
              {Array.isArray(dependencyAnalysis?.scanMetadata?.databasesUsed)
                ? dependencyAnalysis!.scanMetadata.databasesUsed.join(", ")
                : "—"}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Total Packages
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {summary.totalPackages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50 dark:border-red-800 dark:from-red-950/20 dark:to-pink-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">
                  Vulnerabilities
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {summary.vulnerablePackages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:border-yellow-800 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Outdated
                </p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {summary.outdatedPackages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Risk Score
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {summary.overallRiskScore}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vulnerabilities Section */}
      {vulnerabilities.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              No Vulnerabilities Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Great news! We didn’t find any known vulnerabilities in your
              dependencies. Keep your dependencies updated and consider enabling
              automated scanning in CI.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Security Vulnerabilities ({vulnerabilities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vulnerabilities.slice(0, 10).map((vuln, index) => (
                <div
                  key={`vulnerability-${vuln.package}-${vuln.vulnerability.id}-${vuln.version}-${index}`}
                  className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          className={getSeverityColor(
                            vuln.vulnerability.severity
                          )}
                        >
                          {vuln.vulnerability.severity}
                        </Badge>
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {vuln.vulnerability.id}
                        </span>
                      </div>
                      <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                        {vuln.vulnerability.title}
                      </h4>
                      <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                        {vuln.vulnerability.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          Package: {vuln.package}@{vuln.version}
                        </span>
                        {vuln.fixAvailable && (
                          <Badge
                            variant="outline"
                            className="border-green-600 text-green-600"
                          >
                            Fix Available: {vuln.fixVersion}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {vulnerabilities.length > 10 && (
                <p className="text-center text-sm text-gray-500">
                  ... and {vulnerabilities.length - 10} more vulnerabilities
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* License Issues Section */}
      {licenseIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              License Issues ({licenseIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {licenseIssues.map((issue, index) => (
                <div
                  key={`license-${issue.package}-${issue.license}-${index}`}
                  className="rounded-lg border bg-yellow-50 p-4 dark:bg-yellow-950/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <h4 className="mt-1 font-semibold text-gray-900 dark:text-white">
                        {issue.package}: {issue.license}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Outdated Packages Section */}
      {outdatedPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Outdated Packages ({outdatedPackages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outdatedPackages.slice(0, 10).map((pkg, index) => (
                <div
                  key={`outdated-${pkg.package}-${pkg.currentVersion}-${index}`}
                  className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {pkg.package}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {pkg.currentVersion} → {pkg.latestVersion}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={getUpdateRecommendationColor(
                            pkg.updateRecommendation
                          )}
                        >
                          {pkg.updateRecommendation}
                        </Badge>
                        {pkg.majorVersionsBehind > 0 && (
                          <span className="text-xs text-gray-500">
                            {pkg.majorVersionsBehind} major versions behind
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {outdatedPackages.length > 10 && (
                <p className="text-center text-sm text-gray-500">
                  ... and {outdatedPackages.length - 10} more outdated packages
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              Recommendations ({recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div
                  key={`recommendation-${rec.title}-${rec.priority}-${index}`}
                  className={`rounded-lg border p-4 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <Badge className={getSeverityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                        {rec.title}
                      </h4>
                      <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        {rec.description}
                      </p>
                      <p className="mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                        Action: {rec.action}
                      </p>
                      {rec.packages.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rec.packages.slice(0, 5).map((pkg, pkgIndex) => (
                            <Badge
                              key={`pkg-${pkg}-${pkgIndex}`}
                              variant="outline"
                              className="text-xs"
                            >
                              {pkg}
                            </Badge>
                          ))}
                          {rec.packages.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{rec.packages.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supply Chain Risks Section */}
      {supplyChainRisks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              Supply Chain Risks ({supplyChainRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supplyChainRisks.map((risk, index) => (
                <div
                  key={`risk-${risk.package}-${risk.riskType}-${index}`}
                  className="rounded-lg border bg-purple-50 p-4 dark:bg-purple-950/10"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <Badge className={getSeverityColor(risk.severity)}>
                      {risk.severity}
                    </Badge>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {risk.riskType.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                    {risk.package}
                  </h4>
                  <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                    {risk.description}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Mitigation: {risk.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
