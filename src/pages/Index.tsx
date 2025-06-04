import React, { useState, Suspense, lazy } from 'react';
import { Shield, Code, Zap, Users, ArrowRight, FileCode, Bot, Download, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadForm } from '@/components/UploadForm';
import { LoadingSpinner } from '@/components/LoadingStates';

// Lazy load heavy components for better performance
const ResultsTable = lazy(() => import('@/components/ResultsTable').then(module => ({ default: module.ResultsTable })));
const AIKeyManager = lazy(() => import('@/components/AIKeyManager').then(module => ({ default: module.AIKeyManager })));
const FloatingChatBot = lazy(() => import('@/components/FloatingChatBot').then(module => ({ default: module.FloatingChatBot })));

interface AnalysisResults {
  issues: Array<{
    id?: string;
    line: number;
    tool: string;
    type: string;
    message: string;
    severity: 'High' | 'Medium' | 'Low';
    recommendation: string;
    filename: string;
    codeSnippet?: string;
    aiSummary?: string;
    cveId?: string;
    confidence?: number;
    category?: string;
    impact?: string;
    effort?: string;
    startColumn?: number;
    endColumn?: number;
    affectedFunction?: string;
  }>;
  totalFiles: number;
  analysisTime: string;
}

const Index = () => {
  const [currentTab, setCurrentTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    console.log('File selected:', file.name, 'Size:', file.size, 'bytes');
  };

  const handleAnalysisComplete = (results: AnalysisResults) => {
    console.log('Analysis complete, results:', results);
    setAnalysisResults(results);
    setCurrentTab('results');
  };

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />,
      title: 'Security Analysis',
      description: 'Detect vulnerabilities, injection flaws, and security weaknesses with industry-leading tools.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: <Code className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: 'Code Quality',
      description: 'Identify code smells, complexity issues, and maintainability problems across your codebase.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: <Bot className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
      title: 'AI-Powered Insights',
      description: 'Get natural language explanations and smart recommendations using your preferred AI provider.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: <Zap className="h-8 w-8 text-amber-600 dark:text-amber-400" />,
      title: 'Fast Analysis',
      description: 'Process your entire codebase in seconds with optimized static analysis tools.',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const supportedTools = [
    { name: 'Bandit', language: 'Python', type: 'Security', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    { name: 'ESLint', language: 'JavaScript/TypeScript', type: 'Quality & Bugs', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { name: 'Pylint', language: 'Python', type: 'Code Quality', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    { name: 'Semgrep', language: 'Multi-language', type: 'Security', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    { name: 'Flake8', language: 'Python', type: 'Style & Convention', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 transition-colors duration-300">
      {/* Enhanced Header with Dark Mode Toggle */}
      <header className="container mx-auto mobile-container py-4 sm:py-6 relative">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-float-delayed-slow"></div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 relative z-10">
          <div className="flex items-center gap-3 animate-fade-in group cursor-pointer" onClick={() => setCurrentTab('upload')}>
            <div className="relative p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-float hover-lift hover-glow group-hover:scale-110">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white group-hover:animate-spin-slow transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300 animate-pulse-glow"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:animate-text-shimmer transition-all duration-300">
                Bug & Weak Code Finder
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                AI-Powered Code Analysis Platform
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDarkMode}
            className="border-2 hover:scale-110 hover-lift transition-all duration-300 focus-ring self-end sm:self-auto group bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover-glow"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="relative">
              {isDarkMode ? (
                <Sun className="h-4 w-4 group-hover:animate-spin-slow transition-all duration-500" />
              ) : (
                <Moon className="h-4 w-4 group-hover:animate-bounce-subtle transition-all duration-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="sr-only">
              {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            </span>
          </Button>
        </div>

        {/* Enhanced Hero Section */}
        <section className="relative text-center mb-8 sm:mb-12 animate-slide-up overflow-hidden" aria-labelledby="hero-title">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full animate-float blur-xl"></div>
            <div className="absolute top-20 right-16 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full animate-float-delayed blur-xl"></div>
            <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full animate-pulse-slow blur-xl"></div>
          </div>

          <div className="relative z-10">
            <h2
              id="hero-title"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent animate-gradient-flow animate-scale-in hover-glow"
            >
              Secure Code Analysis
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4 animate-fade-in animate-stagger-1 animate-text-shimmer">
              Comprehensive static code analysis platform that identifies security vulnerabilities,
              bugs, and code quality issues with AI-powered insights and real-time processing.
            </p>

            {/* Enhanced Feature badges with interactive animations */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-slate-500 dark:text-slate-400 animate-fade-in animate-stagger-2">
              <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover-lift animate-pulse-glow cursor-pointer group">
                <Users className="h-4 w-4 text-emerald-600 group-hover:animate-bounce-subtle transition-all" aria-hidden="true" />
                <span className="group-hover:text-emerald-600 transition-colors">Trusted by developers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover-lift animate-pulse-glow cursor-pointer group animate-stagger-1">
                <FileCode className="h-4 w-4 text-blue-600 group-hover:animate-bounce-subtle transition-all" aria-hidden="true" />
                <span className="group-hover:text-blue-600 transition-colors">Multi-language support</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover-lift animate-pulse-glow cursor-pointer group animate-stagger-2">
                <Download className="h-4 w-4 text-purple-600 group-hover:animate-bounce-subtle transition-all" aria-hidden="true" />
                <span className="group-hover:text-purple-600 transition-colors">Detailed reports</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 animate-fade-in animate-stagger-3">
              <Button 
                onClick={() => setCurrentTab('upload')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-xl hover-lift animate-glow transition-all duration-300 group"
              >
                Start Analysis
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Enhanced Features Grid with Advanced Animations */}
        <section className="mb-8 sm:mb-12 relative" aria-labelledby="features-title">
          <h3 id="features-title" className="sr-only">Key Features</h3>
          
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-float-delayed-slow"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-2xl hover-lift hover-glow transition-all duration-500 overflow-hidden animate-fade-in animate-stagger-${Math.min(index + 1, 5)} cursor-pointer transform hover:scale-105 hover:rotate-1`}
                role="article"
                aria-labelledby={`feature-${index}-title`}
              >
                <div className={`h-2 bg-gradient-to-r ${feature.gradient} animate-gradient-x group-hover:h-3 transition-all duration-300`} aria-hidden="true"></div>
                <CardHeader className="pb-4 relative">
                  <div className="mb-3 group-hover:scale-125 group-hover:animate-bounce-subtle transition-all duration-500 relative" aria-hidden="true">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow"></div>
                    {feature.icon}
                  </div>
                  <CardTitle
                    id={`feature-${index}-title`}
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:animate-text-shimmer transition-all duration-300"
                  >
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-blue-50/50 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-b-lg"></div>
                </CardContent>
                
                {/* Interactive corner accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Application Interface */}
        <main className="max-w-6xl mx-auto" role="main">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList
              className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border shadow-xl rounded-xl overflow-hidden relative group animate-fade-in"
              role="tablist"
              aria-label="Main navigation tabs"
            >
              {/* Dynamic background highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <TabsTrigger
                value="upload"
                className="relative flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift group/tab z-10"
                role="tab"
                aria-controls="upload-panel"
                aria-selected={currentTab === 'upload'}
              >
                <FileCode className="h-4 w-4 group-hover/tab:animate-bounce-subtle transition-all" aria-hidden="true" />
                <span className="hidden sm:inline">Upload Code</span>
                <span className="sm:hidden">Upload</span>
                {currentTab === 'upload' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse-glow"></div>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="ai-config"
                className="relative flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring hover-lift group/tab z-10"
                role="tab"
                aria-controls="ai-config-panel"
                aria-selected={currentTab === 'ai-config'}
              >
                <Bot className="h-4 w-4 group-hover/tab:animate-bounce-subtle transition-all" aria-hidden="true" />
                <span className="hidden sm:inline">AI Configuration</span>
                <span className="sm:hidden">AI Config</span>
                {currentTab === 'ai-config' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse-glow"></div>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="relative flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 focus-ring disabled:opacity-50 disabled:cursor-not-allowed hover-lift group/tab z-10"
                disabled={!analysisResults}
                role="tab"
                aria-controls="results-panel"
                aria-selected={currentTab === 'results'}
                aria-disabled={!analysisResults}
              >
                <Shield className="h-4 w-4 group-hover/tab:animate-bounce-subtle transition-all" aria-hidden="true" />
                <span className="hidden sm:inline">Analysis Results</span>
                <span className="sm:hidden">Results</span>
                {currentTab === 'results' && analysisResults && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse-glow"></div>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="upload"
              className="space-y-6 sm:space-y-8 animate-fade-in"
              role="tabpanel"
              id="upload-panel"
              aria-labelledby="upload-tab"
            >
              <UploadForm
                onFileSelect={handleFileSelect}
                onAnalysisComplete={handleAnalysisComplete}
              />

              {/* Enhanced Supported Tools with Advanced Animations */}
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl hover-lift hover-glow transition-all duration-500 relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20 animate-gradient-flow"></div>
                
                <CardHeader className="relative z-10">
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent animate-text-shimmer">
                    Supported Analysis Tools
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
                    We use industry-standard tools to ensure comprehensive code analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {supportedTools.map((tool, index) => (
                      <div
                        key={index}
                        className={`group p-4 sm:p-6 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl hover-lift transition-all duration-500 cursor-pointer transform hover:scale-105 hover:rotate-1 animate-fade-in animate-stagger-${Math.min(index + 1, 5)} relative overflow-hidden`}
                        role="article"
                        aria-labelledby={`tool-${index}-name`}
                      >
                        {/* Tool icon background effect */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <h4
                          id={`tool-${index}-name`}
                          className="font-bold text-base sm:text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 group-hover:animate-pulse-subtle"
                        >
                          {tool.name}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                          {tool.language}
                        </p>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${tool.color} group-hover:scale-110 transition-transform duration-300 inline-block animate-pulse-glow`}>
                          {tool.type}
                        </span>
                        
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              value="ai-config"
              className="animate-fade-in"
              role="tabpanel"
              id="ai-config-panel"
              aria-labelledby="ai-config-tab"
            >
              <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div>}>
                <AIKeyManager />
              </Suspense>
            </TabsContent>

            <TabsContent
              value="results"
              className="animate-fade-in"
              role="tabpanel"
              id="results-panel"
              aria-labelledby="results-tab"
            >
              {analysisResults ? (
                <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner size="lg" /></div>}>
                  <ResultsTable
                    issues={analysisResults.issues}
                    totalFiles={analysisResults.totalFiles}
                    analysisTime={analysisResults.analysisTime}
                  />
                </Suspense>
              ) : (
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-8 sm:p-12 text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 sm:p-6 rounded-full w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center animate-bounce-in">
                      <FileCode className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-900 dark:text-white">
                      No Analysis Results
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-md mx-auto">
                      Upload and analyze a zip file to see comprehensive results here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </header>

      {/* Floating Chat Bot */}
      <Suspense fallback={null}>
        <FloatingChatBot analysisResults={analysisResults} />
      </Suspense>

      {/* Enhanced Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 animate-gradient-flow"></div>
        
        <div className="container mx-auto mobile-container text-center relative z-10">
          <p className="text-sm text-slate-600 dark:text-slate-400 animate-fade-in">
            © 2024 Bug & Weak Code Finder. Built with ❤️ for secure development.
          </p>
          <div className="flex justify-center items-center gap-4 mt-4 animate-fade-in animate-stagger-1">
            <span className="text-xs text-slate-500 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 cursor-default">
              Privacy-focused
            </span>
            <span className="w-1 h-1 bg-slate-400 rounded-full animate-pulse-subtle"></span>
            <span className="text-xs text-slate-500 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300 cursor-default">
              Secure
            </span>
            <span className="w-1 h-1 bg-slate-400 rounded-full animate-pulse-subtle"></span>
            <span className="text-xs text-slate-500 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 cursor-default">
              Open Source
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
