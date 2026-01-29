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
  Rocket,
} from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";

export const DetailedInfo: React.FC = () => {
  const capabilities = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Security Vulnerability Detection",
      description:
        "Comprehensive scanning for OWASP Top 10 vulnerabilities, SQL injection, XSS, authentication bypass, and more security threats.",
    },
    {
      icon: <Bug className="h-5 w-5" />,
      title: "Bug & Error Detection",
      description:
        "Identify runtime errors, null pointer exceptions, memory leaks, race conditions, and logic errors before they impact users.",
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Code Quality Analysis",
      description:
        "Assess maintainability, complexity, technical debt, code smells, and adherence to coding standards and best practices.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Performance Optimization",
      description:
        "Detect performance bottlenecks, inefficient algorithms, slow database queries, and resource usage issues.",
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Dependency Analysis",
      description:
        "Scan package dependencies for known vulnerabilities, outdated versions, and security advisories.",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI-Generated Fix Prompts",
      description:
        "Get custom AI prompts tailored to your specific issues, ready to use with Cursor, Windsurf, or GitHub Copilot.",
    },
  ];

  const capabilityItems: BentoItem[] = capabilities.map((c) => ({
    title: c.title,
    description: c.description,
    icon: c.icon,
  }));

  const features = [
    {
      icon: <Lock className="h-4 w-4" />,
      text: "OWASP Top 10 & CWE vulnerability detection",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Comprehensive PDF, CSV, and JSON reports",
    },
    {
      icon: <Code className="h-4 w-4" />,
      text: "Support for 15+ programming languages",
    },
    {
      icon: <Brain className="h-4 w-4" />,
      text: "AI-powered fix suggestions and prompts",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      text: "Real-time analysis with instant results",
    },
    {
      icon: <Users className="h-4 w-4" />,
      text: "Team collaboration and sharing features",
    },
    {
      icon: <Globe className="h-4 w-4" />,
      text: "Web-based platform, no installation required",
    },
    {
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Free to use with no registration required",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-16 dark:from-slate-900/50 dark:via-blue-900/20 dark:to-slate-900/50">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl"></div>
        <div className="absolute right-1/6 bottom-1/4 h-48 w-48 animate-bounce rounded-full bg-gradient-to-r from-emerald-400/10 to-teal-400/10 blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl dark:from-white dark:via-blue-300 dark:to-purple-300">
              About Code Guardian
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-slate-600 dark:text-slate-400">
              Code Guardian is a next-generation AI-powered security analysis
              platform that combines advanced static analysis with cutting-edge
              AI insights to identify security vulnerabilities, code quality
              issues, and performance bottlenecks. Our platform helps developers
              write more secure, maintainable, and efficient code.
            </p>
            <div className="mb-12 flex flex-wrap justify-center gap-6">
              <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-green-200/50 bg-gradient-to-r from-green-100/80 to-emerald-100/80 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 dark:border-green-700/50 dark:from-green-900/40 dark:to-emerald-900/40">
                <CheckCircle className="h-5 w-5 text-green-600 transition-transform duration-300 group-hover:scale-110 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                  Free to Use
                </span>
              </div>
              <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-blue-200/50 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 dark:border-blue-700/50 dark:from-blue-900/40 dark:to-cyan-900/40">
                <Star className="h-5 w-5 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                  AI-Powered
                </span>
              </div>
              <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-purple-200/50 bg-gradient-to-r from-purple-100/80 to-pink-100/80 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 dark:border-purple-700/50 dark:from-purple-900/40 dark:to-pink-900/40">
                <Globe className="h-5 w-5 text-purple-600 transition-transform duration-300 group-hover:scale-110 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                  Multi-Language
                </span>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <BentoGrid items={capabilityItems} />
          </div>

          <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-slate-800">
            <h3 className="mb-6 text-center text-xl font-semibold text-slate-900 dark:text-white">
              Platform Features
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-green-600 dark:text-green-400">
                    {feature.icon}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
              <h4 className="mb-3 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                <Rocket className="h-4 w-4" />
                What Makes Us Different
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li>
                  • <strong>AI Integration:</strong> Generate custom prompts for
                  popular AI coding assistants
                </li>
                <li>
                  • <strong>No Setup Required:</strong> Upload and analyze
                  immediately, no installation needed
                </li>
                <li>
                  • <strong>Comprehensive Analysis:</strong> Security, quality,
                  performance, and dependencies in one scan
                </li>
                <li>
                  • <strong>Actionable Results:</strong> Get specific fixes, not
                  just problem identification
                </li>
                <li>
                  • <strong>Developer-Friendly:</strong> Built by developers who
                  understand real-world coding challenges
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
