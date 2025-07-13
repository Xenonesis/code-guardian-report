import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Copy,
  Shield,
  AlertTriangle,
  Key,
  Database,
  Cloud,
  Github,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star
} from 'lucide-react';
import { SecurityIssue } from '@/hooks/useAnalysis';
import { toast } from 'sonner';

interface SecretDetectionCardProps {
  secretIssues: SecurityIssue[];
}

export const SecretDetectionCard: React.FC<SecretDetectionCardProps> = ({ secretIssues }) => {
  const [expandedSecrets, setExpandedSecrets] = useState<Set<string>>(new Set());

  if (secretIssues.length === 0) {
    return null; // Don't show anything if no secrets found
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-xs font-medium';
      case 'high':
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-xs font-medium';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded text-xs font-medium';
      case 'low':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs font-medium';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-1 rounded text-xs font-medium';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs font-medium';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Secret Detection ({secretIssues.length})
            </h2>
            <p className="text-slate-400 text-sm">
              Comprehensive security analysis with pattern matching and ML classifiers
            </p>
          </div>
          <ChevronDown className="h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* Secret List */}
      <div className="p-6 space-y-4">
        {secretIssues.map((secret) => {
          const isExpanded = expandedSecrets.has(secret.id);

          return (
            <div key={secret.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg">
              {/* Secret Header */}
              <div
                className="p-4 cursor-pointer hover:bg-slate-800/70 transition-colors"
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
                      <span className="text-blue-400 text-sm">Secret Detection</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                <h3 className="text-white font-medium mt-2 mb-1">
                  {secret.message}
                </h3>
                <p className="text-slate-400 text-sm">
                  {secret.filename}:{secret.line} • {secret.type.replace('_', ' ')}
                </p>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-700/50 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Issue Details */}
                    <div>
                      <h4 className="text-white font-medium mb-3">Issue Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">CWE:</span>
                          <span className="text-white">{secret.cweId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Risk:</span>
                          <span className="text-white">{secret.severity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Impact:</span>
                          <span className="text-white">{secret.impact || 'Unknown'}</span>
                        </div>
                        {secret.cvssScore && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">CVSS Score:</span>
                            <span className="text-white">{secret.cvssScore.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Remediation */}
                    <div>
                      <h4 className="text-white font-medium mb-3">Remediation</h4>
                      <p className="text-slate-400 text-sm mb-3">
                        {secret.recommendation || secret.remediation?.description || 'No remediation information available'}
                      </p>
                      {secret.remediation && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-sm">Effort:</span>
                          <span className="text-yellow-400 text-sm">{secret.remediation.effort}</span>
                          <span className="text-slate-400 text-sm">Priority:</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (secret.remediation?.priority || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vulnerable Code */}
                  {secret.codeSnippet && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-red-400 font-medium">Vulnerable Code</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(secret.codeSnippet || '')}
                          className="text-slate-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                        <code className="text-red-400 text-sm font-mono break-all">
                          {secret.codeSnippet}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Fixed Code */}
                  {secret.remediation.fixExample && (
                    <div className="mt-4">
                      <h4 className="text-green-400 font-medium mb-3">Fixed Code</h4>
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded p-3">
                        <code className="text-green-400 text-sm font-mono break-all">
                          {secret.remediation.fixExample}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* References */}
                  {secret.references && secret.references.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-3">References</h4>
                      <div className="space-y-2">
                        {secret.references.map((ref, index) => (
                          <a
                            key={index}
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
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
