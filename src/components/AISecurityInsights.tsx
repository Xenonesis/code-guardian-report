import React, { useState, useEffect, useCallback } from 'react';
import { 
  Brain, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Lightbulb,
  BookOpen,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AIService } from '@/services/aiService';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { hasConfiguredApiKeys, formatAIError, getAIFeatureStatus } from '@/utils/aiUtils';
import { toast } from 'sonner';

interface AISecurityInsightsProps {
  results: AnalysisResults;
  className?: string;
}

interface InsightState {
  content: string;
  isLoading: boolean;
  error: string | null;
  lastGenerated: Date | null;
}

export const AISecurityInsights: React.FC<AISecurityInsightsProps> = ({ results, className = '' }) => {
  const [aiFeatureStatus, setAiFeatureStatus] = useState(getAIFeatureStatus());
  const [aiService] = useState(() => new AIService());


  
  // Separate state for each type of insight
  const [securityInsights, setSecurityInsights] = useState<InsightState>({
    content: '',
    isLoading: false,
    error: null,
    lastGenerated: null
  });
  
  const [remediationStrategy, setRemediationStrategy] = useState<InsightState>({
    content: '',
    isLoading: false,
    error: null,
    lastGenerated: null
  });

  const [owaspExplanations, setOwaspExplanations] = useState<Record<string, InsightState>>({});

  // Check for API keys on component mount and listen for changes
  useEffect(() => {
    const updateFeatureStatus = () => {
      const newStatus = getAIFeatureStatus();
      setAiFeatureStatus(newStatus);
    };

    updateFeatureStatus();

    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'aiApiKeys') {
        updateFeatureStatus();
      }
    };

    // Also listen for custom events (for same-tab changes)
    const handleCustomStorageChange = () => {
      updateFeatureStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('aiApiKeysChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aiApiKeysChanged', handleCustomStorageChange);
    };
  }, []);

  // Define generateSecurityInsights first
  const generateSecurityInsights = useCallback(async () => {
    setSecurityInsights(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const insights = await aiService.generateSecurityInsights(results);

      setSecurityInsights({
        content: insights,
        isLoading: false,
        error: null,
        lastGenerated: new Date()
      });
      toast.success('Security insights generated successfully!');
    } catch (error) {
      const errorMessage = formatAIError(error);
      setSecurityInsights(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(`Failed to generate insights: ${errorMessage}`);
    }
  }, [results, aiService]);

  // Auto-generate insights when API keys are available
  useEffect(() => {
    if (aiFeatureStatus.hasApiKeys && results.issues.length > 0 && !securityInsights.content && !securityInsights.isLoading) {
      // Add a small delay to ensure the UI is ready
      const timer = setTimeout(() => {
        generateSecurityInsights();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [aiFeatureStatus.hasApiKeys, results.issues.length, securityInsights.content, securityInsights.isLoading, generateSecurityInsights]);

  const generateRemediationStrategy = async () => {
    setRemediationStrategy(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const strategy = await aiService.generateRemediationStrategy(results);
      setRemediationStrategy({
        content: strategy,
        isLoading: false,
        error: null,
        lastGenerated: new Date()
      });
      toast.success('Remediation strategy generated successfully!');
    } catch (error) {
      const errorMessage = formatAIError(error);
      setRemediationStrategy(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(`Failed to generate strategy: ${errorMessage}`);
    }
  };

  const generateOwaspExplanation = async (owaspCategory: string) => {
    const relatedIssues = results.issues.filter(issue => issue.owaspCategory === owaspCategory);
    
    setOwaspExplanations(prev => ({
      ...prev,
      [owaspCategory]: { ...prev[owaspCategory], isLoading: true, error: null }
    }));
    
    try {
      const explanation = await aiService.generateOwaspExplanation(owaspCategory, relatedIssues);
      setOwaspExplanations(prev => ({
        ...prev,
        [owaspCategory]: {
          content: explanation,
          isLoading: false,
          error: null,
          lastGenerated: new Date()
        }
      }));
      toast.success(`OWASP explanation generated for ${owaspCategory.split(' – ')[0]}`);
    } catch (error) {
      const errorMessage = formatAIError(error);
      setOwaspExplanations(prev => ({
        ...prev,
        [owaspCategory]: {
          ...prev[owaspCategory],
          isLoading: false,
          error: errorMessage
        }
      }));
      toast.error(`Failed to generate OWASP explanation: ${errorMessage}`);
    }
  };

  const getUniqueOwaspCategories = () => {
    return [...new Set(results.issues.map(issue => issue.owaspCategory).filter(Boolean))];
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!aiFeatureStatus.isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-gray-400" />
            AI Security Insights
            <Badge variant="outline" className="text-gray-600 border-gray-300">
              Not Supported
            </Badge>
          </CardTitle>
          <CardDescription>
            AI features are not supported in this environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              AI security insights require a modern browser with localStorage and fetch API support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!aiFeatureStatus.hasApiKeys) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Security Insights
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              API Keys Required
            </Badge>
          </CardTitle>
          <CardDescription>
            {aiFeatureStatus.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please configure your AI API keys in the AI Configuration tab to enable intelligent security analysis,
              OWASP explanations, and personalized remediation strategies.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Security Insights
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {aiFeatureStatus.primaryProvider ? `${aiFeatureStatus.primaryProvider.toUpperCase()} Connected` : 'API Connected'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {aiFeatureStatus.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Overview
              </TabsTrigger>
              <TabsTrigger value="remediation" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Remediation Plan
              </TabsTrigger>
              <TabsTrigger value="owasp" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                OWASP Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Security Posture Analysis</h3>
                <Button
                  onClick={generateSecurityInsights}
                  disabled={securityInsights.isLoading}
                  variant="outline"
                  size="sm"
                >
                  {securityInsights.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {securityInsights.isLoading ? 'Generating...' : 'Regenerate'}
                </Button>
              </div>

              {securityInsights.isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Analyzing security posture...</p>
                      <Progress value={undefined} className="w-64" />
                      <p className="text-xs text-slate-500">
                        AI is analyzing {results.issues.length} issues across {results.totalFiles} files
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {securityInsights.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to generate security insights: {securityInsights.error}
                  </AlertDescription>
                </Alert>
              )}

              {securityInsights.content && (
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                      {securityInsights.content}
                    </div>
                  </div>
                  {securityInsights.lastGenerated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle className="h-3 w-3" />
                      Generated on {formatTimestamp(securityInsights.lastGenerated)}
                    </div>
                  )}
                </div>
              )}

              {!securityInsights.content && !securityInsights.isLoading && !securityInsights.error && (
                <div className="text-center py-8">
                  <Button onClick={generateSecurityInsights} className="bg-purple-600 hover:bg-purple-700">
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Security Insights
                  </Button>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Get AI-powered analysis of your security posture and risk assessment
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="remediation" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Prioritized Remediation Strategy</h3>
                <Button
                  onClick={generateRemediationStrategy}
                  disabled={remediationStrategy.isLoading}
                  variant="outline"
                  size="sm"
                >
                  {remediationStrategy.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {remediationStrategy.isLoading ? 'Generating...' : 'Generate Plan'}
                </Button>
              </div>

              {remediationStrategy.isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Creating remediation strategy...</p>
                      <Progress value={undefined} className="w-64" />
                      <p className="text-xs text-slate-500">
                        Prioritizing {results.summary.criticalIssues + results.summary.highIssues} critical/high issues
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {remediationStrategy.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to generate remediation strategy: {remediationStrategy.error}
                  </AlertDescription>
                </Alert>
              )}

              {remediationStrategy.content && (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                      {remediationStrategy.content}
                    </div>
                  </div>
                  {remediationStrategy.lastGenerated && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle className="h-3 w-3" />
                      Generated on {formatTimestamp(remediationStrategy.lastGenerated)}
                    </div>
                  )}
                </div>
              )}

              {!remediationStrategy.content && !remediationStrategy.isLoading && !remediationStrategy.error && (
                <div className="text-center py-8">
                  <Button onClick={generateRemediationStrategy} className="bg-blue-600 hover:bg-blue-700">
                    <Target className="h-4 w-4 mr-2" />
                    Generate Remediation Strategy
                  </Button>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Get a prioritized action plan based on risk, effort, and business impact
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="owasp" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">OWASP Top 10 Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                  Get detailed explanations for each OWASP category detected in your codebase
                </p>
              </div>

              {getUniqueOwaspCategories().length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No OWASP Top 10 categories detected in the current analysis results.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {getUniqueOwaspCategories().map((category) => {
                    const relatedIssues = results.issues.filter(issue => issue.owaspCategory === category);
                    const categoryState = owaspExplanations[category] || { content: '', isLoading: false, error: null, lastGenerated: null };
                    const categoryId = category.split(' – ')[0];
                    const categoryName = category.split(' – ')[1] || category;

                    return (
                      <Card key={category} className="border-l-4 border-l-orange-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                {categoryId}: {categoryName}
                              </CardTitle>
                              <CardDescription>
                                {relatedIssues.length} issue{relatedIssues.length !== 1 ? 's' : ''} detected
                              </CardDescription>
                            </div>
                            <Button
                              onClick={() => generateOwaspExplanation(category)}
                              disabled={categoryState.isLoading}
                              variant="outline"
                              size="sm"
                            >
                              {categoryState.isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Lightbulb className="h-4 w-4 mr-2" />
                              )}
                              {categoryState.isLoading ? 'Analyzing...' : 'Explain'}
                            </Button>
                          </div>
                        </CardHeader>
                        
                        {(categoryState.content || categoryState.isLoading || categoryState.error) && (
                          <CardContent>
                            {categoryState.isLoading && (
                              <div className="flex items-center gap-3 p-4">
                                <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                                <div>
                                  <p className="text-sm font-medium">Analyzing {categoryName}...</p>
                                  <p className="text-xs text-slate-500">
                                    Examining {relatedIssues.length} related issue{relatedIssues.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            )}

                            {categoryState.error && (
                              <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Failed to generate explanation: {categoryState.error}
                                </AlertDescription>
                              </Alert>
                            )}

                            {categoryState.content && (
                              <div className="space-y-3">
                                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                                  <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                                    {categoryState.content}
                                  </div>
                                </div>
                                {categoryState.lastGenerated && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <CheckCircle className="h-3 w-3" />
                                    Generated on {formatTimestamp(categoryState.lastGenerated)}
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
