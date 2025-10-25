import { useMemo } from 'react';
import { SecurityIssue } from './useAnalysis';

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e'
} as const;

const TYPE_COLORS = {
  Security: '#dc2626',
  Bug: '#ea580c',
  'Code Smell': '#ca8a04',
  Vulnerability: '#b91c1c'
} as const;

export const useAnalyticsData = (issues: SecurityIssue[], totalFiles: number) => {
  const severityData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([severity, count]) => ({
      severity,
      count,
      percentage: ((count / issues.length) * 100).toFixed(1),
      fill: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
    }));
  }, [issues]);

  const typeData = useMemo(() => {
    const counts = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: ((count / issues.length) * 100).toFixed(1),
      fill: TYPE_COLORS[type as keyof typeof TYPE_COLORS]
    }));
  }, [issues]);

  const fileComplexityData = useMemo(() => {
    const fileStats = issues.reduce((acc, issue) => {
      const fileName = issue.filename.split('/').pop() || issue.filename;
      if (!acc[fileName]) {
        acc[fileName] = { 
          file: fileName, 
          issues: 0, 
          lines: new Set(), 
          severities: { Critical: 0, High: 0, Medium: 0, Low: 0 }
        };
      }
      acc[fileName].issues++;
      acc[fileName].lines.add(issue.line);
      acc[fileName].severities[issue.severity]++;
      return acc;
    }, {} as Record<string, {
      file: string;
      issues: number;
      lines: Set<number>;
      severities: { Critical: number; High: number; Medium: number; Low: number };
    }>);

    return Object.values(fileStats)
      .map((item) => ({
        file: item.file.length > 15 ? item.file.substring(0, 12) + '...' : item.file,
        fullFile: item.file,
        issues: item.issues,
        linesAffected: item.lines.size,
        complexity: Math.round((item.issues / item.lines.size) * 10) / 10,
        riskScore: (item.severities.Critical * 4 + item.severities.High * 3 + item.severities.Medium * 2 + item.severities.Low * 1)
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }, [issues]);

  const riskMetrics = useMemo(() => {
    const criticalIssues = issues.filter(i => i.severity === 'Critical').length;
    const securityIssues = issues.filter(i => i.type === 'Security').length;
    const vulnerabilities = issues.filter(i => i.type === 'Vulnerability').length;
    
    const overallRisk = Math.min(100, Math.round(
      (criticalIssues * 25 + securityIssues * 20 + vulnerabilities * 15 + issues.length * 2) / 10
    ));

    return {
      overallRisk,
      criticalIssues,
      securityIssues,
      vulnerabilities,
      codeQuality: Math.max(0, 100 - (issues.filter(i => i.type === 'Code Smell').length * 5)),
      maintainability: Math.max(0, 100 - Math.round((issues.length / totalFiles) * 10)),
      technicalDebt: Math.min(100, Math.round((issues.length / totalFiles) * 15))
    };
  }, [issues, totalFiles]);

  const performanceData = useMemo(() => [
    { metric: 'Code Quality', value: riskMetrics.codeQuality, target: 85 },
    { metric: 'Security', value: Math.max(0, 100 - (riskMetrics.securityIssues * 10)), target: 95 },
    { metric: 'Maintainability', value: riskMetrics.maintainability, target: 80 },
    { metric: 'Technical Debt', value: Math.max(0, 100 - riskMetrics.technicalDebt), target: 70 }
  ], [riskMetrics]);

  return {
    severityData,
    typeData,
    fileComplexityData,
    riskMetrics,
    performanceData
  };
};