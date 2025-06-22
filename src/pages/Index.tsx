import React, { useState, Suspense, lazy } from 'react';

import { PageLayout } from '@/components/layouts/PageLayout';
import { HomeHero } from '@/components/pages/home/HomeHero';
import { AnalysisTabs } from '@/components/pages/home/AnalysisTabs';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAnalysis, AnalysisResults } from '@/hooks/useAnalysis';
import { useToast } from '@/hooks/use-toast';

// Lazy load heavy components for better performance
const FloatingChatBot = lazy(() => import('@/components/FloatingChatBot').then(module => ({ default: module.FloatingChatBot })));

const Index = () => {
  const [currentTab, setCurrentTab] = useState('upload');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { analysisResults, handleFileSelect, handleAnalysisComplete } = useAnalysis();
  const { toast } = useToast();

  const handleStartAnalysis = () => {
    setCurrentTab('upload');
  };

  // Enhanced analysis complete handler with automatic redirection
  const handleAnalysisCompleteWithRedirect = (results: AnalysisResults) => {
    handleAnalysisComplete(results);
    setIsRedirecting(true);

    // Show success notification with countdown
    toast({
      title: "✅ Analysis Complete!",
      description: `Found ${results.issues.length} issues across ${results.totalFiles} files. Redirecting to results in 1.5 seconds...`,
      variant: "default",
      duration: 2000,
    });

    // Automatically switch to results tab after a brief delay for better UX
    setTimeout(() => {
      setCurrentTab('results');
      setIsRedirecting(false);

      // Show a second toast confirming the redirection
      toast({
        title: "📊 Results Ready!",
        description: "Analysis results are now displayed below.",
        variant: "default",
        duration: 3000,
      });
    }, 1500);
  };


  return (
    <PageLayout
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
    >
      <HomeHero onStartAnalysis={handleStartAnalysis} />

      <AnalysisTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        analysisResults={analysisResults}
        onFileSelect={handleFileSelect}
        onAnalysisComplete={handleAnalysisCompleteWithRedirect}
        isRedirecting={isRedirecting}
      />

      {/* Floating Chat Bot */}
      <Suspense fallback={null}>
        <FloatingChatBot analysisResults={analysisResults} />
      </Suspense>
    </PageLayout>
  );
};

export default Index;
