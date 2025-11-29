/**
 * Analysis History Page
 * Shows user's personal analysis history from Firebase
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AnimatedBackground } from '@/components/pages/about/AnimatedBackground';
import { 
  History, 
  Filter, 
  Download, 
  Trash2, 
  Eye,
  Calendar,
  FileText,
  Bug,
  Shield,
  User,
  Database
} from 'lucide-react';
import { firebaseAnalysisStorage, type FirebaseAnalysisData } from '../services/storage/firebaseAnalysisStorage';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
 

import { logger } from '@/utils/logger';
interface HistoryPageProps {
  onAnalysisSelect?: (analysis: FirebaseAnalysisData) => void;
  onNavigateBack?: () => void;
}

export const HistoryPage = ({ onAnalysisSelect, onNavigateBack }: HistoryPageProps) => {
  const { toast } = useToast();
  
  const [analysisHistory, setAnalysisHistory] = useState<FirebaseAnalysisData[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<FirebaseAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  type UserStats = {
    totalAnalyses?: number;
    totalIssuesFound?: number;
    totalFilesAnalyzed?: number;
    averageSecurityScore?: number;
  };
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  const { user: currentUser } = useAuth();

  const loadAnalysisHistory = useCallback(async () => {
    if (!currentUser?.uid) {
      logger.debug('🚫 No user authenticated for history loading');
      return;
    }

    logger.debug('📊 Loading analysis history for user:', currentUser.uid);
    setIsLoading(true);
    
    try {
      firebaseAnalysisStorage.setUserId(currentUser.uid);
      logger.debug('🔧 Firebase service user ID set');
      
      const history = await firebaseAnalysisStorage.getUserAnalysisHistory(currentUser.uid);
      logger.debug(`📈 Retrieved history: ${history.length} analyses`);
      logger.debug('📋 History data:', history);
      
      // Deduplicate history entries based on fileName and fileHash
      const deduplicatedHistory = history.filter((analysis, index, array) => {
        const firstOccurrence = array.findIndex(item => 
          item.fileName === analysis.fileName && 
          item.fileHash === analysis.fileHash
        );
        return index === firstOccurrence;
      });
      
      logger.debug(`🔄 Deduplicated history: ${deduplicatedHistory.length} unique analyses`);
      
      setAnalysisHistory(deduplicatedHistory);
      
      toast({
        title: '📊 History Loaded',
        description: `Found ${deduplicatedHistory.length} unique analysis results.`,
      });
      
      if (deduplicatedHistory.length === 0) {
        logger.debug('ℹ️ No analysis history found for this user');
        toast({
          title: '📝 No History Yet',
          description: 'Upload and analyze some code to see your history here.',
        });
      }
      
    } catch (err) {
      logger.error('❌ Error loading analysis history:', err);
      
      toast({
        title: '❌ Failed to Load History',
        description: `Could not load your analysis history: ${err instanceof Error ? err.message : String(err)}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  useEffect(() => {
    if (!currentUser?.uid) return;

    // Subscribe first so we don't miss the initial snapshot
    const unsubscribe = firebaseAnalysisStorage.subscribe((data) => {
      setAnalysisHistory(data);
    });

    // Then start realtime listener for this user
    firebaseAnalysisStorage.setUserId(currentUser.uid);
    // Also perform an immediate load as a fallback (in case the snapshot requires indexes)
    loadAnalysisHistory();

    // Load user stats separately
    loadUserStats();

    return () => {
      unsubscribe?.();
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    filterHistory();
  }, [analysisHistory, searchTerm, selectedTimeRange, selectedSeverity]);

  const loadUserStats = async () => {
    if (!currentUser?.uid) return;

    try {
      const stats = await firebaseAnalysisStorage.getUserStats(currentUser.uid);
      setUserStats(stats);
    } catch (error) {
      logger.error('Error loading user stats:', error);
    }
  };

  const filterHistory = () => {
    let filtered = [...analysisHistory];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(analysis => 
        analysis.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        analysis.results.issues?.some(issue => 
          issue.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          issue.message?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
        year: 365 * 24 * 60 * 60 * 1000
      } as const;
      
      const cutoff = new Date(now.getTime() - timeRanges[selectedTimeRange]);
      filtered = filtered.filter(analysis => {
        type FireTimestamp = { toDate?: () => Date; seconds?: number };
        const t = analysis.createdAt as FireTimestamp | Date | string | number | null | undefined;
        let analysisDate: Date;
        if (t && typeof (t as FireTimestamp).toDate === 'function') {
          analysisDate = (t as FireTimestamp).toDate!();
        } else if (t && typeof (t as FireTimestamp).seconds === 'number') {
          analysisDate = new Date((t as FireTimestamp).seconds! * 1000);
        } else if (t instanceof Date) {
          analysisDate = t as Date;
        } else if (typeof t === 'string' || typeof t === 'number') {
          analysisDate = new Date(t);
        } else {
          analysisDate = new Date();
        }
        return analysisDate >= cutoff;
      });
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(analysis =>
        analysis.results.issues?.some(issue => 
          issue.severity.toLowerCase() === selectedSeverity
        )
      );
    }

    setFilteredHistory(filtered);
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    try {
      await firebaseAnalysisStorage.deleteAnalysisResults(analysisId);
      setAnalysisHistory(prev => prev.filter(a => a.id !== analysisId));
      
      toast({
        title: '🗑️ Analysis Deleted',
        description: 'Analysis has been permanently deleted.',
      });
      
      // Reload stats after deletion
      loadUserStats();
    } catch (error) {
      logger.error('Error deleting analysis:', error);
      toast({
        title: '❌ Delete Failed',
        description: 'Could not delete analysis.',
        variant: 'destructive',
      });
    }
  };

  const handleViewAnalysis = (analysis: FirebaseAnalysisData) => {
    if (onAnalysisSelect) {
      onAnalysisSelect(analysis);
    }
    
    toast({
      title: '👁️ Analysis Loaded',
      description: `Viewing results for ${analysis.fileName}`,
    });
  };

  const exportAnalysisHistory = () => {
    try {
      const exportData = {
        user: {
          id: currentUser?.uid,
          email: currentUser?.email,
          exportDate: new Date().toISOString()
        },
        stats: userStats,
        analyses: filteredHistory.map(analysis => ({
          ...analysis,
          createdAt: analysis.createdAt?.toDate ? analysis.createdAt.toDate().toISOString() : analysis.createdAt,
          updatedAt: analysis.updatedAt?.toDate ? analysis.updatedAt.toDate().toISOString() : analysis.updatedAt
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: '📤 Export Complete',
        description: 'Your analysis history has been exported.',
      });
    } catch {
      toast({
        title: '❌ Export Failed',
        description: 'Could not export analysis history.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (timestamp: unknown) => {
    try {
      let date: Date;
      
      type FireTimestamp = { toDate?: () => Date; seconds?: number };
      const t = timestamp as FireTimestamp | Date | string | number | null | undefined;
      if (t && typeof (t as FireTimestamp).toDate === 'function') {
        // Firebase Timestamp
        date = (t as FireTimestamp).toDate!();
      } else if (t && typeof (t as FireTimestamp).seconds === 'number') {
        // Firebase Timestamp object with seconds
        date = new Date((t as FireTimestamp).seconds! * 1000);
      } else if (timestamp instanceof Date) {
        // Already a Date object
        date = timestamp;
      } else if (typeof t === 'string' || typeof t === 'number') {
        // String or number timestamp
        date = new Date(t);
      } else {
        // Fallback to current date
        logger.warn('Unable to parse timestamp:', t);
        date = new Date();
      }
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      logger.error('Error formatting date:', { error, timestamp });
      return 'Invalid Date';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please sign in to view your analysis history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onNavigateBack}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="container mx-auto py-12 space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Analysis History</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Your personal security analysis results and statistics
          </p>
        </div>
        <div className="flex gap-2">
          {onNavigateBack && (
            <Button variant="outline" onClick={onNavigateBack}>
              Back to Home
            </Button>
          )}
          <Button onClick={exportAnalysisHistory} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {/* User Stats */}
      {userStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Analyses</p>
                  <p className="text-2xl font-bold">{userStats.totalAnalyses || 0}</p>
                </div>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Issues Found</p>
                  <p className="text-2xl font-bold">{userStats.totalIssuesFound || 0}</p>
                </div>
                <Bug className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Files Analyzed</p>
                  <p className="text-2xl font-bold">{userStats.totalFilesAnalyzed || 0}</p>
                </div>
                <Database className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Security Score</p>
                  <p className="text-2xl font-bold">
                    {userStats.averageSecurityScore ? Math.round(userStats.averageSecurityScore) : '--'}
                  </p>
                </div>
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <Input
                placeholder="Search by filename, tags, or issue type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedTimeRange(e.target.value as 'all' | 'week' | 'month' | 'year')
              }
              className="w-full px-3 py-2 border rounded-md"
              aria-label="Time Range"
              title="Time Range"
            >
              <option value="all">All Time</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
            <select
              value={selectedSeverity}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedSeverity(
                  e.target.value as 'all' | 'critical' | 'high' | 'medium' | 'low'
                )
              }
              className="w-full px-3 py-2 border rounded-md"
              aria-label="Severity"
              title="Severity"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button onClick={loadAnalysisHistory} variant="outline" className="w-full sm:w-auto justify-center">
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Analysis Results ({filteredHistory.length})</CardTitle>
          <CardDescription>
            {filteredHistory.length !== analysisHistory.length && 
              `Showing ${filteredHistory.length} of ${analysisHistory.length} analyses`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading your analysis history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {analysisHistory.length === 0 ? 'No Analysis History' : 'No Results Found'}
              </h3>
              <p className="text-muted-foreground">
                {analysisHistory.length === 0 
                  ? 'Start analyzing your code to see results here.' 
                  : 'Try adjusting your search filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((analysis) => (
                <Card key={analysis.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{analysis.fileName}</h3>
                          <Badge variant={analysis.syncStatus === 'synced' ? 'default' : 'secondary'}>
                            {analysis.syncStatus}
                          </Badge>
                          {analysis.tags && analysis.tags.length > 0 && (
                            <div className="flex gap-1">
                              {analysis.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(analysis.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {analysis.results.totalFiles} files
                          </div>
                          <div className="flex items-center gap-1">
                            <Bug className="h-4 w-4" />
                            {analysis.results.issues?.length || 0} issues
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Score: {analysis.results.summary?.securityScore || '--'}
                          </div>
                        </div>

                        {/* Issue severity breakdown */}
                        {analysis.results.issues && analysis.results.issues.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {['critical', 'high', 'medium', 'low'].map((severity) => {
                              const count = analysis.results.issues?.filter(
                                issue => issue.severity.toLowerCase() === severity
                              ).length || 0;
                              
                              if (count === 0) return null;
                              
                              return (
                                <Badge 
                                  key={severity} 
                                  variant={getSeverityColor(severity)} 
                                  className="text-xs"
                                >
                                  {severity}: {count}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAnalysis(analysis)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteAnalysis(analysis.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
