import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Package, Clock, Database } from 'lucide-react';
import { DependencyScanResult } from '@/services/security/dependencyVulnerabilityScanner';

interface DependencyAnalysisDisplayProps {
  dependencyAnalysis: DependencyScanResult | null | undefined;
  onRetry?: () => void | Promise<void>;
  isLoading?: boolean;
}

export const DependencyAnalysisDisplay: React.FC<DependencyAnalysisDisplayProps> = ({
  dependencyAnalysis,
  onRetry,
  isLoading
}) => {
  // Handle case where dependency analysis failed or is undefined
  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-900/10 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        if (typeof window !== 'undefined') window.location.reload();
      } catch {
        // no-op fallback
      }
    };

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-900/10 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="rounded-2xl p-3 bg-slate-100 dark:bg-slate-800">
                <Package className="h-8 w-8 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50 mb-1">
                  Dependency Analysis Unavailable
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                  We couldn't complete dependency scanning. This often happens when required package manifests are missing
                  or the file selection didn't include them.
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-3 mt-2">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
                >
                  Try again
                </button>
                <a
                  href="#dependency-help"
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  How to enable scanning
                </a>
              </div>

              <div id="dependency-help" className="w-full mt-4">
                <div className="text-left mx-auto max-w-2xl">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">To enable Dependency Scanning:</h4>
                  <ul className="text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 space-y-1">
                    <li>Include at least one supported manifest when running analysis or uploading archives.</li>
                    <li>Ensure the manifest files are at the project root inside your zip or selection.</li>
                  </ul>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/30">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">JavaScript/TypeScript</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">package.json, yarn.lock</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/30">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Python</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">requirements.txt</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/30">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Java (Maven/Gradle)</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">pom.xml, build.gradle</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/30">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">PHP</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">composer.json, composer.lock</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/30">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Rust</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Cargo.toml, Cargo.lock</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white/70 dark:bg-slate-900/30">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Ruby</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Gemfile, Gemfile.lock</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Tip: If you uploaded a zip, make sure your manifests are not nested too deeply. Place them near the root for best results.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { summary, vulnerabilities, licenseIssues, outdatedPackages, supplyChainRisks, recommendations } = dependencyAnalysis;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUpdateRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'immediate':
        return 'text-red-600 border-red-600';
      case 'planned':
        return 'text-yellow-600 border-yellow-600';
      default:
        return 'text-blue-600 border-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Metadata Header */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/10 dark:to-teal-950/10 border-emerald-200 dark:border-emerald-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
            <Package className="h-5 w-5" />
            Dependencies Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-emerald-900/80 dark:text-emerald-200/80">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2">
                <span className="font-medium">Scanned:</span>
                <time dateTime={new Date(summary ? (dependencyAnalysis?.scanMetadata?.scanDate || new Date()) : new Date()).toISOString()}>
                  {dependencyAnalysis?.scanMetadata?.scanDate ? new Date(dependencyAnalysis.scanMetadata.scanDate).toLocaleString() : '—'}
                </time>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="font-medium">Duration:</span>
                <span>{typeof dependencyAnalysis?.scanMetadata?.scanDuration === 'number' ? `${Math.max(1, Math.round(dependencyAnalysis.scanMetadata.scanDuration))} ms` : '—'}</span>
              </span>
            </div>
            <div className="text-xs opacity-80">
              Databases: {Array.isArray(dependencyAnalysis?.scanMetadata?.databasesUsed) ? dependencyAnalysis!.scanMetadata.databasesUsed.join(', ') : '—'}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Packages</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summary.totalPackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-900 dark:text-red-100">Vulnerabilities</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summary.vulnerablePackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Outdated</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.outdatedPackages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Risk Score</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{summary.overallRiskScore}</p>
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
              Great news! We didn’t find any known vulnerabilities in your dependencies.
              Keep your dependencies updated and consider enabling automated scanning in CI.
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
              {vulnerabilities.slice(0, 10).map((vuln) => (
                <div key={`vulnerability-${vuln.package}-${vuln.vulnerability.id}`} className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(vuln.vulnerability.severity)}>
                          {vuln.vulnerability.severity}
                        </Badge>
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {vuln.vulnerability.id}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {vuln.vulnerability.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {vuln.vulnerability.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Package: {vuln.package}@{vuln.version}</span>
                        {vuln.fixAvailable && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Fix Available: {vuln.fixVersion}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {vulnerabilities.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
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
              {licenseIssues.map((issue) => (
                <div key={`license-${issue.package}-${issue.license}`} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                      <h4 className="font-semibold text-gray-900 dark:text-white mt-1">
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
              {outdatedPackages.slice(0, 10).map((pkg) => (
                <div key={`outdated-${pkg.package}-${pkg.currentVersion}`} className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {pkg.package}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {pkg.currentVersion} → {pkg.latestVersion}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getUpdateRecommendationColor(pkg.updateRecommendation)}>
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
                <p className="text-sm text-gray-500 text-center">
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
              {recommendations.map((rec) => (
                <div key={`recommendation-${rec.title}-${rec.priority}`} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                  <div className="flex items-start gap-3">
                    <Badge className={getSeverityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {rec.description}
                      </p>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
                        Action: {rec.action}
                      </p>
                      {rec.packages.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rec.packages.slice(0, 5).map((pkg) => (
                            <Badge key={`pkg-${pkg}`} variant="outline" className="text-xs">
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
              {supplyChainRisks.map((risk) => (
                <div key={`risk-${risk.package}-${risk.riskType}`} className="border rounded-lg p-4 bg-purple-50 dark:bg-purple-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getSeverityColor(risk.severity)}>
                      {risk.severity}
                    </Badge>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                      {risk.riskType.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {risk.package}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
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