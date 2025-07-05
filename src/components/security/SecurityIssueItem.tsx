import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  Star 
} from 'lucide-react';
import { SecurityIssue } from '@/hooks/useAnalysis';
import { toast } from 'sonner';

interface SecurityIssueItemProps {
  issue: SecurityIssue;
  isExpanded: boolean;
  onToggle: () => void;
}

export const SecurityIssueItem: React.FC<SecurityIssueItemProps> = ({ 
  issue, 
  isExpanded, 
  onToggle 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300';
      case 'High': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical': return 'text-purple-600 dark:text-purple-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCVSSColor = (score: number) => {
    if (score >= 9.0) return 'text-purple-600 dark:text-purple-400';
    if (score >= 7.0) return 'text-red-600 dark:text-red-400';
    if (score >= 4.0) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getSeverityColor(issue.severity)}>
                {issue.severity}
              </Badge>
              {issue.cvssScore && (
                <Badge variant="outline" className={getCVSSColor(issue.cvssScore)}>
                  CVSS {issue.cvssScore.toFixed(1)}
                </Badge>
              )}
              {issue.confidence && (
                <Badge variant="outline" className={getConfidenceColor(issue.confidence)}>
                  {issue.confidence}% confidence
                </Badge>
              )}
              <Badge variant="outline">{issue.tool}</Badge>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              {issue.message}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {issue.filename}:{issue.line}
              {issue.category && ` • ${issue.category}`}
            </p>
          </div>
          <div className="ml-4">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-slate-50 dark:bg-slate-800/50 p-4 space-y-4">
          {/* Issue Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Issue Details</h4>
              <div className="space-y-2 text-sm">
                {issue.cweId && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">CWE:</span>
                    <a 
                      href={`https://cwe.mitre.org/data/definitions/${issue.cweId.replace('CWE-', '')}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {issue.cweId}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {issue.owaspCategory && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">OWASP:</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {issue.owaspCategory}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Risk:</span>
                  <span className={getRiskColor(issue.riskRating)}>
                    {issue.riskRating}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Impact:</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {issue.impact}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Remediation</h4>
              <div className="space-y-2 text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  {issue.remediation.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Effort:</span>
                  <Badge variant="outline" size="sm">
                    {issue.remediation.effort}
                  </Badge>
                  <span className="font-medium">Priority:</span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < issue.remediation.priority
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          {(issue.codeSnippet || issue.remediation.codeExample) && (
            <div className="space-y-4">
              {issue.remediation.codeExample && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-600">Vulnerable Code</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(issue.remediation.codeExample!, 'Vulnerable code')}
                    >
                      {copiedCode === 'Vulnerable code' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-red-50 dark:bg-red-950/20 p-3 rounded border text-sm overflow-x-auto">
                    <code>{issue.remediation.codeExample}</code>
                  </pre>
                </div>
              )}

              {issue.remediation.fixExample && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-600">Fixed Code</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(issue.remediation.fixExample!, 'Fixed code')}
                    >
                      {copiedCode === 'Fixed code' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-green-50 dark:bg-green-950/20 p-3 rounded border text-sm overflow-x-auto">
                    <code>{issue.remediation.fixExample}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* References */}
          {issue.references && issue.references.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">References</h4>
              <div className="space-y-1">
                {issue.references.map((ref, index) => (
                  <a
                    key={index}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
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
};