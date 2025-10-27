import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Package, Clock, Database } from 'lucide-react';
import { DependencyScanResult } from '@/services/security/dependencyVulnerabilityScanner';

interface DependencyAnalysisDisplayProps {
  dependencyAnalysis: DependencyScanResult;
}

export const DependencyAnalysisDisplay: React.FC<DependencyAnalysisDisplayProps> = ({
  dependencyAnalysis
}) => {
  // Handle case where dependency analysis failed or is undefined
  if (!dependencyAnalysis) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200 dark:border-gray-800">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Dependency Analysis Unavailable
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Dependency scanning encountered an error. This may be due to missing package files or configuration issues.
            </p>
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
      {vulnerabilities.length > 0 && (
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