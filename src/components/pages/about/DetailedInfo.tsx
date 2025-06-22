import React from 'react';
import { Shield, Search, Brain, Gauge, Lock, FileText, Users, Globe } from 'lucide-react';

export const DetailedInfo: React.FC = () => {
  const capabilities = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Security Analysis",
      description: "Comprehensive vulnerability scanning using industry-standard tools and custom security rules."
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Code Quality Assessment",
      description: "Deep analysis of code maintainability, complexity, and adherence to best practices."
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Powered Insights",
      description: "Intelligent recommendations and explanations powered by advanced machine learning."
    },
    {
      icon: <Gauge className="h-5 w-5" />,
      title: "Performance Optimization",
      description: "Identify performance bottlenecks and suggest optimizations for better efficiency."
    }
  ];

  const features = [
    {
      icon: <Lock className="h-4 w-4" />,
      text: "OWASP Top 10 vulnerability detection"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Detailed security and quality reports"
    },
    {
      icon: <Users className="h-4 w-4" />,
      text: "Multi-language support (15+ languages)"
    },
    {
      icon: <Globe className="h-4 w-4" />,
      text: "Enterprise-grade scalability"
    }
  ];

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              About Code Guardian
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Code Guardian is a comprehensive security and quality analysis platform designed to help developers 
              build secure, maintainable, and high-quality applications. Our tool combines multiple industry-standard 
              analyzers with AI-powered insights to provide actionable recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {capabilities.map((capability, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    {capability.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {capability.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {capability.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
              Key Features
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-green-600 dark:text-green-400">
                    {feature.icon}
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 text-sm">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};