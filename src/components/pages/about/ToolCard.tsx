import React from "react";
import { Star, Download, Shield, Zap, Code2 } from "lucide-react";

export interface Tool {
  name: string;
  language: string;
  type: string;
  gradient?: string; // Kept for interface compatibility but unused
  description: string;
  features: string[];
  rating: number;
  downloads: string;
  installed?: boolean;
  version?: string;
}

interface ToolCardProps {
  tool: Tool;
  index: number;
  viewMode?: "grid" | "list";
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  index,
  viewMode = "grid",
}) => {
  const getToolIcon = (type: string) => {
    if (type.toLowerCase().includes("security")) return Shield;
    if (type.toLowerCase().includes("quality")) return Code2;
    return Zap;
  };

  const ToolIcon = getToolIcon(tool.type);
  const statusNumber = (index + 1).toString().padStart(2, "0");

  if (viewMode === "list") {
    return (
      <div className="border-primary/20 bg-card/30 hover:border-primary/50 group relative overflow-hidden border transition-all duration-300">
        <div className="text-muted-foreground absolute top-0 right-0 p-2 font-mono text-[10px]">
          ID: M-{statusNumber}
        </div>
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="border-primary/20 bg-primary/5 flex h-10 w-10 items-center justify-center border">
                <ToolIcon className="text-primary h-5 w-5" />
              </div>
              <div>
                <h4 className="text-foreground font-mono text-lg font-bold">
                  {tool.name.toUpperCase()}
                </h4>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="text-primary font-mono">
                    TYPE: {tool.type.toUpperCase()}
                  </span>
                  <span>|</span>
                  <span className="font-mono">LANG: {tool.language}</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-4 max-w-3xl font-mono text-sm">
              {">"} {tool.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {tool.features.slice(0, 4).map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-muted/10 border-primary/10 text-muted-foreground border px-2 py-1 font-mono text-[10px]"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="border-primary/10 flex flex-col items-end gap-2 border-t pt-4 md:border-t-0 md:pt-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground">RATING:</span>
              <span className="text-primary">{tool.rating}</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground">INSTALLS:</span>
              <span className="text-primary">{tool.downloads}</span>
            </div>
            {tool.installed ? (
              <div className="mt-2 flex items-center gap-1 border border-green-500/50 bg-green-500/10 px-3 py-1 font-mono text-xs text-green-500">
                <span>🟢 INSTALLED</span>
                {tool.version && (
                  <span className="text-muted-foreground text-[10px]">
                    ({tool.version})
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-2 border border-blue-500/50 bg-blue-500/10 px-3 py-1 font-mono text-xs text-blue-500">
                ⚪ CLI AVAILABLE
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative h-full">
      {/* Decorative corner markers */}
      <div className="border-primary/50 group-hover:border-primary absolute -top-px -left-px h-2 w-2 border-t border-l transition-all group-hover:w-full"></div>
      <div className="border-primary/50 group-hover:border-primary absolute -top-px -right-px h-2 w-2 border-t border-r transition-all group-hover:h-full"></div>
      <div className="border-primary/50 group-hover:border-primary absolute -bottom-px -left-px h-2 w-2 border-b border-l transition-all group-hover:h-full"></div>
      <div className="border-primary/50 group-hover:border-primary absolute -right-px -bottom-px h-2 w-2 border-r border-b transition-all group-hover:w-full"></div>

      <div className="border-primary/20 bg-card/30 hover:bg-primary/5 h-full border p-6 backdrop-blur-sm transition-all">
        <div className="mb-6 flex justify-between">
          <div className="border-primary/20 bg-primary/10 group-hover:border-primary/50 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center border transition-colors">
            <ToolIcon className="text-primary h-6 w-6" />
          </div>
          <div className="text-muted-foreground font-mono text-xs">
            MOD-{statusNumber}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-foreground mb-1 font-mono text-xl font-bold">
            {tool.name.toUpperCase()}
          </h3>
          <div className="text-primary font-mono text-xs">
            {tool.type.toUpperCase()}
          </div>
        </div>

        <p className="text-muted-foreground mb-6 h-20 overflow-hidden font-mono text-xs leading-relaxed">
          {">"} {tool.description}
        </p>

        <div className="border-primary/10 mb-6 space-y-2 border-t pt-4">
          {tool.features.slice(0, 3).map((feature, idx) => (
            <div
              key={idx}
              className="text-muted-foreground flex items-center gap-2 font-mono text-xs"
            >
              <div className="bg-primary/50 h-1 w-1 rounded-none"></div>
              {feature}
            </div>
          ))}
        </div>

        <div className="border-primary/10 mt-auto flex items-center justify-between border-t pt-4 font-mono text-xs">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3" /> {tool.rating}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Download className="h-3 w-3" /> {tool.downloads}
            </span>
          </div>
          {tool.installed ? (
            <span className="flex items-center gap-1 font-bold text-green-500">
              🟢 INSTALLED{" "}
              {tool.version && (
                <span className="text-muted-foreground text-[10px] font-normal">
                  ({tool.version})
                </span>
              )}
            </span>
          ) : (
            <span className="text-blue-500">⚪ CLI AVAILABLE</span>
          )}
        </div>
      </div>
    </div>
  );
};
