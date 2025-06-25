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
    <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              About Code Guardian
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Code Guardian is a next-generation AI-powered security analysis platform that combines advanced static analysis 
              with cutting-edge AI insights to identify security vulnerabilities, code quality issues, and performance bottlenecks. 
              Our platform helps developers write more secure, maintainable, and efficient code.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Free to Use</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
                <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Multi-Language</span>
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