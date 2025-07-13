import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityOverview } from './SecurityOverview';
import { AISecurityInsights } from '@/components/AISecurityInsights';
import { SecurityMetricsDashboard } from '@/components/SecurityMetricsDashboard';
import { LanguageDetectionDisplay } from '@/components/LanguageDetectionDisplay';

interface ResultsTabsProps {
  results: AnalysisResults;
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({ results }) => {
  const hasLanguageDetection = results.languageDetection;
  const tabCount = hasLanguageDetection ? 4 : 3;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className={`grid w-full grid-cols-${tabCount}`}>
        <TabsTrigger value="overview">Security Overview</TabsTrigger>
        {hasLanguageDetection && (
          <TabsTrigger value="language-detection">Language Detection</TabsTrigger>
        )}
        <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <SecurityOverview results={results} />
      </TabsContent>

      {hasLanguageDetection && (
        <TabsContent value="language-detection" className="space-y-6">
          <LanguageDetectionDisplay detectionResult={results.languageDetection} />
        </TabsContent>
      )}

      <TabsContent value="ai-insights">
        <AISecurityInsights results={results} />
      </TabsContent>

      <TabsContent value="metrics">
        <SecurityMetricsDashboard results={results} />
      </TabsContent>
    </Tabs>
  );
};