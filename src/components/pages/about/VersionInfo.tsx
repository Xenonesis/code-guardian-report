import React from 'react';
import { Code2, Cpu, Layers, Zap } from 'lucide-react';

export const VersionInfo: React.FC = () => {
  const techStack = [
    { name: 'React', icon: <Code2 className="h-4 w-4" />, color: 'text-blue-500' },
    { name: 'TypeScript', icon: <Layers className="h-4 w-4" />, color: 'text-blue-600' },
    { name: 'Vite', icon: <Zap className="h-4 w-4" />, color: 'text-purple-500' },
    { name: 'Tailwind', icon: <Cpu className="h-4 w-4" />, color: 'text-teal-500' }
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Version</span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">3.3.0</span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Built with</span>
        <div className="flex items-center gap-2">
          {techStack.map((tech, index) => (
            <div key={tech.name} className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-700 rounded-md shadow-sm">
              <span className={tech.color}>{tech.icon}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
