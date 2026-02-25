import React from "react";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  titleId?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  description,
  children,
  className = "",
  titleId = "hero-title",
}) => {
  return (
    <section
      className={`border-primary/20 relative flex min-h-[50vh] flex-col justify-center overflow-hidden border-b-2 bg-transparent pt-20 pb-16 ${className}`}
      aria-labelledby={titleId}
    >
      {/* Technical Grid Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, currentColor 1px, transparent 1px), linear-gradient(180deg, currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Corner Accents */}
      <div className="border-primary/40 absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2" />
      <div className="border-primary/40 absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2" />
      <div className="border-primary/40 absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2" />
      <div className="border-primary/40 absolute right-0 bottom-0 h-8 w-8 border-r-2 border-b-2" />

      {/* Decorative vertical line */}
      <div className="bg-border absolute top-0 bottom-0 left-[10%] hidden w-px lg:block" />
      <div className="bg-border absolute top-0 right-[10%] bottom-0 hidden w-px lg:block" />

      <div className="relative z-10 container mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="bg-primary/10 border-primary/30 text-primary group relative mb-6 inline-block overflow-hidden border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase sm:px-3 sm:text-xs sm:tracking-[0.2em]">
          <span className="relative z-10">System_Access_Authorized</span>
          <div className="bg-primary/20 absolute inset-0 -translate-x-full transform transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
        </div>

        {title && (
          <h1
            id={titleId}
            className="xs:text-3xl mb-6 font-mono text-2xl font-bold tracking-tight uppercase sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-primary/40 mb-2 block text-lg font-normal tracking-normal normal-case opacity-70 sm:text-xl">
              Enterprise_Grade
            </span>
            {title}
          </h1>
        )}

        {description && (
          <p className="text-muted-foreground border-primary/20 mx-auto mt-6 max-w-2xl border-l-2 pl-4 text-left font-mono text-sm leading-relaxed sm:text-base md:border-l-0 md:pl-0 md:text-center">
            {description}
          </p>
        )}

        {children && <div className="mt-12 w-full">{children}</div>}
      </div>
    </section>
  );
};
