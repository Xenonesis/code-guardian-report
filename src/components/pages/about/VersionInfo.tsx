import React from "react";
import { Code2, Cpu, Layers, Zap } from "lucide-react";
import { APP_VERSION } from "@/utils/version";

export const VersionInfo: React.FC = () => {
  const techStack = [
    {
      name: "React",
      icon: <Code2 className="h-4 w-4" />,
      color: "text-blue-500",
    },
    {
      name: "TypeScript",
      icon: <Layers className="h-4 w-4" />,
      color: "text-blue-600",
    },
    {
      name: "Next.js",
      icon: <Zap className="h-4 w-4" />,
      color: "text-black dark:text-white",
    },
    {
      name: "Tailwind",
      icon: <Cpu className="h-4 w-4" />,
      color: "text-teal-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:gap-12">
      {/* Enhanced Version Badge */}
      <div className="enhanced-card-hover rounded-xl border border-slate-200/50 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 dark:border-slate-700/50 dark:bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-2">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-600 dark:text-slate-400">
              Version
            </span>
            <span className="gradient-text-animated text-lg font-bold">
              {APP_VERSION}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Tech Stack */}
      <div className="enhanced-card-hover rounded-xl border border-slate-200/50 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 dark:border-slate-700/50 dark:bg-slate-900/90">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Built with
          </span>
          <div className="flex items-center gap-3">
            {techStack.map((tech, index) => (
              <div
                key={tech.name}
                className="enhanced-card-hover glow-on-hover group rounded-lg border border-slate-200/50 bg-white/50 px-3 py-2 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 hover:bg-white/80 dark:border-slate-700/50 dark:bg-slate-900/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`${tech.color} transition-transform duration-300 group-hover:scale-125`}
                  >
                    {tech.icon}
                  </span>
                  <span className="text-sm font-medium text-slate-800 transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
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
