import React from "react";

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
  className = "",
}) => {
  return (
    <div
      className={`animate-fade-in animate-stagger-2 flex flex-col items-center justify-center gap-3 text-sm text-slate-500 sm:flex-row sm:gap-6 dark:text-slate-400 ${className}`}
    >
      {badges.map((badge, index) => (
        <div
          key={index}
          className="hover-lift animate-pulse-glow group flex cursor-pointer items-center gap-2 rounded-full bg-white/60 px-3 py-2 backdrop-blur-sm transition-all duration-300 hover:bg-white/80 sm:px-4 dark:bg-slate-800/60 dark:hover:bg-slate-800/80"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div
            className="group-hover:animate-bounce-subtle transition-all"
            aria-hidden="true"
          >
            {badge.icon}
          </div>
          <span
            className={`group-hover:${badge.color || "text-blue-600"} transition-colors`}
          >
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FeatureBadges;
