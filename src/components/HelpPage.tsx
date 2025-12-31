"use client";

import React from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Mail, 
  Github, 
  ExternalLink,
  Shield,
  Code,
  Settings,
  FileText,
  BarChart3
} from 'lucide-react';

interface HelpPageProps {
  className?: string;
}

export const HelpPage: React.FC<HelpPageProps> = ({ className = '' }) => {
  const helpSections = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          title: "Quick Start Guide",
          description: "Learn how to upload and analyze your first code file",
          link: "#quick-start"
        },
        {
          title: "Supported Languages",
          description: "See which programming languages are supported",
          link: "#languages"
        },
        {
          title: "File Upload Guidelines",
          description: "Best practices for uploading code files",
          link: "#upload-guidelines"
        }
      ]
    },
    {
      title: "Analysis Features",
      icon: <Shield className="h-5 w-5" />,
      items: [
        {
          title: "Security Analysis",
          description: "Understanding security vulnerabilities and fixes",
          link: "#security-analysis"
        },
        {
          title: "AI Configuration",
          description: "How to configure AI services for analysis",
          link: "#ai-config"
        },
        {
          title: "Custom Prompts",
          description: "Creating custom analysis prompts",
          link: "#custom-prompts"
        }
      ]
    },
    {
      title: "Results & Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      items: [
        {
          title: "Understanding Results",
          description: "How to interpret analysis results",
          link: "#understanding-results"
        },
        {
          title: "Export Options",
          description: "Exporting analysis reports in different formats",
          link: "#export-options"
        },
        {
          title: "Analytics Dashboard",
          description: "Using the comprehensive analytics view",
          link: "#analytics-dashboard"
        }
      ]
    },
    {
      title: "Troubleshooting",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          title: "Common Issues",
          description: "Solutions to frequently encountered problems",
          link: "#common-issues"
        },
        {
          title: "API Configuration",
          description: "Setting up OpenAI and Anthropic API keys",
          link: "#api-config"
        },
        {
          title: "Performance Tips",
          description: "Optimizing analysis performance",
          link: "#performance-tips"
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: "Documentation",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Comprehensive guides and API reference",
      link: "https://github.com/Xenonesis/code-guardian-report",
      external: true
    },
    {
      title: "GitHub Issues",
      icon: <Github className="h-5 w-5" />,
      description: "Report bugs and request features",
      link: "https://github.com/Xenonesis/code-guardian-report/issues",
      external: true
    },
    {
      title: "Email Support",
      icon: <Mail className="h-5 w-5" />,
      description: "Get help via email",
      link: "mailto:itisaddy7@gmail.com",
      external: true
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20 ${className}`}>
      <div className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Help & Documentation
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                Everything you need to know about using Code Guardian for secure code analysis
              </p>
            </div>

            {/* Help Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {helpSections.map((section, index) => (
                <div key={index} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      {section.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="group">
                        <a
                          href={item.link}
                          className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                        >
                          <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                            {item.title}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {item.description}
                          </p>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Support Options */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                Need More Help?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {supportOptions.map((option, index) => (
                  <a
                    key={index}
                    href={option.link}
                    target={option.external ? "_blank" : undefined}
                    rel={option.external ? "noopener noreferrer" : undefined}
                    className="group block p-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        {option.icon}
                      </div>
                      {option.external && (
                        <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {option.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {option.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                💡 Quick Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use the sidebar navigation to quickly switch between different analysis features</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Configure your AI API keys in the AI Configuration tab for enhanced analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Export your analysis results to share with your team or for record keeping</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use custom prompts to tailor the analysis to your specific security requirements</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 