import React from 'react';
import { ToolCard, Tool } from './ToolCard';

interface SupportedToolsSectionProps {
  className?: string;
}

export const SupportedToolsSection: React.FC<SupportedToolsSectionProps> = ({ className = '' }) => {
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

  return (
    <section className={`py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 ${className}`} aria-labelledby="tools-title">
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-0">
        <h3 id="tools-title" className="text-responsive-xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
          Industry-Leading Analysis Tools
        </h3>
        <p className="text-responsive-base text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          We integrate with the most trusted and powerful static analysis tools in the industry
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {supportedTools.map((tool, index) => (
          <ToolCard key={index} tool={tool} index={index} />
        ))}
      </div>
    </section>
  );
};
