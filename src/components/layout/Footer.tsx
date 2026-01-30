"use client";

import * as React from "react";
import {
  Shield,
  Heart,
  Mail,
  Github,
  Globe,
  Scale,
  FileText,
  Code,
  Brain,
  Star,
  Users,
  Youtube,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { APP_VERSION_WITH_PREFIX } from "@/utils/version";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const footerLinks = {
    main: [
      {
        id: "home",
        label: "AI Platform",
        description: "Next-gen security analysis",
      },
      { id: "about", label: "About", description: "Enterprise tools" },
    ],
    legal: [
      {
        id: "privacy",
        label: "Privacy Policy",
        description: "Data protection",
      },
      { id: "terms", label: "Terms of Service", description: "Usage terms" },
    ],
    resources: [
      {
        path: "#documentation",
        label: "Documentation",
        description: "User guides",
      },
      {
        path: "#api-reference",
        label: "API Reference",
        description: "Developer docs",
      },
      {
        path: "#community",
        label: "Community",
        description: "Join developers",
      },
      { path: "#support", label: "Support", description: "Get help" },
    ],
  };

  const socialLinks = [
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/Xenonesis/code-guardian-report",
    },
    {
      name: "YouTube",
      icon: Youtube,
      href: "https://youtube.com/@techiaddy?si=lPZBPOwHtnrFz-mk",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://www.linkedin.com/in/itisaddy/",
    },
  ];

  return (
    <footer
      className={`border-border/60 from-background via-primary/5 to-background relative overflow-hidden border-t bg-gradient-to-br ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-float-slow absolute top-0 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl"></div>
        <div className="animate-float-delayed absolute right-1/4 bottom-0 h-48 w-48 rounded-full bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 blur-3xl"></div>
        <div className="animate-pulse-slow absolute top-1/2 left-0 h-32 w-32 rounded-full bg-gradient-to-r from-orange-500/5 to-red-500/5 blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-3 py-10 sm:px-4 sm:py-12 md:px-6 lg:px-8 lg:py-16">
        {/* Main Footer Content */}
        <div className="mb-8 grid grid-cols-1 gap-8 sm:mb-10 sm:grid-cols-2 sm:gap-10 lg:mb-12 lg:grid-cols-5 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3 lg:mb-6 lg:gap-4">
              <div className="relative rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 p-2 shadow-lg transition-all duration-300 group-hover:shadow-xl sm:rounded-xl sm:p-2.5 lg:p-3">
                <Shield className="h-6 w-6 text-white sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-xl"></div>
              </div>
              <div>
                <h3 className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-xl font-bold text-transparent sm:text-xl lg:text-2xl dark:from-white dark:to-blue-100">
                  Code Guardian
                </h3>
                <p
                  className="text-xs sm:text-sm"
                  style={{
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    maxWidth: "100%",
                  }}
                >
                  AI-Powered Security Platform
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed sm:mb-7 sm:text-base lg:mb-8">
              Revolutionizing code security with advanced AI analysis, real-time
              threat detection, and comprehensive vulnerability assessment for
              modern development teams.
            </p>

            {/* Enhanced Social Links */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border-border/60 bg-muted/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground rounded-lg border p-2 transition-all duration-300 hover:scale-110 sm:rounded-xl sm:p-2.5 lg:p-3"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-foreground mb-4 flex items-center gap-1.5 text-xs font-semibold sm:mb-5 sm:gap-2 sm:text-sm lg:mb-6">
              <div className="rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 p-1 sm:rounded-lg sm:p-1.5">
                <Brain className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
              </div>
              Platform
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 lg:space-y-4">
              {footerLinks.main.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="group text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-all duration-300 sm:text-base"
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-foreground mb-4 flex items-center gap-1.5 text-xs font-semibold sm:mb-5 sm:gap-2 sm:text-sm lg:mb-6">
              <div className="rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 p-1 sm:rounded-lg sm:p-1.5">
                <FileText className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
              </div>
              Resources
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 lg:space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className="group text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-all duration-300 sm:text-base"
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {link.label}
                    </span>
                    {link.path === "#" && (
                      <ExternalLink className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100 sm:h-3 sm:w-3" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-foreground mb-4 flex items-center gap-1.5 text-xs font-semibold sm:mb-5 sm:gap-2 sm:text-sm lg:mb-6">
              <div className="rounded-md bg-gradient-to-r from-purple-500 to-pink-500 p-1 sm:rounded-lg sm:p-1.5">
                <Scale className="h-2.5 w-2.5 text-white sm:h-3 sm:w-3" />
              </div>
              Legal
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 lg:space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="group text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-all duration-300 sm:text-base"
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="border-border/60 border-t pt-6 sm:pt-7 lg:pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:gap-5 lg:flex-row lg:gap-6">
            {/* Copyright and Trust Badge */}
            <div className="flex flex-col items-center gap-3 text-xs sm:flex-row sm:gap-4 sm:text-sm lg:gap-6">
              <div className="text-muted-foreground flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Heart className="h-3.5 w-3.5 animate-pulse text-red-400 sm:h-4 sm:w-4" />
                  <span className="text-center sm:text-left">
                    © {currentYear} Code Guardian. Made with love for
                    developers.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 px-3 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2">
                <Star className="h-3.5 w-3.5 text-yellow-400 sm:h-4 sm:w-4" />
                <span className="text-xs font-medium text-blue-900 sm:text-sm dark:text-blue-100">
                  Trusted by 10K+ developers
                </span>
              </div>
            </div>

            {/* Contact and Version */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <a
                href="mailto:itisaddy7@gmail.com"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 py-1.5 text-emerald-900 backdrop-blur-sm transition-all duration-300 hover:from-emerald-500/30 hover:to-teal-500/30 sm:gap-2 sm:px-4 sm:py-2 dark:text-emerald-100"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs font-medium sm:text-sm">Contact</span>
              </a>
              <div className="border-border/60 bg-muted/60 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-2">
                <Code className="text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {APP_VERSION_WITH_PREFIX}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Compliance Badges */}
          <div className="border-border/60 mt-6 border-t pt-4 sm:mt-7 sm:pt-5 lg:mt-8 lg:pt-6">
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-xs sm:gap-6 sm:text-sm lg:gap-8">
              <div className="group flex items-center gap-1.5 sm:gap-2">
                <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-0.5 sm:p-1">
                  <Globe className="h-2.5 w-2.5 text-blue-600 transition-colors duration-300 group-hover:text-blue-700 sm:h-3 sm:w-3 dark:text-blue-300 dark:group-hover:text-blue-200" />
                </div>
                <span className="group-hover:text-foreground transition-colors duration-300">
                  Global Security Platform
                </span>
              </div>
              <div className="group flex items-center gap-1.5 sm:gap-2">
                <div className="rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-0.5 sm:p-1">
                  <Shield className="h-2.5 w-2.5 text-green-600 transition-colors duration-300 group-hover:text-green-700 sm:h-3 sm:w-3 dark:text-green-300 dark:group-hover:text-green-200" />
                </div>
                <span className="group-hover:text-foreground transition-colors duration-300">
                  SOC 2 Type II Compliant
                </span>
              </div>
              <div className="group flex items-center gap-1.5 sm:gap-2">
                <div className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-0.5 sm:p-1">
                  <Users className="h-2.5 w-2.5 text-purple-600 transition-colors duration-300 group-hover:text-purple-700 sm:h-3 sm:w-3 dark:text-purple-300 dark:group-hover:text-purple-200" />
                </div>
                <span className="group-hover:text-foreground transition-colors duration-300">
                  ISO 27001 Certified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
