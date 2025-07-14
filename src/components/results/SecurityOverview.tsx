import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecuritySummaryCards } from '@/components/security/SecuritySummaryCards';
import { SecurityIssueItem } from '@/components/security/SecurityIssueItem';
import { SecretDetectionCard } from '@/components/security/SecretDetectionCard';
import { SecureCodeSearchCard } from '@/components/security/SecureCodeSearchCard';
import { CodeProvenanceCard } from '@/components/security/CodeProvenanceCard';
import { LanguageDetectionSummary } from '@/components/LanguageDetectionSummary';
import { FixSuggestion } from '@/services/aiFixSuggestionsService';
import { toast } from 'sonner';

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

  const handleApplyFix = (suggestion: FixSuggestion) => {
    // For now, just show a toast with the fix information
    // In a real implementation, this would apply the fix to the actual code
    toast.success(`Fix suggestion "${suggestion.title}" would be applied`, {
      description: `This would apply ${suggestion.codeChanges.length} code changes with ${suggestion.confidence}% confidence.`
    });

    // TODO: Implement actual fix application logic
    console.log('Applying fix suggestion:', suggestion);
  };

  // Extract language and framework information from detection results
  const primaryLanguage = results.languageDetection?.primaryLanguage?.name || 'unknown';
  const primaryFramework = results.languageDetection?.frameworks?.[0]?.name;

  // Separate secret detection issues from other security issues
  const secretIssues = results.issues.filter(issue => issue.category === 'Secret Detection' || issue.type === 'Secret');
  const otherIssues = results.issues.filter(issue => issue.category !== 'Secret Detection' && issue.type !== 'Secret');

  // Prepare files for provenance monitoring (mock data for demo)
  const filesForProvenance = otherIssues.map(issue => ({
    filename: issue.filename,
    content: issue.codeSnippet || `// File: ${issue.filename}\n// Issue: ${issue.message}`
  }));

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

      {/* Secure Code Search Section */}
      <SecureCodeSearchCard
        language={primaryLanguage}
        framework={primaryFramework}
        vulnerabilityType={otherIssues.length > 0 ? otherIssues[0].type : undefined}
      />

      {/* Code Provenance & Integrity Monitoring Section */}
      <CodeProvenanceCard
        files={filesForProvenance}
        onInitializeMonitoring={() => {
          toast.success('File integrity monitoring initialized');
        }}
      />

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
                codeContext={issue.codeSnippet || `// Code context for ${issue.filename}:${issue.line}\n// ${issue.message}`}
                language={primaryLanguage}
                framework={primaryFramework}
                onApplyFix={handleApplyFix}
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