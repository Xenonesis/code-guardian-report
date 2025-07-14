import { Shield, Code, Bot, Zap } from 'lucide-react';
import { FeatureGrid } from '@/components/features/FeatureGrid';

export const AboutFeatures = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Enterprise Security Framework',
      description: 'Comprehensive security analysis engine with OWASP Top 10 compliance, CVE database integration, and advanced threat detection capabilities. Designed for enterprise-scale applications with stringent security requirements.',
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      benefits: ['OWASP Top 10 Compliance', 'CVE Database Integration', 'Advanced Threat Detection', 'Security Intelligence', 'Compliance Reporting', 'Risk Assessment']
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Intelligent Analysis Engine',
      description: 'Advanced static code analysis with persistent storage, cross-session synchronization, and intelligent caching. Maintains comprehensive analysis history with detailed reporting and export capabilities.',
      gradient: 'from-blue-600 via-blue-700 to-blue-800',
      benefits: ['Persistent Analysis Results', 'Cross-Session Sync', 'Intelligent Caching', 'Historical Tracking', 'Multiple Export Formats', 'Performance Analytics']
    },
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'AI-Powered Insights',
      description: 'Integration with leading AI platforms including GPT-4 and Claude for contextual code analysis, intelligent recommendations, and automated security assessments with natural language explanations.',
      gradient: 'from-indigo-600 via-indigo-700 to-indigo-800',
      benefits: ['AI-Driven Analysis', 'Contextual Understanding', 'Automated Recommendations', 'Impact Assessment', 'Natural Language Reports', 'Intelligent Prioritization']
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Performance & Monitoring',
      description: 'High-performance analysis engine with real-time monitoring, comprehensive metrics dashboard, and advanced performance tracking for optimal development workflow integration.',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-800',
      benefits: ['Real-time Monitoring', 'Performance Metrics', 'Analytics Dashboard', 'Workflow Integration', 'Resource Optimization', 'Scalability Insights']
    }
  ];

  return (
    <div className="relative py-16 sm:py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl float-animation delay-2s"></div>
      </div>

      <div className="relative z-10">
        <FeatureGrid
          features={features}
          title="Enterprise Capabilities"
          subtitle="Comprehensive security analysis tools designed for modern development environments"
          columns={2}
          variant="modern"
        />
      </div>
    </div>
  );
};