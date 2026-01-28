import React, { useState } from "react";
import {
  FileCode,
  Shield,
  Brain,
  BarChart3,
  Zap,
  Lock,
  Code,
  Target,
  CheckCircle,
  TrendingUp,
  Database,
  Cpu,
  Eye,
  Layers,
} from "lucide-react";

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
  metrics: string[];
  color: string;
}

export const HowItWorksSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>("upload");

  const analysisSteps: AnalysisStep[] = [
    {
      id: "upload",
      title: "File Processing & Extraction",
      description:
        "Advanced ZIP file analysis with intelligent content extraction and file type detection",
      icon: <FileCode className="h-6 w-6" />,
      details: [
        "JSZip-powered extraction engine",
        "Multi-format file support (JS, TS, Python, PHP, Java, C#)",
        "Intelligent encoding detection (UTF-8, Latin-1, ASCII)",
        "Binary file filtering and optimization",
        "Recursive directory structure analysis",
        "Memory-efficient streaming for large files",
      ],
      metrics: [
        "File Count Analysis",
        "Total Lines of Code",
        "Language Distribution",
        "File Size Metrics",
        "Encoding Statistics",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "security",
      title: "Multi-Layer Security Analysis",
      description:
        "Comprehensive vulnerability detection using advanced pattern matching and threat intelligence",
      icon: <Shield className="h-6 w-6" />,
      details: [
        "OWASP Top 10 vulnerability scanning",
        "CVE database pattern matching",
        "SQL injection detection algorithms",
        "XSS vulnerability identification",
        "Hardcoded secrets detection",
        "Insecure cryptography analysis",
        "Command injection patterns",
        "Path traversal vulnerability checks",
        "Authentication bypass detection",
        "Session management issues",
      ],
      metrics: [
        "Security Score (0-100)",
        "Critical Vulnerabilities",
        "High/Medium/Low Issues",
        "CWE Classifications",
        "CVSS Severity Ratings",
      ],
      color: "from-red-500 to-pink-500",
    },
    {
      id: "quality",
      title: "Code Quality Assessment",
      description:
        "Deep code analysis with maintainability, complexity, and performance metrics",
      icon: <Code className="h-6 w-6" />,
      details: [
        "Cyclomatic complexity calculation",
        "Technical debt estimation",
        "Maintainability index scoring",
        "Code duplication detection",
        "Performance bottleneck identification",
        "Anti-pattern recognition",
        "Best practices validation",
        "Architecture quality assessment",
        "Coupling and cohesion analysis",
        "Test coverage estimation",
      ],
      metrics: [
        "Quality Score (0-100)",
        "Maintainability Index",
        "Technical Debt (hours)",
        "Complexity Rating",
        "Architecture Score",
      ],
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "ai",
      title: "AI-Powered Analysis & Insights",
      description:
        "Advanced machine learning algorithms for intelligent pattern recognition and recommendations",
      icon: <Brain className="h-6 w-6" />,
      details: [
        "Natural language processing for issue descriptions",
        "Context-aware vulnerability assessment",
        "Intelligent fix recommendations",
        "Impact analysis and risk scoring",
        "Learning from code patterns",
        "Auto-generated remediation guides",
        "Priority-based issue ranking",
        "False positive reduction",
        "Custom rule generation",
        "Trend analysis and predictions",
      ],
      metrics: [
        "AI Confidence Scores",
        "Risk Assessment",
        "Priority Rankings",
        "Fix Complexity",
        "Impact Predictions",
      ],
      color: "from-purple-500 to-indigo-500",
    },
    {
      id: "scoring",
      title: "Advanced Scoring System",
      description:
        "Comprehensive multi-dimensional scoring with weighted algorithms and industry benchmarks",
      icon: <BarChart3 className="h-6 w-6" />,
      details: [
        "Weighted severity scoring (Critical: 15pts, High: 8pts, Medium: 3pts, Low: 1pt)",
        "Exponential penalty system for critical issues",
        "Complexity-based adjustments",
        "Issue diversity impact calculation",
        "File distribution analysis",
        "Logarithmic density scaling",
        "Industry benchmark comparisons",
        "Performance impact weighting",
        "Security maturity assessment",
        "Grade-based classification (A+ to F)",
      ],
      metrics: [
        "Overall Security Score",
        "Quality Grade (A+ to F)",
        "Performance Score",
        "Security Maturity Level",
        "Technical Risk Rating",
      ],
      color: "from-orange-500 to-yellow-500",
    },
  ];

  const advancedMetrics = [
    {
      category: "Security Metrics",
      icon: <Lock className="h-5 w-5" />,
      items: [
        "Vulnerability Density (issues per 1000 LOC)",
        "Security Score (weighted by severity)",
        "CWE Coverage Analysis",
        "Threat Vector Assessment",
        "Attack Surface Analysis",
      ],
    },
    {
      category: "Quality Metrics",
      icon: <Target className="h-5 w-5" />,
      items: [
        "Maintainability Index (0-100)",
        "Technical Debt (estimated hours)",
        "Code Complexity Score",
        "Duplication Percentage",
        "Test Coverage Estimation",
      ],
    },
    {
      category: "Performance Metrics",
      icon: <Zap className="h-5 w-5" />,
      items: [
        "Performance Score (0-100)",
        "Bottleneck Detection",
        "Memory Usage Patterns",
        "Algorithm Efficiency",
        "Resource Optimization",
      ],
    },
    {
      category: "Architecture Metrics",
      icon: <Layers className="h-5 w-5" />,
      items: [
        "Architecture Score (0-100)",
        "Coupling Analysis",
        "Dependency Management",
        "Design Pattern Usage",
        "Structural Quality",
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-purple-900/10"></div>
      <div className="absolute top-0 left-1/4 h-72 w-72 animate-pulse rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-xl filter"></div>
      <div className="absolute right-1/4 bottom-0 h-72 w-72 animate-pulse rounded-full bg-purple-300 opacity-20 mix-blend-multiply blur-xl filter delay-1000"></div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
              How Our Analysis Engine Works
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-400">
            Deep dive into our comprehensive, multi-layered analysis system that
            provides real-time security, quality, and performance insights with
            industry-leading accuracy
          </p>
        </div>

        {/* Analysis Steps */}
        <div className="mb-20">
          <h3 className="mb-12 text-center text-3xl font-bold text-slate-800 dark:text-slate-200">
            5-Stage Analysis Pipeline
          </h3>

          {/* Step Navigation */}
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {analysisSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-3 rounded-full px-6 py-3 transition-all duration-300 ${
                  activeStep === step.id
                    ? `bg-gradient-to-r ${step.color} scale-105 text-white shadow-lg`
                    : "bg-white/50 text-slate-600 hover:bg-white/80 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800/80"
                }`}
              >
                <span className="font-semibold">{index + 1}</span>
                {step.icon}
                <span className="font-medium">{step.title}</span>
              </button>
            ))}
          </div>

          {/* Active Step Details */}
          {analysisSteps.map((step) => (
            <div
              key={step.id}
              className={`transition-all duration-500 ${
                activeStep === step.id
                  ? "max-h-full opacity-100"
                  : "max-h-0 overflow-hidden opacity-0"
              }`}
            >
              <div className="rounded-2xl border border-slate-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/80">
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Description & Details */}
                  <div>
                    <div className="mb-6 flex items-center gap-4">
                      <div
                        className={`rounded-xl bg-gradient-to-r p-3 ${step.color} text-white`}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                          {step.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                        <Eye className="h-4 w-4" />
                        Analysis Components:
                      </h5>
                      <div className="grid gap-2">
                        {step.details.map((detail, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"
                          >
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div>
                    <h5 className="mb-4 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                      <TrendingUp className="h-4 w-4" />
                      Generated Metrics:
                    </h5>
                    <div className="space-y-3">
                      {step.metrics.map((metric, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg bg-slate-50/50 p-3 dark:bg-slate-700/50"
                        >
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {metric}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advanced Metrics Grid */}
        <div className="mb-16">
          <h3 className="mb-12 text-center text-3xl font-bold text-slate-800 dark:text-slate-200">
            Comprehensive Scoring System
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {advancedMetrics.map((category, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200/50 bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/60"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white">
                    {category.icon}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {category.category}
                  </h4>
                </div>
                <div className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-center">
          <h3 className="mb-8 text-3xl font-bold text-slate-800 dark:text-slate-200">
            Powered by Advanced Technology
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "JSZip Engine", icon: <Database className="h-5 w-5" /> },
              {
                name: "Pattern Matching",
                icon: <Target className="h-5 w-5" />,
              },
              { name: "AI Algorithms", icon: <Brain className="h-5 w-5" /> },
              {
                name: "Real-time Processing",
                icon: <Cpu className="h-5 w-5" />,
              },
              {
                name: "Security Intelligence",
                icon: <Shield className="h-5 w-5" />,
              },
              {
                name: "Performance Analytics",
                icon: <Zap className="h-5 w-5" />,
              },
            ].map((tech, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 px-4 py-2 dark:border-slate-700/50 dark:bg-slate-800/50"
              >
                <div className="text-blue-500">{tech.icon}</div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
