import React, { useState, Suspense, lazy } from 'react';
import { Shield, Code, Zap, Bot } from 'lucide-react';
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

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Advanced Security Scanning',
      description: 'Comprehensive vulnerability detection using OWASP Top 10, CVE database, and custom security rules.',
      gradient: 'from-emerald-500 to-teal-600',
      benefits: ['OWASP Top 10 Coverage', 'CVE Integration', 'Zero-day Detection', 'Custom Security Rules']
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Code Quality Assessment',
      description: 'Deep analysis of code complexity, maintainability, and technical debt with actionable insights.',
      gradient: 'from-blue-500 to-indigo-600',
      benefits: ['Complexity Metrics', 'Technical Debt Analysis', 'Maintainability Index', 'Code Smells Detection']
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI-Powered Intelligence',
      description: 'Leverage cutting-edge AI for natural language explanations and intelligent fix suggestions.',
      gradient: 'from-purple-500 to-pink-600',
      benefits: ['Natural Language Explanations', 'Auto-fix Suggestions', 'Context-aware Analysis', 'Learning Algorithms']
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Performance',
      description: 'Optimized analysis pipeline with parallel processing for enterprise-scale codebases.',
      gradient: 'from-amber-500 to-orange-600',
      benefits: ['Parallel Processing', 'Incremental Analysis', 'Real-time Results', 'Scalable Architecture']
    }
  ];



  return (
    <PageLayout
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      features={features}
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
