"use client";

import * as React from "react";
import { Shield, Mail, GitFork, ArrowUpRight, Terminal } from "lucide-react";
import { APP_VERSION_WITH_PREFIX } from "@/utils/version";
import Link from "next/link";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const platformLinks = [
    { label: "Upload Code", href: "/#upload" },
    { label: "AI Analysis", href: "/#ai-config" },
    { label: "Results", href: "/#results" },
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
      className={`border-border bg-background relative overflow-hidden border-t-2 ${className}`}
    >
      {/* Scan line effect */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              hsl(var(--foreground)) 2px,
              hsl(var(--foreground)) 4px
            )`,
          }}
        />
      </div>

      {/* Hex dump background pattern */}
      <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 overflow-hidden font-mono text-[10px] leading-none opacity-[0.02] select-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap">
            {Array.from({ length: 32 }).map((_, j) => (
              <span key={j}>
                {Math.floor(Math.random() * 16)
                  .toString(16)
                  .toUpperCase()}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Brand Section - Asymmetric layout */}
          <div className="space-y-8 lg:col-span-7">
            {/* Logo with terminal indicator */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="bg-primary/10 border-primary border-2 p-3">
                  <Shield className="text-primary h-6 w-6" />
                </div>
                {/* Blinking cursor */}
                <div className="bg-primary absolute -right-1 -bottom-1 h-2 w-2 animate-pulse" />
              </div>
              <div>
                <h3 className="font-mono text-3xl font-bold tracking-tighter uppercase">
                  Code_Guardian
                </h3>
                <p className="text-muted-foreground mt-1 flex items-center gap-2 font-mono text-xs">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  SYSTEM_OPERATIONAL
                </p>
              </div>
            </div>

            {/* Description with terminal styling */}
            <div className="text-muted-foreground border-primary/30 max-w-lg space-y-2 border-l-2 pl-4 font-mono text-sm">
              <p>{`> Enterprise-grade static code analysis`}</p>
              <p>{`> AI-powered security assessments`}</p>
              <p>{`> Modern development teams`}</p>
              <p className="text-primary animate-pulse">{`> _`}</p>
            </div>

            {/* Social links - Terminal buttons */}
            <div className="flex gap-3">
              <a
                href="https://github.com/Xenonesis/code-guardian-report"
                target="_blank"
                rel="noopener noreferrer"
                className="group border-border hover:border-primary bg-background hover:bg-primary/5 relative flex items-center gap-2 border-2 px-4 py-3 font-mono text-xs transition-all duration-200"
                aria-label="GitHub"
              >
                <GitFork className="h-4 w-4" />
                <span>GITHUB_REPO</span>
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a
                href="mailto:contact@codeguardian.dev"
                className="group border-border hover:border-primary bg-background hover:bg-primary/5 relative flex items-center gap-2 border-2 px-4 py-3 font-mono text-xs transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
                <span>CONTACT_US</span>
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </div>
          </div>

          {/* Links Section - Stacked columns */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-5">
            {/* Platform */}
            <div className="space-y-4">
              <h4 className="text-muted-foreground border-border border-b-2 pb-2 font-mono text-xs tracking-widest uppercase">
                [PLATFORM]
              </h4>
              <ul className="space-y-3">
                {platformLinks.map((link, index) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group text-foreground hover:text-primary flex items-center gap-2 font-mono text-sm transition-colors"
                    >
                      <span className="text-muted-foreground/50 text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="relative">
                        {link.label}
                        <span className="bg-primary absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-muted-foreground border-border border-b-2 pb-2 font-mono text-xs tracking-widest uppercase">
                [COMPANY]
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group text-foreground hover:text-primary flex items-center gap-2 font-mono text-sm transition-colors"
                    >
                      <span className="text-muted-foreground/50 text-xs">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="relative">
                        {link.label}
                        <span className="bg-primary absolute -bottom-0.5 left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="border-border mt-16 border-t-2 pt-8">
          <div className="flex flex-col items-start justify-between gap-4 font-mono text-xs sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                © {new Date().getFullYear()} CODE_GUARDIAN //
                ALL_RIGHTS_RESERVED
              </span>
              {APP_VERSION_WITH_PREFIX && (
                <span className="text-primary/60">
                  [{APP_VERSION_WITH_PREFIX}]
                </span>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-4">
              <span className="flex items-center gap-2">
                <Terminal className="h-3 w-3" />
                STATUS: ONLINE
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">UPTIME: 99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;
