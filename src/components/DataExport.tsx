import React, { useState, useCallback, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, Code, Image, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export interface ExportData {
  issues: Array<{
    id: string;
    severity: string;
    type: string;
    file: string;
    line: number;
    description: string;
    recommendation?: string;
    codeSnippet?: string;
  }>;
  summary: {
    totalIssues: number;
    totalFiles: number;
    analysisTime: string;
    timestamp: string;
  };
  metadata: {
    projectName?: string;
    version?: string;
    tools: string[];
  };
}

interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'html' | 'xml';
  includeCodeSnippets: boolean;
  includeRecommendations: boolean;
  includeSummary: boolean;
  filterBySeverity: string[];
  groupByFile: boolean;
}

interface DataExportProps {
  data: ExportData;
  className?: string;
}

const DataExport: React.FC<DataExportProps> = ({ data, className = '' }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastExport, setLastExport] = useState<{ format: string; timestamp: Date } | null>(null);

  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeCodeSnippets: true,
    includeRecommendations: true,
    includeSummary: true,
    filterBySeverity: [],
    groupByFile: false,
  });

  const exportFormats = useMemo(() => [
    {
      value: 'json',
      label: 'JSON',
      description: 'Machine-readable format for APIs',
      icon: <Code className="h-4 w-4" />,
      mimeType: 'application/json',
      extension: 'json',
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Spreadsheet-compatible format',
      icon: <FileSpreadsheet className="h-4 w-4" />,
      mimeType: 'text/csv',
      extension: 'csv',
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Professional report format',
      icon: <FileText className="h-4 w-4" />,
      mimeType: 'application/pdf',
      extension: 'pdf',
    },
    {
      value: 'html',
      label: 'HTML',
      description: 'Web-viewable report',
      icon: <Image className="h-4 w-4" />,
      mimeType: 'text/html',
      extension: 'html',
    },
    {
      value: 'xml',
      label: 'XML',
      description: 'Structured markup format',
      icon: <Code className="h-4 w-4" />,
      mimeType: 'application/xml',
      extension: 'xml',
    },
  ], []);

  const severityOptions = ['Critical', 'High', 'Medium', 'Low'];

  const updateOption = useCallback(<K extends keyof ExportOptions>(
    key: K,
    value: ExportOptions[K]
  ) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSeverityToggle = useCallback((severity: string) => {
    const current = options.filterBySeverity;
    const updated = current.includes(severity)
      ? current.filter(s => s !== severity)
      : [...current, severity];
    updateOption('filterBySeverity', updated);
  }, [options.filterBySeverity, updateOption]);

  const filterData = useCallback((data: ExportData): ExportData => {
    let filteredIssues = data.issues;

    // Filter by severity if specified
    if (options.filterBySeverity.length > 0) {
      filteredIssues = filteredIssues.filter(issue =>
        options.filterBySeverity.includes(issue.severity)
      );
    }

    // Remove code snippets if not included
    if (!options.includeCodeSnippets) {
      filteredIssues = filteredIssues.map(issue => ({
        ...issue,
        codeSnippet: undefined,
      }));
    }

    // Remove recommendations if not included
    if (!options.includeRecommendations) {
      filteredIssues = filteredIssues.map(issue => ({
        ...issue,
        recommendation: undefined,
      }));
    }

    return {
      ...data,
      issues: filteredIssues,
      summary: options.includeSummary ? data.summary : undefined,
    };
  }, [options]);

  const generateFileName = useCallback((format: string): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    const projectName = data.metadata.projectName || 'code-analysis';
    return `${projectName}-report-${timestamp}.${format}`;
  }, [data.metadata.projectName]);

  const exportAsJSON = useCallback((data: ExportData): string => {
    return JSON.stringify(data, null, 2);
  }, []);

  const exportAsCSV = useCallback((data: ExportData): string => {
    const headers = [
      'File',
      'Line',
      'Severity',
      'Type',
      'Description',
      ...(options.includeRecommendations ? ['Recommendation'] : []),
      ...(options.includeCodeSnippets ? ['Code Snippet'] : []),
    ];

    const rows = data.issues.map(issue => [
      issue.file,
      issue.line.toString(),
      issue.severity,
      issue.type,
      `"${issue.description.replace(/"/g, '""')}"`,
      ...(options.includeRecommendations ? [`"${(issue.recommendation || '').replace(/"/g, '""')}"`] : []),
      ...(options.includeCodeSnippets ? [`"${(issue.codeSnippet || '').replace(/"/g, '""')}"`] : []),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }, [options.includeRecommendations, options.includeCodeSnippets]);

  const exportAsHTML = useCallback((data: ExportData): string => {
    const groupedIssues = options.groupByFile
      ? data.issues.reduce((acc, issue) => {
          if (!acc[issue.file]) acc[issue.file] = [];
          acc[issue.file].push(issue);
          return acc;
        }, {} as Record<string, typeof data.issues>)
      : { 'All Issues': data.issues };

    const getSeverityClass = (severity: string) => {
      switch (severity.toLowerCase()) {
        case 'critical': return 'color: #dc2626; font-weight: bold;';
        case 'high': return 'color: #ea580c; font-weight: bold;';
        case 'medium': return 'color: #d97706;';
        case 'low': return 'color: #65a30d;';
        default: return 'color: #6b7280;';
      }
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .file-group { margin-bottom: 30px; }
        .file-title { font-size: 1.2em; font-weight: bold; color: #374151; margin-bottom: 15px; }
        .issue { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 10px; }
        .issue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .severity { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .code-snippet { background: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; margin-top: 10px; }
        .recommendation { background: #ecfdf5; border-left: 4px solid #10b981; padding: 10px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Code Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    
    ${options.includeSummary ? `
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Issues:</strong> ${data.summary.totalIssues}</p>
        <p><strong>Files Analyzed:</strong> ${data.summary.totalFiles}</p>
        <p><strong>Analysis Time:</strong> ${data.summary.analysisTime}</p>
    </div>
    ` : ''}
    
    ${Object.entries(groupedIssues).map(([fileName, issues]) => `
    <div class="file-group">
        ${options.groupByFile ? `<h2 class="file-title">${fileName}</h2>` : ''}
        ${issues.map(issue => `
        <div class="issue">
            <div class="issue-header">
                <span style="${getSeverityClass(issue.severity)}">${issue.severity}</span>
                <span>${issue.type}</span>
                <span>Line ${issue.line}</span>
            </div>
            <p><strong>Description:</strong> ${issue.description}</p>
            ${options.includeRecommendations && issue.recommendation ? `
            <div class="recommendation">
                <strong>Recommendation:</strong> ${issue.recommendation}
            </div>
            ` : ''}
            ${options.includeCodeSnippets && issue.codeSnippet ? `
            <div class="code-snippet">
                <strong>Code:</strong><br>
                <pre>${issue.codeSnippet}</pre>
            </div>
            ` : ''}
        </div>
        `).join('')}
    </div>
    `).join('')}
</body>
</html>
    `.trim();
  }, [options.groupByFile, options.includeSummary, options.includeRecommendations, options.includeCodeSnippets]);

  const exportAsXML = useCallback((data: ExportData): string => {
    const escapeXml = (str: string) => {
      return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case "'": return '&apos;';
          case '"': return '&quot;';
          default: return c;
        }
      });
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
<codeAnalysisReport>
    <metadata>
        <timestamp>${new Date().toISOString()}</timestamp>
        <projectName>${escapeXml(data.metadata.projectName || 'Unknown')}</projectName>
        <tools>${data.metadata.tools.map(tool => `<tool>${escapeXml(tool)}</tool>`).join('')}</tools>
    </metadata>
    ${options.includeSummary ? `
    <summary>
        <totalIssues>${data.summary.totalIssues}</totalIssues>
        <totalFiles>${data.summary.totalFiles}</totalFiles>
        <analysisTime>${escapeXml(data.summary.analysisTime)}</analysisTime>
    </summary>
    ` : ''}
    <issues>
        ${data.issues.map(issue => `
        <issue id="${escapeXml(issue.id)}">
            <file>${escapeXml(issue.file)}</file>
            <line>${issue.line}</line>
            <severity>${escapeXml(issue.severity)}</severity>
            <type>${escapeXml(issue.type)}</type>
            <description>${escapeXml(issue.description)}</description>
            ${options.includeRecommendations && issue.recommendation ? `<recommendation>${escapeXml(issue.recommendation)}</recommendation>` : ''}
            ${options.includeCodeSnippets && issue.codeSnippet ? `<codeSnippet><![CDATA[${issue.codeSnippet}]]></codeSnippet>` : ''}
        </issue>
        `).join('')}
    </issues>
</codeAnalysisReport>`;
  }, [options.includeSummary, options.includeRecommendations, options.includeCodeSnippets]);

  const downloadFile = useCallback((content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const filteredData = filterData(data);
      const format = exportFormats.find(f => f.value === options.format)!;
      let content: string;

      switch (options.format) {
        case 'json':
          content = exportAsJSON(filteredData);
          break;
        case 'csv':
          content = exportAsCSV(filteredData);
          break;
        case 'html':
          content = exportAsHTML(filteredData);
          break;
        case 'xml':
          content = exportAsXML(filteredData);
          break;
        default:
          throw new Error(`Unsupported format: ${options.format}`);
      }

      clearInterval(progressInterval);
      setExportProgress(100);

      const fileName = generateFileName(format.extension);
      downloadFile(content, fileName, format.mimeType);

      setLastExport({ format: format.label, timestamp: new Date() });
      toast.success(`Export Complete - Report exported as ${fileName}`);

    } catch (error) {
      toast.error(`Export Failed - ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  }, [data, options, filterData, exportFormats, exportAsJSON, exportAsCSV, exportAsHTML, exportAsXML, generateFileName, downloadFile]);

  const selectedFormat = exportFormats.find(f => f.value === options.format)!;
  const filteredIssueCount = filterData(data).issues.length;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Analysis Results
        </CardTitle>
        <CardDescription>
          Export your code analysis results in various formats for reporting and integration.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Export Format
          </label>
          <Select value={options.format} onValueChange={(value: string) => updateOption('format', value as ExportOptions['format'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {exportFormats.map(format => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex items-center gap-2">
                    {format.icon}
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-slate-500">{format.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Export Options</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-summary"
                checked={options.includeSummary}
                onCheckedChange={(checked) => updateOption('includeSummary', Boolean(checked))}
              />
              <label htmlFor="include-summary" className="text-sm font-medium cursor-pointer">
                Include summary
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-recommendations"
                checked={options.includeRecommendations}
                onCheckedChange={(checked) => updateOption('includeRecommendations', Boolean(checked))}
              />
              <label htmlFor="include-recommendations" className="text-sm font-medium cursor-pointer">
                Include recommendations
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-code-snippets"
                checked={options.includeCodeSnippets}
                onCheckedChange={(checked) => updateOption('includeCodeSnippets', Boolean(checked))}
              />
              <label htmlFor="include-code-snippets" className="text-sm font-medium cursor-pointer">
                Include code snippets
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="group-by-file"
                checked={options.groupByFile}
                onCheckedChange={(checked) => updateOption('groupByFile', Boolean(checked))}
                disabled={options.format === 'csv'}
              />
              <label htmlFor="group-by-file" className="text-sm font-medium cursor-pointer">
                Group by file
              </label>
            </div>
          </div>
        </div>

        {/* Severity Filter */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Filter by Severity (optional)
          </h4>
          <div className="flex flex-wrap gap-2">
            {severityOptions.map(severity => (
              <Badge
                key={severity}
                variant={options.filterBySeverity.includes(severity) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleSeverityToggle(severity)}
              >
                {severity}
              </Badge>
            ))}
          </div>
          {options.filterBySeverity.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              {filteredIssueCount} of {data.issues.length} issues will be exported
            </p>
          )}
        </div>

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {/* Last Export Info */}
        {lastExport && !isExporting && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>
              Last exported as {lastExport.format} on {lastExport.timestamp.toLocaleString()}
            </span>
          </div>
        )}

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || data.issues.length === 0}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export as {selectedFormat.label}
            </>
          )}
        </Button>

        {data.issues.length === 0 && (
          <p className="text-sm text-slate-500 text-center">
            No analysis results available to export.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataExport;
