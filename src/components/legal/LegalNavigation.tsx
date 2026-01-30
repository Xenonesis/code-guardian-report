import React from "react";
import { Shield, Scale, ArrowRight } from "lucide-react";

interface LegalNavigationProps {
  currentSection?: string;
}

export const LegalNavigation: React.FC<LegalNavigationProps> = ({
  currentSection = "privacy",
}) => {
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

  const legalPages = [
    {
      id: "privacy",
      title: "Privacy Policy",
      description: "How we protect and handle your data",
      icon: <Shield className="h-5 w-5" />,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      id: "terms",
      title: "Terms of Service",
      description: "Rules and guidelines for using our service",
      icon: <Scale className="h-5 w-5" />,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const otherPage = legalPages.find((page) => page.id !== currentSection);

  if (!otherPage) return null;

  return (
    <div className="border-border mt-12 border-t pt-8">
      <div className="mb-6 text-center">
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          Related Legal Documents
        </h3>
        <p className="text-muted-foreground">
          Complete your understanding of our policies
        </p>
      </div>

      <button
        onClick={() => scrollToSection(otherPage.id)}
        className="glass-card-ultra enhanced-card-hover glow-on-hover group block w-full rounded-2xl p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className={`bg-gradient-to-r p-3 ${otherPage.gradient} rounded-xl text-white transition-transform duration-300 group-hover:scale-110`}
          >
            {otherPage.icon}
          </div>

          <div className="flex-1">
            <h4 className="text-foreground mb-1 text-lg font-semibold transition-colors duration-300 group-hover:text-blue-600">
              {otherPage.title}
            </h4>
            <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
              {otherPage.description}
            </p>
          </div>

          <ArrowRight className="text-muted-foreground h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-500" />
        </div>
      </button>
    </div>
  );
};

export default LegalNavigation;
