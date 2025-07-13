import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecuritySummaryCards } from '@/components/security/SecuritySummaryCards';
import { SecurityIssueItem } from '@/components/security/SecurityIssueItem';
import { SecretDetectionCard } from '@/components/security/SecretDetectionCard';
import { LanguageDetectionSummary } from '@/components/LanguageDetectionSummary';

interface SecurityOverviewProps {
  results: AnalysisResults;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ results }) => {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const toggleIssueExpansion = (issueId: string) => {
    const newExpanded = new Set(expandedIssues);
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId);
    } else {
      newExpanded.add(issueId);
    }
    setExpandedIssues(newExpanded);
  };

  // Separate secret detection issues from other security issues
  const secretIssues = results.issues.filter(issue => issue.category === 'Secret Detection' || issue.type === 'Secret');
  const otherIssues = results.issues.filter(issue => issue.category !== 'Secret Detection' && issue.type !== 'Secret');

  return (
    <div className="space-y-6">
      {/* Language Detection Summary */}
      {results.languageDetection && (
        <LanguageDetectionSummary
          detectionResult={results.languageDetection}
          className="mb-6"
        />
      )}

      <SecuritySummaryCards results={results} />

      {/* Secret Detection Section */}
      <SecretDetectionCard secretIssues={secretIssues} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Other Security Issues ({otherIssues.length})
          </CardTitle>
          <CardDescription>
            Comprehensive security analysis with OWASP classifications and CVSS scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {otherIssues.map((issue) => (
              <SecurityIssueItem
                key={issue.id}
                issue={issue}
                isExpanded={expandedIssues.has(issue.id)}
                onToggle={() => toggleIssueExpansion(issue.id)}
              />
            ))}
            {otherIssues.length === 0 && (
              <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                No other security issues detected.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};