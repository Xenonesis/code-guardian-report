import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { 
  Shield, 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Code, 
  FileText,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { AnalysisResults } from '@/hooks/useAnalysis';

interface ModernDashboardProps {
  analysisResults?: AnalysisResults;
  className?: string;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({ 
  analysisResults, 
  className = '' 
}) => {
  // Use real analysis data or provide meaningful defaults
  const metrics = {
    totalIssues: analysisResults?.issues?.length || 0,
    criticalIssues: analysisResults?.summary?.criticalIssues || 0,
    warningIssues: analysisResults?.summary?.mediumIssues || 0,
    infoIssues: analysisResults?.summary?.lowIssues || 0,
    filesScanned: analysisResults?.totalFiles || 0,
    linesOfCode: analysisResults?.summary?.linesAnalyzed || 0,
    securityScore: analysisResults?.summary?.securityScore || 0,
    qualityScore: analysisResults?.summary?.qualityScore || 0
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold gradient-text-blue">
          Analysis Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Comprehensive overview of your code analysis results with AI-powered insights
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Issues"
          value={metrics.totalIssues}
          subtitle="Across all files"
          icon={Bug}
          variant="modern"
          colorScheme="red"
          trend="down"
          trendValue="-12%"
          className="animate-fade-in animate-stagger-1"
        />
        
        <MetricsCard
          title="Critical Issues"
          value={metrics.criticalIssues}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          variant="modern"
          colorScheme="orange"
          trend="down"
          trendValue="-5%"
          className="animate-fade-in animate-stagger-2"
        />
        
        <MetricsCard
          title="Files Scanned"
          value={metrics.filesScanned}
          subtitle="Successfully analyzed"
          icon={FileText}
          variant="modern"
          colorScheme="blue"
          trend="up"
          trendValue="+23%"
          className="animate-fade-in animate-stagger-3"
        />
        
        <MetricsCard
          title="Lines of Code"
          value={metrics.linesOfCode.toLocaleString()}
          subtitle="Total analyzed"
          icon={Code}
          variant="modern"
          colorScheme="purple"
          trend="up"
          trendValue="+8%"
          className="animate-fade-in animate-stagger-4"
        />
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricsCard
          title="Security Score"
          value={`${metrics.securityScore}%`}
          subtitle="Based on vulnerability analysis"
          icon={Shield}
          score={metrics.securityScore}
          showProgress={true}
          variant="modern"
          colorScheme="green"
          trend="up"
          trendValue="+5%"
          className="animate-slide-up animate-stagger-1"
        />
        
        <MetricsCard
          title="Code Quality Score"
          value={`${metrics.qualityScore}%`}
          subtitle="Overall code health rating"
          icon={Target}
          score={metrics.qualityScore}
          showProgress={true}
          variant="modern"
          colorScheme="blue"
          trend="up"
          trendValue="+3%"
          className="animate-slide-up animate-stagger-2"
        />
      </div>

      {/* Detailed Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issue Breakdown */}
        <EnhancedCard variant="modern" hover={true} glow="blue" className="animate-scale-in">
          <EnhancedCardHeader>
            <EnhancedCardTitle gradient={true} size="lg">
              Issue Breakdown
            </EnhancedCardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Distribution of issues by severity level
            </p>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100">Critical</p>
                    <p className="text-sm text-red-600 dark:text-red-400">High priority fixes</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {metrics.criticalIssues}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                    <Bug className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900 dark:text-orange-100">Warning</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Should be addressed</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {metrics.warningIssues}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Info</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Minor improvements</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.infoIssues}
                </span>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>

        {/* Performance Metrics */}
        <EnhancedCard variant="modern" hover={true} glow="purple" className="animate-scale-in">
          <EnhancedCardHeader>
            <EnhancedCardTitle gradient={true} size="lg">
              Performance Insights
            </EnhancedCardTitle>
            <p className="text-slate-600 dark:text-slate-400">
              Analysis performance and optimization metrics
            </p>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Analysis Speed</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Lines per second</p>
                  </div>
                </div>
                <span className="text-xl font-bold gradient-text-green">2.4K</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                    <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Memory Usage</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Peak consumption</p>
                  </div>
                </div>
                <span className="text-xl font-bold gradient-text-purple">128MB</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Efficiency Score</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Overall performance</p>
                  </div>
                </div>
                <span className="text-xl font-bold gradient-text-blue">94%</span>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  );
};