import React from 'react';
import { ChevronRight, Info } from 'lucide-react';

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
  className = ''
}) => {
  return (
    <section className={`mb-8 sm:mb-12 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
          {icon}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold gradient-text-animated">
          {title}
        </h2>
        <ChevronRight className="h-6 w-6 text-slate-400 ml-auto" />
      </div>

      {/* Section Content */}
      <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
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
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
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
  className = ''
}) => {
  const ListComponent = ordered ? 'ol' : 'ul';
  
  return (
    <ListComponent className={`space-y-2 ml-4 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-2">
            {ordered ? (
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
                {index + 1}
              </span>
            ) : (
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1"></div>
            )}
          </div>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ListComponent>
  );
};

export default LegalSection;
