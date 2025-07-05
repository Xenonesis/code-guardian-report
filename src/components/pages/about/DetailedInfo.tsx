import React from "react";
import {
  Shield,
  Brain,
  Lock,
  FileText,
  Users,
  Globe,
  Code,
  Zap,
  Bug,
  Database,
  CheckCircle,
  Star,
} from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";

export const DetailedInfo: React.FC = () => {
  const capabilities = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Security Vulnerability Detection",
      description: "Comprehensive scanning for OWASP Top 10 vulnerabilities, SQL injection, XSS, authentication bypass, and more security threats."
    },
    {
      icon: <Bug className="h-5 w-5" />,
      title: "Bug & Error Detection",
      description: "Identify runtime errors, null pointer exceptions, memory leaks, race conditions, and logic errors before they impact users."
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Code Quality Analysis",
      description: "Assess maintainability, complexity, technical debt, code smells, and adherence to coding standards and best practices."
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Performance Optimization",
      description: "Detect performance bottlenecks, inefficient algorithms, slow database queries, and resource usage issues."
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Dependency Analysis",
      description: "Scan package dependencies for known vulnerabilities, outdated versions, and security advisories."
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Generated Fix Prompts",
      description: "Get custom AI prompts tailored to your specific issues, ready to use with Cursor, Windsurf, or GitHub Copilot."
    }
  ];

  const capabilityItems: BentoItem[] = capabilities.map((c) => ({
    title: c.title,
    description: c.description,
    icon: c.icon,
  }));

  const features = [
    {
      icon: <Lock className="h-4 w-4" />,
      text: "OWASP Top 10 & CWE vulnerability detection"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Comprehensive PDF, CSV, and JSON reports"
    },
    {
      icon: <Code className="h-4 w-4" />,
      text: "Support for 15+ programming languages"
    },
    {
      icon: <Brain className="h-4 w-4" />,
      text: "AI-powered fix suggestions and prompts"
    },
    {
      icon: <Zap className="h-4 w-4" />,
      text: "Real-time analysis with instant results"
    },
    {
      icon: <Users className="h-4 w-4" />,
      text: "Team collaboration and sharing features"
    },
    {
      icon: <Globe className="h-4 w-4" />,
      text: "Web-based platform, no installation required"
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Free to use with no registration required"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900/50 dark:via-blue-900/20 dark:to-slate-900/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-48 h-48 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-2xl animate-bounce"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-6">
              About Code Guardian
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-3xl mx-auto">
              Code Guardian is a next-generation AI-powered security analysis platform that combines advanced static analysis 
              with cutting-edge AI insights to identify security vulnerabilities, code quality issues, and performance bottlenecks. 
              Our platform helps developers write more secure, maintainable, and efficient code.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="group flex items-center gap-3 bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/40 dark:to-emerald-900/40 backdrop-blur-sm px-6 py-3 rounded-2xl border border-green-200/50 dark:border-green-700/50 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">Free to Use</span>
              </div>
              <div className="group flex items-center gap-3 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 dark:from-blue-900/40 dark:to-cyan-900/40 backdrop-blur-sm px-6 py-3 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer">
                <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">AI-Powered</span>
              </div>
              <div className="group flex items-center gap-3 bg-gradient-to-r from-purple-100/80 to-pink-100/80 dark:from-purple-900/40 dark:to-pink-900/40 backdrop-blur-sm px-6 py-3 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">Multi-Language</span>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <BentoGrid items={capabilityItems} />

          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 text-center">
              Platform Features
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
            
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                🚀 What Makes Us Different
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>• <strong>AI Integration:</strong> Generate custom prompts for popular AI coding assistants</li>
                <li>• <strong>No Setup Required:</strong> Upload and analyze immediately, no installation needed</li>
                <li>• <strong>Comprehensive Analysis:</strong> Security, quality, performance, and dependencies in one scan</li>
                <li>• <strong>Actionable Results:</strong> Get specific fixes, not just problem identification</li>
                <li>• <strong>Developer-Friendly:</strong> Built by developers who understand real-world coding challenges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};