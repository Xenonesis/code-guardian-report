import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecuritySummaryCards } from '@/components/security/SecuritySummaryCards';
import { SecurityIssueItem } from '@/components/security/SecurityIssueItem';

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

  return (
    <div className="space-y-6">
      <SecuritySummaryCards results={results} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Issues ({results.issues.length})
          </CardTitle>
          <CardDescription>
            Comprehensive security analysis with OWASP classifications and CVSS scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.issues.map((issue) => (
              <SecurityIssueItem
                key={issue.id}
                issue={issue}
                isExpanded={expandedIssues.has(issue.id)}
                onToggle={() => toggleIssueExpansion(issue.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};