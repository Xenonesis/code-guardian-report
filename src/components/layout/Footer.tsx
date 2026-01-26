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

  // Smooth scroll to section
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
      className={`relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 border-t border-slate-200/50 dark:border-slate-700/30 ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-0 w-32 h-32 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
              <div className="relative p-2 sm:p-2.5 lg:p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Shield className="h-6 w-6 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div>
                <h3 className="text-xl sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
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

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-6 sm:mb-7 lg:mb-8 max-w-md leading-relaxed">
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
                    className="group p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-slate-200/50 hover:bg-slate-300/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-300 border border-slate-300/50 hover:border-slate-400/50 dark:border-slate-700/50 dark:hover:border-slate-600/50 hover:scale-110"
                    aria-label={social.name}
                  >
                    <IconComponent className="h-4 w-4 sm:h-4.5 sm:w-4.5 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-4 sm:mb-5 lg:mb-6 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md sm:rounded-lg">
                <Brain className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
              Platform
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 lg:space-y-4">
              {footerLinks.main.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm sm:text-base text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-300 group flex items-center gap-2"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-4 sm:mb-5 lg:mb-6 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md sm:rounded-lg">
                <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
              Resources
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 lg:space-y-4">
              {footerLinks.resources.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    className="text-sm sm:text-base text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-300 group flex items-center gap-2"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                    {link.path === "#" && (
                      <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-60 group-hover:opacity-100" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-4 sm:mb-5 lg:mb-6 flex items-center gap-1.5 sm:gap-2">
              <div className="p-1 sm:p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md sm:rounded-lg">
                <Scale className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              </div>
              Legal
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 lg:space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm sm:text-base text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all duration-300 group flex items-center gap-2"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="border-t border-slate-300/50 dark:border-slate-700/50 pt-6 sm:pt-7 lg:pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-5 lg:gap-6">
            {/* Copyright and Trust Badge */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400 animate-pulse" />
                  <span className="text-center sm:text-left">
                    © {currentYear} Code Guardian. Made with love for
                    developers.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-400/30 backdrop-blur-sm">
                <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400" />
                <span className="text-xs sm:text-sm text-blue-900 dark:text-blue-100 font-medium">
                  Trusted by 10K+ developers
                </span>
              </div>
            </div>

            {/* Contact and Version */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <a
                href="mailto:itisaddy7@gmail.com"
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-900 dark:text-emerald-100 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-300 backdrop-blur-sm"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Contact</span>
              </a>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-200/50 border border-slate-300/50 dark:bg-slate-800/50 dark:border-slate-700/50 backdrop-blur-sm">
                <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {APP_VERSION_WITH_PREFIX}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Compliance Badges */}
          <div className="mt-6 sm:mt-7 lg:mt-8 pt-4 sm:pt-5 lg:pt-6 border-t border-slate-300/50 dark:border-slate-700/50">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 sm:gap-2 group">
                <div className="p-0.5 sm:p-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full">
                  <Globe className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 group-hover:text-blue-700 dark:text-blue-300 dark:group-hover:text-blue-200 transition-colors duration-300" />
                </div>
                <span className="group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                  Global Security Platform
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 group">
                <div className="p-0.5 sm:p-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full">
                  <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 group-hover:text-green-700 dark:text-green-300 dark:group-hover:text-green-200 transition-colors duration-300" />
                </div>
                <span className="group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                  SOC 2 Type II Compliant
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 group">
                <div className="p-0.5 sm:p-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full">
                  <Users className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-600 group-hover:text-purple-700 dark:text-purple-300 dark:group-hover:text-purple-200 transition-colors duration-300" />
                </div>
                <span className="group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
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
