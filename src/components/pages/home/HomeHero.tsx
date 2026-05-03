import React from "react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "@/components/layout/HeroSection";
import { ArrowRight } from "lucide-react";

interface HomeHeroProps {
  onStartAnalysis: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onStartAnalysis }) => {
  return (
    <HeroSection
      title="Code Guardian Enterprise"
      description="AI-Powered Security Analysis Platform"
      className="section-glow border-border relative flex min-h-[85vh] flex-col items-center justify-center border-b border-dashed px-4 py-24 sm:px-6 lg:py-32"
    >
      {/* Technical Grid Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl space-y-12 text-center">
        {/* Tagline */}
        {/* Top Technical Marker */}
        <div className="mb-8 flex justify-center">
          <div className="border-primary/30 bg-primary/5 text-primary relative border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase sm:px-3 sm:text-xs sm:tracking-[0.2em]">
            <span className="border-primary absolute -top-1 -left-1 h-2 w-2 border-t border-l"></span>
            <span className="border-primary absolute -right-1 -bottom-1 h-2 w-2 border-r border-b"></span>
            System Status: Online // Monitoring Active
          </div>
        </div>

        <div className="animate-fade-in space-y-8">
          <h1 className="font-display text-foreground xs:text-5xl text-4xl leading-[0.9] tracking-tight uppercase sm:text-7xl md:text-9xl">
            Code{" "}
            <span
              className="text-transparent"
              style={{
                WebkitTextStroke: "2px hsl(var(--primary))",
                color: "transparent",
              }}
            >
              Guardian{" "}
            </span>
            <br />
            <span className="text-primary">Enterprise</span>
          </h1>

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] tracking-wider uppercase sm:gap-4 sm:text-xs sm:tracking-widest">
            <span>[ Static Analysis ]</span>
            <span className="text-primary hidden sm:inline">•</span>
            <span>[ Vulnerability Detection ]</span>
            <span className="text-primary hidden sm:inline">•</span>
            <span>[ Automated Repair ]</span>
          </div>

          <p className="text-muted-foreground border-border mx-auto mt-10 max-w-2xl border-t border-dashed pt-6 font-mono text-sm leading-relaxed sm:text-base">
            Mission-critical code security infrastructure. Deploy autonomous
            vulnerability scanning agents directly to your repository.
          </p>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-delay-1 mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="btn-primary hover:bg-primary/90 border-primary bg-primary text-primary-foreground shadow-primary/20 hover:shadow-primary/30 h-14 w-full rounded-none border px-10 text-base font-bold tracking-wider uppercase shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:w-auto"
          >
            Initiate Scan
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background h-14 w-full rounded-none border bg-transparent px-10 font-mono text-base font-bold tracking-wider uppercase shadow-none transition-all duration-300 hover:scale-105 sm:w-auto"
          >
            View System Demo
          </Button>
        </div>

        {/* System Logs */}
        <div className="animate-fade-in-delay-2 mt-16 flex flex-col items-center gap-4 opacity-60 transition-opacity hover:opacity-100">
          <div className="bg-border h-px w-24"></div>
          <p className="text-muted-foreground font-mono text-[10px] tracking-[0.2em] uppercase">
            System Status: Operational
          </p>
        </div>
      </div>

      {/* Gradient divider */}
      <div
        className="absolute right-0 bottom-0 left-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--glow) / 0.15), transparent)",
        }}
      />
    </HeroSection>
  );
};
