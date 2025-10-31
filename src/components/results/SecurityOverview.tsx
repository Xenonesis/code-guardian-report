import React, { useState } from 'react';
import { Shield, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityIssueItem } from '@/components/security/SecurityIssueItem';
import { SecretDetectionCard } from '@/components/security/SecretDetectionCard';
import { SecureCodeSearchCard } from '@/components/security/SecureCodeSearchCard';
import { CodeProvenanceCard } from '@/components/security/CodeProvenanceCard';
import { ModernSecurityDashboard } from '@/components/security/ModernSecurityDashboard';
import { LanguageDetectionSummary } from '../language/LanguageDetectionSummary';
import { PDFDownloadButton } from '../export/PDFDownloadButton';
import { FixSuggestion } from '@/services/ai/aiFixSuggestionsService';
import { modernCodeScanningService } from '@/services/security/modernCodeScanningService';
import { toast } from 'sonner';

interface SecurityOverviewProps {
  results: AnalysisResults;
  isLoading?: boolean;
}

export const SecurityOverview: React.FC<SecurityOverviewProps> = ({ results, isLoading }) => {
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
      link.remove();
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

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 sm:px-0" role="status" aria-live="polite">
        <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-900/10 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-64 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-80 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-20 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Language Detection Summary */}
      {results.languageDetection && (
        <LanguageDetectionSummary
          detectionResult={results.languageDetection}
          className="mb-6"
        />
      )}

      {/* Modern Code Quality Dashboard - SonarQube-style metrics */}
      {(() => {
        // Calculate aggregate modern metrics from all files
        let totalMetrics = {
          cyclomaticComplexity: 0,
          cognitiveComplexity: 0,
          linesOfCode: 0,
          commentLines: 0,
          blankLines: 0,
          maintainabilityIndex: 0,
          technicalDebtRatio: 0,
          codeSmells: 0,
          bugs: 0,
          vulnerabilities: 0,
          securityHotspots: 0,
          estimatedTestCoverage: 0,
          duplicatedBlocks: 0,
          duplicatedLines: 0,
        };
        let totalDebt = 0;
        let fileCount = 0;

        // Analyze each file to get modern metrics
        const zipFiles = results.zipAnalysis?.files || [];
        for (const file of zipFiles) {
          try {
            const analysis = modernCodeScanningService.analyzeCode(
              file.content,
              file.name,
              file.language || 'javascript'
            );
            
            totalMetrics.cyclomaticComplexity += analysis.metrics.cyclomaticComplexity;
            totalMetrics.cognitiveComplexity += analysis.metrics.cognitiveComplexity;
            totalMetrics.linesOfCode += analysis.metrics.linesOfCode;
            totalMetrics.commentLines += analysis.metrics.commentLines;
            totalMetrics.blankLines += analysis.metrics.blankLines;
            totalMetrics.maintainabilityIndex += analysis.metrics.maintainabilityIndex;
            totalMetrics.codeSmells += analysis.metrics.codeSmells;
            totalMetrics.bugs += analysis.metrics.bugs;
            totalMetrics.vulnerabilities += analysis.metrics.vulnerabilities;
            totalMetrics.securityHotspots += analysis.metrics.securityHotspots;
            totalMetrics.duplicatedBlocks += analysis.metrics.duplicatedBlocks;
            totalMetrics.duplicatedLines += analysis.metrics.duplicatedLines;
            
            totalDebt += analysis.technicalDebt;
            fileCount++;
          } catch (error) {
            console.warn(`Failed to analyze ${file.name} for modern metrics:`, error);
          }
        }

        // Average maintainability index across files
        if (fileCount > 0) {
          totalMetrics.maintainabilityIndex = totalMetrics.maintainabilityIndex / fileCount;
          totalMetrics.technicalDebtRatio = totalMetrics.linesOfCode > 0
            ? (totalDebt / (totalMetrics.linesOfCode * 0.06)) * 100
            : 0;
        }

        // Create quality gate based on aggregated metrics
        const qualityGate = {
          passed: totalMetrics.vulnerabilities === 0 &&
                  totalMetrics.bugs <= 5 &&
                  totalMetrics.maintainabilityIndex >= 65,
          conditions: [
            {
              metric: 'New Vulnerabilities',
              status: (totalMetrics.vulnerabilities === 0 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
              value: totalMetrics.vulnerabilities,
              threshold: 0
            },
            {
              metric: 'New Bugs',
              status: (totalMetrics.bugs <= 5 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
              value: totalMetrics.bugs,
              threshold: 5
            },
            {
              metric: 'Maintainability Index',
              status: (totalMetrics.maintainabilityIndex >= 65 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
              value: Math.round(totalMetrics.maintainabilityIndex),
              threshold: 65
            },
            {
              metric: 'Technical Debt Ratio',
              status: (totalMetrics.technicalDebtRatio <= 5 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
              value: Number(totalMetrics.technicalDebtRatio.toFixed(1)),
              threshold: 5
            },
            {
              metric: 'Code Smells',
              status: (totalMetrics.codeSmells <= 10 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
              value: totalMetrics.codeSmells,
              threshold: 10
            },
            {
              metric: 'Duplicated Lines Density',
              status: ((totalMetrics.duplicatedLines / Math.max(totalMetrics.linesOfCode, 1) * 100) <= 3 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
              value: Number(((totalMetrics.duplicatedLines / Math.max(totalMetrics.linesOfCode, 1)) * 100).toFixed(1)),
              threshold: 3
            }
          ]
        };

        return fileCount > 0 ? (
          <ModernSecurityDashboard
            metrics={totalMetrics}
            technicalDebt={totalDebt}
            qualityGate={qualityGate}
            totalIssues={results.issues?.length || 0}
          />
        ) : null;
      })()}

      {/* PDF Download Section */}
      <div className="flex justify-end mb-4">
        <PDFDownloadButton 
          results={results} 
          variant="default"
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
        />
      </div>

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