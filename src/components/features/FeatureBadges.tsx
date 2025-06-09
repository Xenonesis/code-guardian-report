import React from 'react';

interface Badge {
  icon: React.ReactNode;
  text: string;
  color?: string;
}

interface FeatureBadgesProps {
  badges: Badge[];
  className?: string;
}

export const FeatureBadges: React.FC<FeatureBadgesProps> = ({
  badges,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-slate-500 dark:text-slate-400 animate-fade-in animate-stagger-2 ${className}`}>
      {badges.map((badge, index) => (
        <div 
          key={index}
          className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 sm:px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover-lift animate-pulse-glow cursor-pointer group"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="group-hover:animate-bounce-subtle transition-all" aria-hidden="true">
            {badge.icon}
          </div>
          <span className={`group-hover:${badge.color || 'text-blue-600'} transition-colors`}>
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FeatureBadges;
