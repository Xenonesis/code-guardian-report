/**
 * Analysis History Modal Component
 * Shows analysis history with restore and management options
 */

import React from 'react';
import { 
  X, 
  FileText, 
  Clock, 
  RotateCcw, 
  Trash2, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { type StoredAnalysisData } from '@/services/analysisStorage';

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: {
    currentAnalysis: StoredAnalysisData | null;
    previousAnalyses: StoredAnalysisData[];
    maxHistorySize: number;
    totalStorageUsed: number;
  };
  onRestoreAnalysis: (analysis: StoredAnalysisData) => void;
  onDeleteAnalysis?: (analysisId: string) => void;
}

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onRestoreAnalysis,
  onDeleteAnalysis,
}) => {
  if (!isOpen) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getSeverityColor = (severity: 'Critical' | 'High' | 'Medium' | 'Low'): string => {
    switch (severity) {
      case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-950/30';
      case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-950/30';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30';
      case 'Low': return 'text-blue-600 bg-blue-100 dark:bg-blue-950/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-950/30';
    }
  };

  const getQualityIcon = (score: number): React.ReactNode => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const allAnalyses = [
    ...(history.currentAnalysis ? [{ ...history.currentAnalysis, isCurrent: true }] : []),
    ...history.previousAnalyses.map(a => ({ ...a, isCurrent: false }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] bg-white dark:bg-slate-800 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Analysis History
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {allAnalyses.length} analysis{allAnalyses.length !== 1 ? 'es' : ''} • {formatBytes(history.totalStorageUsed)} used
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          {allAnalyses.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No Analysis History</p>
              <p className="text-sm">Analyze some files to build your history.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allAnalyses.map((analysis) => {
                const criticalIssues = analysis.results.issues.filter(i => i.severity === 'Critical').length;
                const highIssues = analysis.results.issues.filter(i => i.severity === 'High').length;
                const totalIssues = analysis.results.issues.length;
                
                return (
                  <Card key={analysis.id} className={`relative transition-all duration-200 hover:shadow-md ${
                    analysis.isCurrent ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                            <h3 className="font-medium text-slate-900 dark:text-white truncate">
                              {analysis.fileName}
                            </h3>
                            {analysis.isCurrent && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600 ml-2">
                                Current
                              </Badge>
                            )}
                            {analysis.compressed && (
                              <Badge variant="outline" className="text-purple-600 border-purple-600">
                                Compressed
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Analyzed:</span>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {formatDate(analysis.timestamp)}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">File Size:</span>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {formatBytes(analysis.fileSize)}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Issues Found:</span>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {totalIssues}
                              </div>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Quality Score:</span>
                              <div className="flex items-center gap-1">
                                {getQualityIcon(analysis.results.summary.qualityScore)}
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {analysis.results.summary.qualityScore}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Issue Summary */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {criticalIssues > 0 && (
                              <Badge className={getSeverityColor('Critical')}>
                                {criticalIssues} Critical
                              </Badge>
                            )}
                            {highIssues > 0 && (
                              <Badge className={getSeverityColor('High')}>
                                {highIssues} High
                              </Badge>
                            )}
                            {totalIssues === 0 && (
                              <Badge className={getSeverityColor('Low')}>
                                No Issues Found
                              </Badge>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-4">
                              <span>Engine: {analysis.metadata.analysisEngine} v{analysis.metadata.engineVersion}</span>
                              <span>Session: {analysis.metadata.sessionId.slice(-8)}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(analysis.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                          {!analysis.isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRestoreAnalysis(analysis)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Restore
                            </Button>
                          )}
                          
                          {onDeleteAnalysis && !analysis.isCurrent && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeleteAnalysis(analysis.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t dark:border-slate-700 p-4">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              Showing {allAnalyses.length} of {history.maxHistorySize} maximum entries
            </span>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalysisHistoryModal;
