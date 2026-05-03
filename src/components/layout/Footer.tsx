"use client";

import * as React from "react";
import { Shield, Mail, GitFork, ExternalLink } from "lucide-react";
import { APP_VERSION_WITH_PREFIX } from "@/utils/version";
import Link from "next/link";
interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const platformLinks = [
    { label: "Upload Code", id: "upload" },
    { label: "AI Analysis", id: "ai-config" },
    { label: "Results", id: "results" },
    { label: "Feedback", href: "/feedback" },
  ];

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Changelog", href: "/changelog" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ];

  return (
    <footer
      className={`bg-background border-border/60 relative border-t border-dashed ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Premium gradient border */}
      <div
        className="absolute top-0 right-0 left-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--border)), hsl(var(--glow) / 0.2), hsl(var(--border)), transparent)",
        }}
      />
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-24 w-[400px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--glow) / 0.04) 0%, transparent 70%)",
        }}
      />
      <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-5 flex items-center gap-2.5">
              <Shield className="text-primary h-6 w-6" />
              <span className="font-display text-xl font-medium">
                Code Guardian
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm text-sm leading-relaxed">
              Enterprise-grade static code analysis powered by AI. Comprehensive
              security assessments for modern development teams.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Xenonesis/code-guardian-report"
                target="_blank"
                rel="noopener noreferrer"
                className="border-border text-muted-foreground hover:text-primary hover:border-primary/60 rounded-lg border p-2.5 transition-all duration-200 hover:scale-105"
                aria-label="GitHub"
              >
                <GitFork className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@codeguardian.dev"
                className="border-border text-muted-foreground hover:text-primary hover:border-primary/60 rounded-lg border p-2.5 transition-all duration-200 hover:scale-105"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-foreground mb-5 font-mono text-xs tracking-[0.16em] uppercase">
              Platform
            </h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  {link.id ? (
                    <button
                      onClick={() => scrollToSection(link.id!)}
                      className="text-muted-foreground hover:text-primary font-mono text-xs tracking-[0.08em] uppercase transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      href={link.href!}
                      className="text-muted-foreground hover:text-primary font-mono text-xs tracking-[0.08em] uppercase transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-foreground mb-5 font-mono text-xs tracking-[0.16em] uppercase">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 font-mono text-xs tracking-[0.08em] uppercase transition-colors"
                  >
                    {link.label}
                    {link.href.startsWith("http") && (
                      <ExternalLink className="h-3 w-3" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-border border-t border-dashed">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-muted-foreground font-mono text-[11px] tracking-[0.08em] uppercase">
            © {new Date().getFullYear()} Code Guardian. All rights reserved.
          </p>
          {APP_VERSION_WITH_PREFIX && (
            <span className="text-muted-foreground font-mono text-[11px] tracking-[0.08em] uppercase">
              {APP_VERSION_WITH_PREFIX}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;
