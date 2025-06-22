import React, { useState } from 'react';
import { ToolCard, Tool } from './ToolCard';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid, List, Search, Sparkles, Zap, TrendingUp } from 'lucide-react';

interface SupportedToolsSectionProps {
  className?: string;
}

export const SupportedToolsSection: React.FC<SupportedToolsSectionProps> = ({ className = '' }) => {
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const supportedTools: Tool[] = [
    {
      name: 'Bandit',
      language: 'Python',
      type: 'Security Scanner',
      gradient: 'from-red-500 to-pink-500',
      description: 'Advanced Python security scanner that identifies common vulnerabilities, injection flaws, and security anti-patterns.',
      features: ['SQL Injection Detection', 'Hardcoded Secrets', 'Insecure Randomness', 'Shell Injection', 'Crypto Vulnerabilities'],
      rating: 4.8,
      downloads: '2M+'
    },
    {
      name: 'ESLint',
      language: 'JavaScript/TypeScript',
      type: 'Quality & Security',
      gradient: 'from-blue-500 to-indigo-500',
      description: 'Industry-standard linting tool with advanced security rules for modern JavaScript and TypeScript applications.',
      features: ['Syntax Analysis', 'Security Patterns', 'Best Practices', 'Type Safety', 'Custom Rules'],
      rating: 4.9,
      downloads: '25M+'
    },
    {
      name: 'Pylint',
      language: 'Python',
      type: 'Code Quality',
      gradient: 'from-green-500 to-emerald-500',
      description: 'Comprehensive Python code analyzer that enforces coding standards and identifies potential issues.',
      features: ['Code Complexity', 'Naming Conventions', 'Unused Variables', 'Import Analysis', 'Refactoring Suggestions'],
      rating: 4.7,
      downloads: '5M+'
    },
    {
      name: 'Semgrep',
      language: 'Multi-language',
      type: 'Security & SAST',
      gradient: 'from-purple-500 to-violet-500',
      description: 'Next-generation static analysis tool with custom rule engine for finding security vulnerabilities.',
      features: ['OWASP Top 10', 'Custom Rules', 'Multi-language', 'CI/CD Integration', 'Supply Chain Security'],
      rating: 4.6,
      downloads: '1M+'
    },
    {
      name: 'Flake8',
      language: 'Python',
      type: 'Style & Convention',
      gradient: 'from-yellow-500 to-orange-500',
      description: 'Unified Python style checker combining multiple tools for comprehensive code quality assessment.',
      features: ['PEP 8 Compliance', 'Cyclomatic Complexity', 'Import Validation', 'Documentation', 'Plugin Ecosystem'],
      rating: 4.5,
      downloads: '8M+'
    },
    {
      name: 'SonarQube',
      language: 'Multi-language',
      type: 'Enterprise SAST',
      gradient: 'from-teal-500 to-cyan-500',
      description: 'Enterprise-grade continuous code quality platform with advanced security vulnerability detection.',
      features: ['Security Hotspots', 'Quality Gates', 'Technical Debt', 'Coverage Analysis', 'Enterprise Integration'],
      rating: 4.4,
      downloads: '500K+',
      comingSoon: true
    }
  ];

  const filteredTools = supportedTools.filter(tool => {
    const matchesFilter = filter === 'all' || tool.type.toLowerCase().includes(filter.toLowerCase()) || tool.language.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'All Tools', count: supportedTools.length },
    { value: 'security', label: 'Security', count: supportedTools.filter(t => t.type.toLowerCase().includes('security')).length },
    { value: 'python', label: 'Python', count: supportedTools.filter(t => t.language.toLowerCase().includes('python')).length },
    { value: 'javascript', label: 'JavaScript', count: supportedTools.filter(t => t.language.toLowerCase().includes('javascript')).length },
    { value: 'multi-language', label: 'Multi-language', count: supportedTools.filter(t => t.language.toLowerCase().includes('multi')).length }
  ];

  return (
    <section className={`relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 ${className} overflow-hidden`} aria-labelledby="tools-title">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-950/10 dark:to-purple-950/10 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-0">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-full border border-blue-200 dark:border-blue-800 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors">Powered by Industry Leaders</span>
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
          </div>
          
          <h3 id="tools-title" className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 dark:text-white animate-fade-in">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Industry-Leading
            </span>
            <br className="sm:hidden" />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                Analysis Tools
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            </span>
          </h3>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed mb-8">
            We integrate with the most <span className="font-semibold text-blue-600 dark:text-blue-400">trusted</span> and <span className="font-semibold text-purple-600 dark:text-purple-400">powerful</span> static analysis tools in the industry, providing comprehensive security and quality analysis for your codebase.
          </p>
          
          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-md backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{supportedTools.length}+ Tools</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-md backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-md backdrop-blur-sm">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Real-time Analysis</span>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="mb-8 px-4 sm:px-0">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between max-w-6xl mx-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search tools, features, or languages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 text-sm placeholder:text-slate-400 shadow-sm backdrop-blur-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">×</span>
                </button>
              )}
            </div>

            {/* Filter Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              {filterOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filter === option.value ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 px-4 py-2 font-medium ${
                    filter === option.value 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-600 border-0' 
                      : 'hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm'
                  }`}
                  onClick={() => setFilter(option.value)}
                >
                  {option.label} <span className="ml-1 opacity-75">({option.count})</span>
                </Badge>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl p-1 backdrop-blur-sm shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all duration-300 group ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400 scale-105' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all duration-300 group ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400 scale-105' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
                title="List View"
              >
                <List className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8 px-4 sm:px-0">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-full shadow-sm border border-slate-200 dark:border-slate-600">
            <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Showing <span className="font-bold text-blue-600 dark:text-blue-400">{filteredTools.length}</span> of <span className="font-bold">{supportedTools.length}</span> tools
              {searchTerm && (
                <span className="ml-1">
                  matching <span className="font-semibold text-purple-600 dark:text-purple-400">"{searchTerm}"</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tools Grid/List */}
        <div className={`px-4 sm:px-0 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10' 
            : 'space-y-6'
        } transition-all duration-500`}>
          {filteredTools.map((tool, index) => (
            <div 
              key={`${tool.name}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <ToolCard tool={tool} index={index} viewMode={viewMode} />
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="relative mx-auto mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center shadow-lg">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-white text-sm font-bold">0</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No tools found</h4>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
              We couldn't find any tools matching your criteria. Try adjusting your search or filter settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => { setSearchTerm(''); setFilter('all'); }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
              >
                Clear all filters
              </button>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 font-semibold"
              >
                Clear search only
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
