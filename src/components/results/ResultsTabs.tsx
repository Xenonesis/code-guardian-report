import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { SecurityOverview } from './SecurityOverview';
import { AISecurityInsights } from '@/components/AISecurityInsights';
import { SecurityMetricsDashboard } from '@/components/SecurityMetricsDashboard';

interface ResultsTabsProps {
  results: AnalysisResults;
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({ results }) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Security Overview</TabsTrigger>
        <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <SecurityOverview results={results} />
      </TabsContent>

      <TabsContent value="ai-insights">
        <AISecurityInsights results={results} />
      </TabsContent>

      <TabsContent value="metrics">
        <SecurityMetricsDashboard results={results} />
      </TabsContent>
    </Tabs>
  );
};