import React, { useState } from 'react';
import { ToolCard, Tool } from './ToolCard';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid, List, Search } from 'lucide-react';

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
    <section className={`py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 ${className}`} aria-labelledby="tools-title">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-0">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-full border border-blue-200 dark:border-blue-800">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Powered by Industry Leaders</span>
        </div>
        <h3 id="tools-title" className="text-responsive-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
          Industry-Leading Analysis Tools
        </h3>
        <p className="text-responsive-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          We integrate with the most trusted and powerful static analysis tools in the industry, 
          providing comprehensive security and quality analysis for your codebase.
        </p>
      </div>

      {/* Enhanced Controls */}
      <div className="mb-8 px-4 sm:px-0">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between max-w-6xl mx-auto">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools, features, or languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 mr-1" />
            {filterOptions.map((option) => (
              <Badge
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  filter === option.value 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl' 
                    : 'hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
                onClick={() => setFilter(option.value)}
              >
                {option.label} ({option.count})
              </Badge>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center mb-6 px-4 sm:px-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredTools.length} of {supportedTools.length} tools
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Tools Grid/List */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8' 
          : 'space-y-4'
      } transition-all duration-300`}>
        {filteredTools.map((tool, index) => (
          <ToolCard key={`${tool.name}-${index}`} tool={tool} index={index} viewMode={viewMode} />
        ))}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No tools found</h4>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => { setSearchTerm(''); setFilter('all'); }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
};
