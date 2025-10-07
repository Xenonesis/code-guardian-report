import React, { useState } from 'react';
import { Shield, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecuritySummaryCards } from '@/components/security/SecuritySummaryCards';
import { SecurityIssueItem } from '@/components/security/SecurityIssueItem';
import { SecretDetectionCard } from '@/components/security/SecretDetectionCard';
import { SecureCodeSearchCard } from '@/components/security/SecureCodeSearchCard';
import { CodeProvenanceCard } from '@/components/security/CodeProvenanceCard';
import { LanguageDetectionSummary } from '../language/LanguageDetectionSummary';
import { PDFDownloadButton } from '../export/PDFDownloadButton';
import { FixSuggestion } from '@/services/ai/aiFixSuggestionsService';
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
    try {
      // Generate a patch file with the suggested changes
      const patchContent = suggestion.codeChanges.map((change) => {
        return `
========================================
File: ${change.filename}
Lines: ${change.startLine}-${change.endLine}
Type: ${change.type}
========================================

--- Original Code
${change.originalCode}

+++ Suggested Fix
${change.suggestedCode}

Reasoning: ${change.reasoning}
Confidence: ${suggestion.confidence}%
`;
      }).join('\n');

      const fullPatch = `# Security Fix Suggestion
# Title: ${suggestion.title}
# Description: ${suggestion.description}
# Confidence: ${suggestion.confidence}%
# Estimated Effort: ${suggestion.effort}
# Priority: ${suggestion.priority}

${patchContent}

# Security Benefit:
${suggestion.securityBenefit}

# Risk Assessment:
${suggestion.riskAssessment}

# Testing Recommendations:
${suggestion.testingRecommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

# How to Apply:
# 1. Review each change carefully
# 2. Manually apply the changes to your source files
# 3. Test thoroughly before committing
# 4. Run your security analysis again to verify the fix
`;

      // Create a downloadable patch file using browser APIs
      /* eslint-disable no-undef */
      const blob = new Blob([fullPatch], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-fix-${suggestion.issueId}-${Date.now()}.patch`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      /* eslint-enable no-undef */

      toast.success(`Downloaded fix patch: "${suggestion.title}"`, {
        description: `${suggestion.codeChanges.length} changes with ${suggestion.confidence}% confidence. Review and apply manually.`
      });
    } catch (err) {
      toast.error('Failed to generate fix patch', {
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    }
  };

  // Extract language and framework information from detection results
  const primaryLanguage = results.languageDetection?.primaryLanguage?.name || 'unknown';
  const primaryFramework = results.languageDetection?.frameworks?.[0]?.name;

  // Separate secret detection issues from other security issues
  const secretIssues = results.issues.filter(issue => issue.category === 'Secret Detection' || issue.type === 'Secret');
  const otherIssues = results.issues.filter(issue => issue.category !== 'Secret Detection' && issue.type !== 'Secret');

  // Prepare files for provenance monitoring
  const filesForProvenance = otherIssues.map(issue => ({
    filename: issue.filename,
    content: issue.codeSnippet || `// File: ${issue.filename}\n// Issue: ${issue.message}`
  }));

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Language Detection Summary */}
      {results.languageDetection && (
        <LanguageDetectionSummary
          detectionResult={results.languageDetection}
          className="mb-6"
        />
      )}

      {/* PDF Download Section */}
      <div className="flex justify-end mb-4">
        <PDFDownloadButton 
          results={results} 
          variant="default"
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        />
      </div>

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

      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Other Security Issues ({otherIssues.length})
              </h2>
              <p className="text-slate-400 text-sm">
                Comprehensive security analysis with OWASP classifications and CVSS scoring
              </p>
            </div>
            <ChevronDown className="h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Issues List */}
        <div className="p-6 space-y-4">
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
            <p className="text-slate-400 text-center py-4">
              No other security issues detected.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};