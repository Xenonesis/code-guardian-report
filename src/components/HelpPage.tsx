"use client";

import React from "react";
import {
  BookOpen,
  Mail,
  GitFork,
  ExternalLink,
  Shield,
  Settings,
  BarChart3,
  Lightbulb,
  Terminal,
} from "lucide-react";

interface HelpPageProps {
  className?: string;
}

export const HelpPage: React.FC<HelpPageProps> = ({ className = "" }) => {
  const helpSections = [
    {
      title: "Getting Started",
      icon: <BookOpen className="h-5 w-5" />,
      items: [
        {
          title: "Quick Start Guide",
          description: "Learn how to upload and analyze your first code file",
          link: "#quick-start",
        },
        {
          title: "Supported Languages",
          description: "See which programming languages are supported",
          link: "#languages",
        },
        {
          title: "File Upload Guidelines",
          description: "Best practices for uploading code files",
          link: "#upload-guidelines",
        },
      ],
    },
    {
      title: "Analysis Features",
      icon: <Shield className="h-5 w-5" />,
      items: [
        {
          title: "Security Analysis",
          description: "Understanding security vulnerabilities and fixes",
          link: "#security-analysis",
        },
        {
          title: "AI Configuration",
          description: "How to configure AI services for analysis",
          link: "#ai-config",
        },
        {
          title: "Custom Prompts",
          description: "Creating custom analysis prompts",
          link: "#custom-prompts",
        },
      ],
    },
    {
      title: "Results & Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      items: [
        {
          title: "Understanding Results",
          description: "How to interpret analysis results",
          link: "#understanding-results",
        },
        {
          title: "Export Options",
          description: "Exporting analysis reports in different formats",
          link: "#export-options",
        },
        {
          title: "Analytics Dashboard",
          description: "Using the comprehensive analytics view",
          link: "#analytics-dashboard",
        },
      ],
    },
    {
      title: "Troubleshooting",
      icon: <Settings className="h-5 w-5" />,
      items: [
        {
          title: "Common Issues",
          description: "Solutions to frequently encountered problems",
          link: "#common-issues",
        },
        {
          title: "API Configuration",
          description: "Setting up OpenAI and Anthropic API keys",
          link: "#api-config",
        },
        {
          title: "Performance Tips",
          description: "Optimizing analysis performance",
          link: "#performance-tips",
        },
      ],
    },
  ];

  const supportOptions = [
    {
      title: "Documentation",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Comprehensive guides and API reference",
      link: "https://github.com/Xenonesis/code-guardian-report",
      external: true,
    },
    {
      title: "GitHub Issues",
      icon: <GitFork className="h-5 w-5" />,
      description: "Report bugs and request features",
      link: "https://github.com/Xenonesis/code-guardian-report/issues",
      external: true,
    },
    {
      title: "Email Support",
      icon: <Mail className="h-5 w-5" />,
      description: "Get help via email",
      link: "mailto:itisaddy7@gmail.com",
      external: true,
    },
  ];

  return (
    <div
      className={`bg-background text-foreground selection:bg-primary/20 selection:text-primary relative min-h-screen overflow-hidden ${className}`}
    >
      {/* Industrial Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80" />
      </div>

      <div className="relative z-10 pt-16">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Header */}
            <div className="mb-16 text-center">
              <div className="border-primary/30 bg-primary/5 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                  <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
                </span>
                <span className="font-mono tracking-wider">
                  SYSTEM DOCUMENTATION
                </span>
              </div>

              <h1 className="font-display text-foreground mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl dark:text-white">
                HELP &{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  SUPPORT
                </span>
              </h1>

              <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed font-light md:text-xl">
                Everything you need to operate the Code Guardian system securely
                and efficiently.
              </p>
            </div>

            {/* Help Sections */}
            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2">
              {helpSections.map((section, index) => (
                <div
                  key={index}
                  className="group hover:border-primary/50 border-border/50 bg-background/40 hover:bg-muted/50 relative overflow-hidden rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)] dark:border-white/10 dark:bg-black/40 dark:hover:bg-black/60"
                >
                  <div className="border-border/50 mb-6 flex items-center gap-4 border-b pb-4 dark:border-white/5">
                    <div className="bg-primary/10 text-primary ring-primary/20 group-hover:bg-primary/20 rounded-lg p-3 ring-1 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]">
                      {section.icon}
                    </div>
                    <h3 className="font-display text-foreground text-xl font-bold tracking-wide dark:text-white">
                      {section.title}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex}>
                        <a
                          href={item.link}
                          className="group/item hover:bg-muted/50 flex flex-col gap-1 rounded-lg p-2 transition-all duration-200 dark:hover:bg-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <Terminal className="text-primary/50 group-hover/item:text-primary h-3 w-3 transition-colors" />
                            <h4 className="group-hover/item:text-primary text-foreground/80 font-mono text-sm font-medium transition-colors dark:text-slate-200">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-muted-foreground group-hover/item:text-foreground/80 pl-5 text-xs dark:text-slate-400 dark:group-hover/item:text-slate-300">
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
            <div className="border-border/50 bg-background/40 relative overflow-hidden rounded-xl border p-8 backdrop-blur-sm dark:border-white/10 dark:bg-black/40">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
              <h2 className="font-display text-foreground relative mb-8 text-center text-2xl font-bold tracking-wide dark:text-white">
                NEED <span className="text-primary">ASSISTANCE?</span>
              </h2>
              <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
                {supportOptions.map((option, index) => (
                  <a
                    key={index}
                    href={option.link}
                    target={option.external ? "_blank" : undefined}
                    rel={option.external ? "noopener noreferrer" : undefined}
                    className="group hover:border-primary/30 hover:shadow-primary/5 bg-muted/50 hover:bg-muted flex flex-col items-center rounded-lg border border-transparent p-6 text-center transition-all duration-200 hover:shadow-lg dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="bg-primary/10 text-primary group-hover:bg-primary/20 mb-4 rounded-full p-4 transition-transform duration-300 group-hover:scale-110">
                      {option.icon}
                    </div>
                    <h3 className="text-foreground mb-2 font-mono text-lg font-semibold dark:text-white">
                      {option.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm dark:text-slate-400">
                      {option.description}
                    </p>
                    {option.external && (
                      <ExternalLink className="text-primary/70 group-hover:text-primary h-4 w-4 transition-colors" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="border-y-border/50 border-r-border/50 mt-12 rounded-xl border-y border-r border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent p-6 dark:border-y-white/5 dark:border-r-white/5">
              <h3 className="mb-4 flex items-center gap-3 text-lg font-semibold text-amber-500">
                <Lightbulb className="h-5 w-5" />
                <span className="font-mono tracking-wider">SYSTEM TIPS</span>
              </h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                {[
                  "Use the sidebar navigation to quickly switch between different analysis features",
                  "Configure your AI API keys in the AI Configuration tab for enhanced analysis",
                  "Export your analysis results to share with your team or for record keeping",
                  "Use custom prompts to tailor the analysis to your specific security requirements",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/50" />
                    <span className="text-foreground/80 dark:text-slate-300">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
