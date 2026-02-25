import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star,
} from "lucide-react";
import { SecurityIssue } from "@/hooks/useAnalysis";
import { toast } from "sonner";

interface SecretDetectionCardProps {
  secretIssues: SecurityIssue[];
}

export const SecretDetectionCard: React.FC<SecretDetectionCardProps> = ({
  secretIssues,
}) => {
  const [expandedSecrets, setExpandedSecrets] = useState<Set<string>>(
    new Set()
  );

  if (secretIssues.length === 0) {
    return null;
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-xs font-medium";
      case "high":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-xs font-medium";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-xs font-medium";
      case "low":
        return "bg-muted/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-medium";
      default:
        return "bg-muted-foreground/10 text-muted-foreground border border-gray-500/20 px-2 py-1 rounded text-xs font-medium";
    }
  };

  const getConfidenceBadge = (_confidence: number) => {
    return "bg-muted/10 text-primary border border-primary/20 px-2 py-1 rounded text-xs font-medium";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleSecretExpansion = (secretId: string) => {
    const newExpanded = new Set(expandedSecrets);
    if (newExpanded.has(secretId)) {
      newExpanded.delete(secretId);
    } else {
      newExpanded.add(secretId);
    }
    setExpandedSecrets(newExpanded);
  };

  return (
    <div className="border-border/50 bg-card/50 rounded-lg border">
      {}
      <div className="border-border/50 border-b p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground mb-2 text-xl font-semibold">
              Secret Detection ({secretIssues.length})
            </h2>
            <p className="text-muted-foreground text-sm">
              Comprehensive security analysis with pattern matching and ML
              classifiers
            </p>
          </div>
          <ChevronDown className="text-muted-foreground h-5 w-5" />
        </div>
      </div>

      {}
      <div className="space-y-4 p-6">
        {secretIssues.map((secret) => {
          const isExpanded = expandedSecrets.has(secret.id);

          return (
            <div
              key={secret.id}
              className="border-border/50 bg-muted/50 rounded-lg border"
            >
              {}
              <div
                className="hover:bg-muted/70 cursor-pointer p-4 transition-colors"
                onClick={() => toggleSecretExpansion(secret.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className={getSeverityBadge(secret.severity)}>
                        {secret.severity}
                      </span>
                      <span className={getConfidenceBadge(secret.confidence)}>
                        {secret.confidence}% confidence
                      </span>
                      <span className="text-primary text-sm">
                        Secret Detection
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                  )}
                </div>

                <h3 className="text-foreground mt-2 mb-1 font-medium">
                  {secret.message}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {secret.filename}:{secret.line} •{" "}
                  {secret.type.replace("_", " ")}
                </p>
              </div>

              {}
              {isExpanded && (
                <div className="border-border/50 border-t p-4">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {}
                    <div>
                      <h4 className="text-foreground mb-3 font-medium">
                        Issue Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CWE:</span>
                          <span className="text-foreground">
                            {secret.cweId || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Risk:</span>
                          <span className="text-foreground">
                            {secret.severity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Impact:</span>
                          <span className="text-foreground">
                            {secret.impact || "Unknown"}
                          </span>
                        </div>
                        {secret.cvssScore && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              CVSS Score:
                            </span>
                            <span className="text-foreground">
                              {secret.cvssScore.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {}
                    <div>
                      <h4 className="text-foreground mb-3 font-medium">
                        Remediation
                      </h4>
                      <p className="text-muted-foreground mb-3 text-sm">
                        {secret.recommendation ||
                          secret.remediation?.description ||
                          "No remediation information available"}
                      </p>
                      {secret.remediation && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            Effort:
                          </span>
                          <span className="text-sm text-yellow-400">
                            {secret.remediation.effort}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            Priority:
                          </span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (secret.remediation?.priority || 0)
                                    ? "fill-current text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {}
                  {secret.codeSnippet && (
                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium text-red-400">
                          Vulnerable Code
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(secret.codeSnippet || "")
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="border-border/50 bg-card/50 rounded border p-3">
                        <code className="font-mono text-sm break-all text-red-400">
                          {secret.codeSnippet}
                        </code>
                      </div>
                    </div>
                  )}

                  {}
                  {secret.remediation.fixExample && (
                    <div className="mt-4">
                      <h4 className="mb-3 font-medium text-green-400">
                        Fixed Code
                      </h4>
                      <div className="border-border/50 bg-card/50 rounded border p-3">
                        <code className="font-mono text-sm break-all text-green-400">
                          {secret.remediation.fixExample}
                        </code>
                      </div>
                    </div>
                  )}

                  {}
                  {secret.references && secret.references.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-foreground mb-3 font-medium">
                        References
                      </h4>
                      <div className="space-y-2">
                        {secret.references.map((ref, index) => (
                          <a
                            key={index}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-2 text-sm hover:text-teal-300"
                          >
                            {ref}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
