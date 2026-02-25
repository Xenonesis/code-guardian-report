import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Shield,
  Package,
  Clock,
  Database,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { DependencyScanResult } from "@/services/security/dependencyVulnerabilityScanner";
import { AnimatedScoreRing } from "./AnimatedScoreRing";

interface DependencyAnalysisDisplayProps {
  dependencyAnalysis: DependencyScanResult | null | undefined;
  isLoading?: boolean;
}

export const DependencyAnalysisDisplay: React.FC<
  DependencyAnalysisDisplayProps
> = ({ dependencyAnalysis, isLoading }) => {
  // Handle case where dependency analysis failed or is undefined
  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <Card className="border-border bg-gradient-to-br from-slate-50 to-white shadow-sm dark:from-slate-900/40 dark:to-slate-900/10">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="bg-muted h-6 w-48 rounded" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="bg-muted h-24 rounded-lg" />
                <div className="bg-muted h-24 rounded-lg" />
                <div className="bg-muted h-24 rounded-lg" />
                <div className="bg-muted h-24 rounded-lg" />
              </div>
              <div className="bg-muted h-4 w-64 rounded" />
              <div className="bg-muted h-4 w-80 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dependencyAnalysis) {
    return (
      <div className="space-y-6">
        <Card className="border-border bg-gradient-to-br from-slate-50 to-white shadow-sm dark:from-slate-900/40 dark:to-slate-900/10">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-muted rounded-2xl p-3">
                <Package className="text-muted-foreground h-8 w-8" />
              </div>
              <div>
                <h3 className="text-foreground mb-1 text-xl font-semibold dark:text-slate-50">
                  Dependency Analysis Unavailable
                </h3>
                <p className="text-muted-foreground max-w-2xl text-sm">
                  We couldn't complete dependency scanning. This often happens
                  when required package manifests are missing or the file
                  selection didn't include them.
                </p>
              </div>

              <div className="mt-2 flex flex-col items-center gap-3 md:flex-row">
                <a
                  href="#dependency-help"
                  className="inline-flex items-center justify-center rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50/60 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                >
                  How to enable scanning
                </a>
              </div>

              <div id="dependency-help" className="mt-4 w-full">
                <div className="mx-auto max-w-2xl text-left">
                  <h4 className="text-foreground mb-2 text-sm font-semibold dark:text-slate-200">
                    To enable Dependency Scanning:
                  </h4>
                  <ul className="text-foreground/80 list-disc space-y-1 pl-5 text-sm">
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
                    <div className="border-border bg-card/70 p-3/30 rounded-lg border">
                      <p className="text-foreground mb-1 text-xs font-semibold">
                        JavaScript/TypeScript
                      </p>
                      <p className="text-muted-foreground text-xs">
                        package.json, yarn.lock
                      </p>
                    </div>
                    <div className="border-border bg-card/70 p-3/30 rounded-lg border">
                      <p className="text-foreground mb-1 text-xs font-semibold">
                        Python
                      </p>
                      <p className="text-muted-foreground text-xs">
                        requirements.txt
                      </p>
                    </div>
                    <div className="border-border bg-card/70 p-3/30 rounded-lg border">
                      <p className="text-foreground mb-1 text-xs font-semibold">
                        Java (Maven/Gradle)
                      </p>
                      <p className="text-muted-foreground text-xs">
                        pom.xml, build.gradle
                      </p>
                    </div>
                    <div className="border-border bg-card/70 p-3/30 rounded-lg border">
                      <p className="text-foreground mb-1 text-xs font-semibold">
                        PHP
                      </p>
                      <p className="text-muted-foreground text-xs">
                        composer.json, composer.lock
                      </p>
                    </div>
                    <div className="border-border bg-card/70 p-3/30 rounded-lg border">
                      <p className="text-foreground mb-1 text-xs font-semibold">
                        Rust
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Cargo.toml, Cargo.lock
                      </p>
                    </div>
                    <div className="border-border bg-card/70 p-3/30 rounded-lg border">
                      <p className="text-foreground mb-1 text-xs font-semibold">
                        Ruby
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Gemfile, Gemfile.lock
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mt-3 text-xs">
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

  const [showAllVulnerabilities, setShowAllVulnerabilities] = useState(false);
  const [showAllOutdated, setShowAllOutdated] = useState(false);

  const INITIAL_DISPLAY_COUNT = 10;

  // Compute a dependency health score (0-100)
  const healthScore = useMemo(() => {
    const total = summary.totalPackages || 1;
    const vulnPenalty = Math.min(
      40,
      (summary.vulnerablePackages / total) * 200
    );
    const outdatedPenalty = Math.min(
      30,
      (summary.outdatedPackages / total) * 100
    );
    const riskPenalty = Math.min(30, summary.overallRiskScore * 3);
    return Math.max(
      0,
      Math.round(100 - vulnPenalty - outdatedPenalty - riskPenalty)
    );
  }, [summary]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted-foreground text-white";
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
        return "bg-teal-100 text-blue-800 border-border";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const getUpdateRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "immediate":
        return "text-red-600 border-red-600";
      case "planned":
        return "text-yellow-600 border-yellow-600";
      default:
        return "text-primary border-blue-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with health ring + summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="border-border/60 bg-card/95 overflow-hidden rounded-2xl border shadow-sm"
      >
        <div className="border-border/40 flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
            <Package className="h-5 w-5 text-emerald-600" />
            Dependencies Overview
          </h2>
          <span className="text-muted-foreground text-[11px]">
            {dependencyAnalysis?.scanMetadata?.scanDate
              ? new Date(
                  dependencyAnalysis.scanMetadata.scanDate
                ).toLocaleString()
              : ""}
          </span>
        </div>
        <div className="flex flex-col items-center gap-6 px-5 py-6 sm:flex-row sm:items-start">
          {/* Health ring */}
          <AnimatedScoreRing
            score={healthScore}
            size={88}
            strokeWidth={7}
            label="Health"
          />
          {/* Stats grid */}
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: Package,
                label: "Packages",
                value: summary.totalPackages,
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-950/20",
              },
              {
                icon: AlertTriangle,
                label: "Vulnerable",
                value: summary.vulnerablePackages,
                color:
                  summary.vulnerablePackages > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400",
                bg:
                  summary.vulnerablePackages > 0
                    ? "bg-red-50 dark:bg-red-950/20"
                    : "bg-emerald-50 dark:bg-emerald-950/20",
              },
              {
                icon: Clock,
                label: "Outdated",
                value: summary.outdatedPackages,
                color:
                  summary.outdatedPackages > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400",
                bg:
                  summary.outdatedPackages > 0
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : "bg-emerald-50 dark:bg-emerald-950/20",
              },
              {
                icon: Shield,
                label: "Risk Score",
                value: summary.overallRiskScore,
                color: "text-purple-600 dark:text-purple-400",
                bg: "bg-purple-50 dark:bg-purple-950/20",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`border-border/40 flex items-center gap-2.5 rounded-xl border p-3 ${stat.bg}`}
              >
                <stat.icon className={`h-4 w-4 flex-shrink-0 ${stat.color}`} />
                <div>
                  <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                    {stat.label}
                  </p>
                  <p
                    className={`text-lg leading-tight font-bold tabular-nums ${stat.color}`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Vulnerabilities Section */}
      {vulnerabilities.length === 0 ? (
        <Card className="border-emerald-200/60 dark:border-emerald-800/40">
          <CardContent className="flex items-center gap-4 p-5">
            <CheckCircle2 className="h-8 w-8 flex-shrink-0 text-emerald-500" />
            <div>
              <h3 className="text-foreground font-semibold">
                No Known Vulnerabilities
              </h3>
              <p className="text-muted-foreground text-sm">
                All dependencies passed the vulnerability check. Keep them
                updated and enable automated scanning in CI.
              </p>
            </div>
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
              {(showAllVulnerabilities
                ? vulnerabilities
                : vulnerabilities.slice(0, INITIAL_DISPLAY_COUNT)
              ).map((vuln, index) => (
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
                        <span className="dark:text-muted-foreground font-mono text-sm text-gray-600">
                          {vuln.vulnerability.id}
                        </span>
                      </div>
                      <h4 className="text-foreground mb-1 font-semibold dark:text-white">
                        {vuln.vulnerability.title}
                      </h4>
                      <p className="dark:text-muted-foreground mb-2 text-sm text-gray-600">
                        {vuln.vulnerability.description}
                      </p>
                      <div className="text-muted-foreground dark:text-muted-foreground flex items-center gap-4 text-xs">
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
              {vulnerabilities.length > INITIAL_DISPLAY_COUNT && (
                <button
                  onClick={() =>
                    setShowAllVulnerabilities(!showAllVulnerabilities)
                  }
                  className="mx-auto flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  {showAllVulnerabilities ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show all {vulnerabilities.length} vulnerabilities
                    </>
                  )}
                </button>
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
                      <h4 className="text-foreground mt-1 font-semibold dark:text-white">
                        {issue.package}: {issue.license}
                      </h4>
                      <p className="dark:text-muted-foreground text-sm text-gray-600">
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
              <Clock className="text-primary h-5 w-5" />
              Outdated Packages ({outdatedPackages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(showAllOutdated
                ? outdatedPackages
                : outdatedPackages.slice(0, INITIAL_DISPLAY_COUNT)
              ).map((pkg, index) => (
                <div
                  key={`outdated-${pkg.package}-${pkg.currentVersion}-${index}`}
                  className="bg-muted rounded-lg border p-4 dark:bg-blue-950/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-foreground font-semibold dark:text-white">
                        {pkg.package}
                      </h4>
                      <p className="dark:text-muted-foreground text-sm text-gray-600">
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
                          <span className="text-muted-foreground text-xs">
                            {pkg.majorVersionsBehind} major versions behind
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {outdatedPackages.length > INITIAL_DISPLAY_COUNT && (
                <button
                  onClick={() => setShowAllOutdated(!showAllOutdated)}
                  className="text-primary border-border hover:bg-muted mx-auto flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                >
                  {showAllOutdated ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show all {outdatedPackages.length} outdated packages
                    </>
                  )}
                </button>
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
                      <h4 className="text-foreground mb-1 font-semibold dark:text-white">
                        {rec.title}
                      </h4>
                      <p className="text-foreground dark:text-muted-foreground mb-2 text-sm">
                        {rec.description}
                      </p>
                      <p className="text-foreground dark:text-muted-foreground mb-2 text-sm font-medium">
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
                  <h4 className="text-foreground mb-1 font-semibold dark:text-white">
                    {risk.package}
                  </h4>
                  <p className="dark:text-muted-foreground mb-2 text-sm text-gray-600">
                    {risk.description}
                  </p>
                  <p className="text-foreground dark:text-muted-foreground text-sm font-medium">
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
