import React from "react";
import { Sparkles, Stars, Zap, Shield, Code, Bot } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  titleId?: string;
  variant?: "default" | "minimal" | "gradient" | "ultra";
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  description,
  children,
  className = "",
  titleId = "hero-title",
  variant = "default",
}) => {
  return (
    <section
      className={`relative overflow-hidden py-12 text-center sm:py-16 md:py-20 lg:py-24 xl:py-32 ${className}`}
      aria-labelledby={titleId}
    >
      {/* Enhanced Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Multi-layered Gradient Orbs with Enhanced Animations */}
        <div className="animate-float-slow absolute top-1/4 left-1/4 h-40 w-40 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-indigo-500/30 blur-3xl sm:h-56 sm:w-56 md:h-80 md:w-80"></div>
        <div className="animate-float-delayed absolute right-1/4 bottom-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-cyan-500/25 blur-3xl sm:h-48 sm:w-48 md:h-64 md:w-64"></div>
        <div className="animate-pulse-slow absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-orange-500/15 blur-3xl sm:h-80 sm:w-80 md:h-[28rem] md:w-[28rem]"></div>

        {/* Additional Floating Orbs for Depth */}
        <div className="animate-float float-animation delay-2s absolute top-16 right-16 h-24 w-24 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 blur-2xl sm:h-32 sm:w-32"></div>
        <div className="animate-float float-animation delay-4s absolute bottom-16 left-16 h-28 w-28 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-2xl sm:h-36 sm:w-36"></div>

        {/* Enhanced Floating Icons with More Variety */}
        <div className="animate-float absolute top-20 left-12 sm:top-24 sm:left-24">
          <Shield className="h-5 w-5 text-blue-500/50 sm:h-7 sm:w-7" />
        </div>
        <div className="animate-float-delayed absolute top-32 right-12 sm:top-40 sm:right-40">
          <Code className="h-6 w-6 text-purple-500/50 sm:h-9 sm:w-9" />
        </div>
        <div className="animate-bounce-slow absolute bottom-32 left-12 sm:bottom-40 sm:left-40">
          <Bot className="h-6 w-6 text-emerald-500/50 sm:h-8 sm:w-8" />
        </div>
        <div className="animate-float absolute top-1/3 right-8 sm:right-20">
          <Sparkles className="h-4 w-4 text-cyan-500/40 sm:h-6 sm:w-6" />
        </div>
        <div className="animate-float-delayed absolute right-1/3 bottom-1/3">
          <Stars className="h-5 w-5 text-pink-500/40 sm:h-7 sm:w-7" />
        </div>
        <div className="animate-bounce-slow absolute top-2/3 left-8 sm:left-20">
          <Zap className="h-5 w-5 text-amber-500/40 sm:h-7 sm:w-7" />
        </div>
      </div>

      <div className="mobile-container relative z-10 container mx-auto">
        {/* Enhanced Title with Ultra-Modern Typography */}
        {title && (
          <h1
            id={titleId}
            className={`text-responsive-2xl mb-6 px-4 leading-tight font-bold tracking-tight sm:mb-8 sm:px-0 lg:mb-10 ${
              variant === "gradient" || variant === "ultra"
                ? "gradient-text-animated text-ultra-gradient"
                : "text-foreground"
            }`}
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <div className="glass-card-ultra mx-auto mb-6 max-w-4xl px-6 py-4 sm:mb-8 sm:px-8 sm:py-6 lg:mb-10">
            <h2 className="text-responsive-lg leading-relaxed font-semibold text-slate-800 dark:text-slate-200">
              {subtitle}
            </h2>
          </div>
        )}

        {description && (
          <div className="mx-auto mb-8 max-w-5xl px-4 sm:mb-10 sm:px-0 lg:mb-14">
            <p className="text-responsive-base border-border/60 bg-background/40 text-foreground/80 rounded-2xl border p-6 leading-relaxed shadow-xl backdrop-blur-xl sm:p-8">
              {description}
            </p>
          </div>
        )}

        {/* Enhanced Children Container */}
        <div className="space-y-8 px-4 sm:space-y-10 sm:px-0 lg:space-y-12">
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
