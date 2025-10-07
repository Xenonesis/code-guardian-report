import React from 'react';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { ResultsTabs } from '@/components/results/ResultsTabs';
import { PDFDownloadButton } from '../export/PDFDownloadButton';

interface EnhancedSecurityResultsProps {
  results: AnalysisResults;
}

export const EnhancedSecurityResults: React.FC<EnhancedSecurityResultsProps> = ({ results }) => {
  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* PDF Download Button */}
      <div className="flex justify-end">
        <PDFDownloadButton 
          results={results} 
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
        />
      </div>
      
      <div className="w-full max-w-none">
        <ResultsTabs results={results} />
      </div>
    </div>
  );
};
