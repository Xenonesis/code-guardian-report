import React from "react";
import { Navigation } from "@/components/layout/Navigation";

interface PageLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  noContainer?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showNavigation = true,
  noContainer = false,
}) => {
  return (
    <div className="bg-background relative min-h-screen w-full overflow-x-clip">
      {showNavigation && <Navigation />}
      <section
        aria-label="Page content"
        className={noContainer ? "" : "container mx-auto px-4 sm:px-6 lg:px-8"}
      >
        {children}
      </section>
    </div>
  );
};
