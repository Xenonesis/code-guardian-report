import React from "react";
import { ChevronRight, Info } from "lucide-react";

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const LegalSection: React.FC<LegalSectionProps> = ({
  title,
  children,
  icon = <Info className="h-5 w-5" />,
  className = "",
}) => {
  return (
    <section className={`mb-8 sm:mb-12 ${className}`}>
      {/* Section Header */}
      <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-2 text-white">
          {icon}
        </div>
        <h2 className="gradient-text-animated text-2xl font-bold sm:text-3xl">
          {title}
        </h2>
        <ChevronRight className="ml-auto h-6 w-6 text-slate-400" />
      </div>

      {/* Section Content */}
      <div className="space-y-4 leading-relaxed text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
};

interface LegalSubsectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const LegalSubsection: React.FC<LegalSubsectionProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-foreground mb-3 flex items-center gap-2 text-xl font-semibold">
        <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
        {title}
      </h3>
      <div className="ml-4 space-y-3 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
};

interface LegalListProps {
  items: string[];
  ordered?: boolean;
  className?: string;
}

export const LegalList: React.FC<LegalListProps> = ({
  items,
  ordered = false,
  className = "",
}) => {
  const ListComponent = ordered ? "ol" : "ul";

  return (
    <ListComponent className={`ml-4 space-y-2 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <div className="mt-2 flex-shrink-0">
            {ordered ? (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-bold text-white">
                {index + 1}
              </span>
            ) : (
              <div className="mt-1 h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            )}
          </div>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ListComponent>
  );
};

export default LegalSection;
