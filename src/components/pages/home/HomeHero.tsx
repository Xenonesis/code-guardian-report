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
      title=""
      description=""
      className="section-glow border-border relative flex min-h-[80vh] flex-col items-center justify-center border-b border-dashed px-4 py-20 sm:px-6"
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
          <div className="border-primary/30 bg-primary/5 text-primary relative border px-2 py-1 sm:px-3 font-mono text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] uppercase">
            <span className="border-primary absolute -top-1 -left-1 h-2 w-2 border-t border-l"></span>
            <span className="border-primary absolute -right-1 -bottom-1 h-2 w-2 border-r border-b"></span>
            System Status: Online // Monitoring Active
          </div>
        </div>

        <div className="animate-fade-in space-y-6">
          <h1 className="font-display text-foreground text-4xl leading-none tracking-tight uppercase sm:text-6xl md:text-8xl">
            Code{" "}
            <span
              className="text-transparent"
              style={{
                WebkitTextStroke: "1px hsl(var(--primary))",
                color: "transparent",
              }}
            >
              Guardian
            </span>
            <br />
            <span className="text-primary">Enterprise</span>
          </h1>

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-[10px] sm:text-xs tracking-wider sm:tracking-widest uppercase">
            <span>[ Static Analysis ]</span>
            <span className="text-primary hidden sm:inline">•</span>
            <span>[ Vulnerability Detection ]</span>
            <span className="text-primary hidden sm:inline">•</span>
            <span>[ Automated Repair ]</span>
          </div>

          <p className="text-muted-foreground border-border mx-auto mt-8 max-w-2xl border-t border-dashed pt-4 font-mono text-sm leading-relaxed">
            Mission-critical code security infrastructure. Deploy autonomous
            vulnerability scanning agents directly to your repository.
          </p>
        </div>

        {/* CTA */}
        <div className="animate-fade-in-delay-1 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            onClick={onStartAnalysis}
            size="lg"
            className="btn-primary hover:bg-primary/90 border-primary bg-primary text-primary-foreground h-14 w-full rounded-none border px-8 text-base font-bold tracking-wider uppercase shadow-none hover:translate-y-0 sm:w-auto"
          >
            Initiate Scan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background h-14 w-full rounded-none border bg-transparent px-8 font-mono text-base font-bold tracking-wider uppercase shadow-none sm:w-auto"
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
