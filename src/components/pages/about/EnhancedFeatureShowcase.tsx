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
    <section className="py-20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl float-animation delay-2s"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="glass-card-ultra max-w-4xl mx-auto p-8 mb-8">
              <h3 className="text-4xl sm:text-5xl font-bold gradient-text-animated mb-6">
                Platform Capabilities
              </h3>
              <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
                Discover the powerful features that make Code Guardian the ultimate security analysis platform
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Enhanced Feature Tabs */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card
                  key={feature.id}
                  className={`cursor-pointer enhanced-card-hover glow-on-hover transition-all duration-700 ${
                    activeFeature === feature.id
                      ? 'glass-card-ultra border-2 border-blue-400/50 dark:border-blue-500/50 shadow-2xl shadow-blue-500/30'
                      : 'glass-card-ultra hover:border-white/40 dark:hover:border-white/20'
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Enhanced Icon Container */}
                      <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white shadow-xl ${
                        activeFeature === feature.id ? 'scale-110 rotate-3' : ''
                      } transition-all duration-500`}>
                        {feature.icon}
                        {activeFeature === feature.id && (
                          <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className={`font-bold text-xl mb-3 ${
                          activeFeature === feature.id
                            ? 'gradient-text-animated'
                            : 'text-slate-900 dark:text-white'
                        } transition-all duration-500`}>
                          {feature.title}
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Enhanced Arrow */}
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        activeFeature === feature.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      } transition-all duration-500`}>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Active Feature Details */}
            <div className="relative lg:sticky lg:top-8">
              <Card className="glass-card-ultra enhanced-card-hover overflow-hidden">
                {/* Enhanced Background Decoration */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activeFeatureData.gradient} opacity-10`}></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 rounded-full blur-3xl float-animation"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500/25 to-teal-500/25 rounded-full blur-2xl float-animation delay-2s"></div>

                {/* Particle System */}
                <div className="particle-system">
                  <div className="particle" style={{ left: '10%', animationDelay: '0s' }}></div>
                  <div className="particle" style={{ left: '90%', animationDelay: '3s' }}></div>
                  <div className="particle" style={{ left: '50%', animationDelay: '6s' }}></div>
                </div>

                <CardContent className="relative z-10 p-10">
                  {/* Enhanced Header */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className={`p-5 rounded-3xl bg-gradient-to-r ${activeFeatureData.gradient} text-white shadow-2xl animate-pulse`}>
                      <div className="text-2xl">
                        {activeFeatureData.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-3xl font-bold gradient-text-animated mb-2">
                        {activeFeatureData.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">Featured Capability</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Description */}
                  <div className="glass-card-ultra p-6 mb-8">
                    <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed">
                      {activeFeatureData.description}
                    </p>
                  </div>

                  {/* Enhanced Benefits Section */}
                  <div className="space-y-6">
                    <h5 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      Key Benefits
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeFeatureData.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="glass-card-ultra p-4 enhanced-card-hover group"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${activeFeatureData.gradient} group-hover:scale-125 transition-transform duration-300`}></div>
                            <span className="text-slate-800 dark:text-slate-200 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">{benefit}</span>
                          </div>
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