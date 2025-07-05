import React, { useState } from 'react';
import { Shield, Brain, Zap, Database, Code, Lock, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  gradient: string;
}

export const EnhancedFeatureShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string>('security');

  const features: Feature[] = [
    {
      id: 'security',
      icon: <Shield className="h-6 w-6" />,
      title: 'Advanced Security Analysis',
      description: 'Comprehensive vulnerability detection using OWASP standards and real-time threat intelligence.',
      benefits: ['OWASP Top 10 Coverage', 'CVE Database Integration', 'Zero-day Detection', 'Compliance Reporting'],
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'ai',
      icon: <Brain className="h-6 w-6" />,
      title: 'AI-Powered Insights',
      description: 'Next-generation AI with GPT-4 and Claude integration for intelligent code recommendations.',
      benefits: ['Smart Fix Suggestions', 'Contextual Analysis', 'Auto-generated Prompts', 'Learning Algorithms'],
      color: 'purple',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'performance',
      icon: <Zap className="h-6 w-6" />,
      title: 'Performance Optimization',
      description: 'Lightning-fast processing with real-time analytics and comprehensive performance tracking.',
      benefits: ['Real-time Processing', 'Performance Metrics', 'Bundle Analysis', 'Optimization Insights'],
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      id: 'storage',
      icon: <Database className="h-6 w-6" />,
      title: 'Persistent Storage',
      description: 'Advanced results storage with cross-tab synchronization and intelligent history management.',
      benefits: ['Persistent Results', 'Cross-tab Sync', 'Data Compression', 'Export Capabilities'],
      color: 'blue',
      gradient: 'from-blue-500 to-indigo-600'
    }
  ];

  const activeFeatureData = features.find(f => f.id === activeFeature) || features[0];

  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-4">
              Platform Capabilities
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover the powerful features that make Code Guardian the ultimate security analysis platform
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Feature Tabs */}
            <div className="space-y-4">
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  className={`cursor-pointer transition-all duration-500 hover:scale-[1.02] ${
                    activeFeature === feature.id
                      ? 'bg-gradient-to-r from-white to-blue-50 dark:from-slate-800 dark:to-blue-900/50 border-blue-300 dark:border-blue-600 shadow-lg shadow-blue-500/20'
                      : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white shadow-lg ${
                        activeFeature === feature.id ? 'scale-110' : ''
                      } transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold text-lg mb-2 ${
                          activeFeature === feature.id 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-slate-900 dark:text-white'
                        } transition-colors duration-300`}>
                          {feature.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      <ArrowRight className={`h-5 w-5 ${
                        activeFeature === feature.id 
                          ? 'text-blue-600 dark:text-blue-400 opacity-100' 
                          : 'text-slate-400 opacity-0'
                      } transition-all duration-300`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Active Feature Details */}
            <div className="relative">
              <Card className="bg-gradient-to-br from-white/95 to-white/80 dark:from-slate-800/95 dark:to-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
                {/* Background decoration */}
                <div className={`absolute inset-0 bg-gradient-to-r ${activeFeatureData.gradient} opacity-5`}></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                
                <CardContent className="relative z-10 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${activeFeatureData.gradient} text-white shadow-xl`}>
                      {activeFeatureData.icon}
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {activeFeatureData.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Featured Capability</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    {activeFeatureData.description}
                  </p>

                  <div className="space-y-3">
                    <h5 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Key Benefits
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeFeatureData.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activeFeatureData.gradient}`}></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeatureShowcase;