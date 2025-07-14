import React from 'react';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { ResultsTabs } from '@/components/results/ResultsTabs';

interface EnhancedSecurityResultsProps {
  results: AnalysisResults;
}

export const EnhancedSecurityResults: React.FC<EnhancedSecurityResultsProps> = ({ results }) => {
  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="w-full max-w-none">
        <ResultsTabs results={results} />
      </div>
    </div>
  );
};
