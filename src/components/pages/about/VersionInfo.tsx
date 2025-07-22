import React from 'react';
import { Code2, Cpu, Layers, Zap } from 'lucide-react';
import { APP_VERSION } from '@/utils/version';

export const VersionInfo: React.FC = () => {
  const techStack = [
    { name: 'React', icon: <Code2 className="h-4 w-4" />, color: 'text-blue-500' },
    { name: 'TypeScript', icon: <Layers className="h-4 w-4" />, color: 'text-blue-600' },
    { name: 'Vite', icon: <Zap className="h-4 w-4" />, color: 'text-purple-500' },
    { name: 'Tailwind', icon: <Cpu className="h-4 w-4" />, color: 'text-teal-500' }
  ];

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12">
      {/* Enhanced Version Badge */}
      <div className="glass-card-ultra px-6 py-4 enhanced-card-hover">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 block">Version</span>
            <span className="text-lg font-bold gradient-text-animated">{APP_VERSION}</span>
          </div>
        </div>
      </div>

      {/* Enhanced Tech Stack */}
      <div className="glass-card-ultra px-6 py-4 enhanced-card-hover">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Built with</span>
          <div className="flex items-center gap-3">
            {techStack.map((tech, index) => (
              <div
                key={tech.name}
                className="glass-card-ultra px-3 py-2 enhanced-card-hover glow-on-hover group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2">
                  <span className={`${tech.color} group-hover:scale-125 transition-transform duration-300`}>
                    {tech.icon}
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
                    {tech.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
