import React from "react";
import { Navigation } from "@/components/layout/Navigation";
import { FeatureGrid } from "@/components/features/FeatureGrid";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  benefits?: string[];
}

interface AboutPageLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  className?: string;
  features?: Feature[];
  noContainer?: boolean;
}

export const AboutPageLayout: React.FC<AboutPageLayoutProps> = ({
  children,
  showNavigation = true,
  className = "",
  features,
  noContainer = false,
}) => {
  return (
    <div className={`bg-background min-h-screen ${className}`}>
      {showNavigation && <Navigation />}

      <section aria-label="About content" className="relative z-10">
        {noContainer ? (
          children
        ) : (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        )}
      </section>

      {/* Features Section (if needed) */}
      {features && features.length > 0 && (
        <section className="border-border bg-muted/30 border-t py-16 lg:py-24">
          <FeatureGrid
            features={features}
            title="Comprehensive Security & Quality Analysis"
            subtitle="Everything you need to secure and optimize your codebase in one powerful platform"
            columns={4}
            variant="modern"
          />
        </section>
      )}
    </div>
  );
};

export default AboutPageLayout;
