/**
 * Storage Status Component
 * Shows current storage status, analytics, and management options
 */

import React from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  History, 
  BarChart3,
  HardDrive,
  FileText,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { type StoredAnalysisData } from '@/services/analysisStorage';

interface StorageStatusProps {
  hasStoredData: boolean;
  storedAnalysis: StoredAnalysisData | null;
  storageStats: {
    currentSize: number;
    maxSize: number;
    usagePercentage: number;
    historyCount: number;
    compressionRatio?: number;
  };
  onClearData: () => void;
  onExportAnalysis: (format: 'json' | 'compressed') => void;
  onImportAnalysis: (data: string, compressed: boolean) => void;
  onOptimizeStorage: () => void;
  onShowHistory: () => void;
}

export const StorageStatus: React.FC<StorageStatusProps> = ({
  hasStoredData,
  storedAnalysis,
  storageStats,
  onClearData,
  onExportAnalysis,
  onImportAnalysis,
  onOptimizeStorage,
  onShowHistory,
}) => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getStorageStatusColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-600 dark:text-green-400';
    if (percentage < 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStorageStatusBadge = (percentage: number): React.ReactNode => {
    if (percentage < 50) return <Badge variant="outline" className="text-green-600 border-green-600">Good</Badge>;
    if (percentage < 80) return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Moderate</Badge>;
    return <Badge variant="outline" className="text-red-600 border-red-600">High</Badge>;
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const isCompressed = file.name.endsWith('.txt');
        try {
          onImportAnalysis(content, isCompressed);
        } catch (error) {
          alert('Failed to import analysis data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Database className="h-5 w-5 text-blue-600" />
          Analysis Storage Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Analysis Info */}
        {hasStoredData && storedAnalysis ? (
          <div className="space-y-4">
            <Alert className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold text-blue-900 dark:text-blue-100">
                    Stored Analysis Available
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
                    <div><strong>File:</strong> {storedAnalysis.fileName}</div>
                    <div><strong>Size:</strong> {formatBytes(storedAnalysis.fileSize)}</div>
                    <div><strong>Analyzed:</strong> {formatDate(storedAnalysis.timestamp)}</div>
                    <div><strong>Issues:</strong> {storedAnalysis.results.issues.length}</div>
                  </div>
                  {storedAnalysis.compressed && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      <Zap className="h-3 w-3 mr-1" />
                      Compressed
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <Alert className="border-l-4 border-l-gray-400 bg-gray-50 dark:bg-gray-950/20">
            <FileText className="h-4 w-4" />
            <AlertDescription className="text-gray-700 dark:text-gray-300">
              No analysis data currently stored. Upload and analyze a file to enable persistent storage.
            </AlertDescription>
          </Alert>
        )}

        {/* Storage Statistics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-slate-600" />
              <span className="font-medium">Storage Usage</span>
            </div>
            {getStorageStatusBadge(storageStats.usagePercentage)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {formatBytes(storageStats.currentSize)} / {formatBytes(storageStats.maxSize)}
              </span>
              <span className={`font-medium ${getStorageStatusColor(storageStats.usagePercentage)}`}>
                {storageStats.usagePercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={storageStats.usagePercentage} 
              className="h-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {storageStats.historyCount}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                History Items
              </div>
            </div>
            {storageStats.compressionRatio && (
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {(storageStats.compressionRatio * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Compression
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Export Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Export Analysis
              </label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportAnalysis('json')}
                  disabled={!hasStoredData}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExportAnalysis('compressed')}
                  disabled={!hasStoredData}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Compressed
                </Button>
              </div>
            </div>

            {/* Import Option */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Import Analysis
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleImportFile}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Import analysis data file"
                  title="Import analysis data file"
                />
                <Button variant="outline" size="sm" className="w-full">
                  <Upload className="h-4 w-4 mr-1" />
                  Choose File
                </Button>
              </div>
            </div>
          </div>

          {/* Management Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onShowHistory}
              className="flex items-center gap-1"
            >
              <History className="h-4 w-4" />
              View History ({storageStats.historyCount})
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onOptimizeStorage}
              className="flex items-center gap-1"
              disabled={storageStats.usagePercentage < 50}
            >
              <BarChart3 className="h-4 w-4" />
              Optimize Storage
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClearData}
              disabled={!hasStoredData}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </div>

        {/* Storage Warnings */}
        {storageStats.usagePercentage > 80 && (
          <Alert className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Storage Warning:</strong> Storage usage is high ({storageStats.usagePercentage.toFixed(1)}%). 
              Consider optimizing storage or clearing old data.
            </AlertDescription>
          </Alert>
        )}

        {storageStats.usagePercentage > 95 && (
          <Alert className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Storage Critical:</strong> Storage is nearly full. New analyses may fail to save.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageStatus;
