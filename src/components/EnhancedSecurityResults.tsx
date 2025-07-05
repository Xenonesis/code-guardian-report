import React from 'react';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { ResultsTabs } from '@/components/results/ResultsTabs';

interface EnhancedSecurityResultsProps {
  results: AnalysisResults;
}

export const EnhancedSecurityResults: React.FC<EnhancedSecurityResultsProps> = ({ results }) => {
  return (
    <div className="space-y-6">
      <ResultsTabs results={results} />
    </div>
  );
};
