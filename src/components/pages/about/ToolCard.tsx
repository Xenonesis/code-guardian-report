import React, { useState } from "react";
import {
  Star,
  Download,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Tool {
  name: string;
  language: string;
  type: string;
  gradient: string;
  description: string;
  features: string[];
  rating: number;
  downloads: string;
  comingSoon?: boolean;
}

interface ToolCardProps {
  tool: Tool;
  index: number;
  viewMode?: "grid" | "list";
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  viewMode = "grid",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getToolIcon = (type: string) => {
    if (type.toLowerCase().includes("security")) return Shield;
    if (type.toLowerCase().includes("quality")) return Star;
    return Zap;
  };

  const ToolIcon = getToolIcon(tool.type);

  if (viewMode === "list") {
    return (
      <Card
        className="modern-card group hover-float-subtle relative cursor-pointer overflow-hidden transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`h-1 bg-gradient-to-r ${tool.gradient} transition-all duration-300 group-hover:h-2`}
        ></div>

        {tool.comingSoon && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="animate-pulse border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="mr-1 h-3 w-3" />
              Coming Soon
            </Badge>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Icon and Basic Info */}
            <div className="flex items-center gap-4">
              <div
                className={`rounded-xl bg-gradient-to-r p-3 ${tool.gradient} text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <ToolIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-foreground text-xl font-bold transition-colors group-hover:text-blue-600">
                  {tool.name}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {tool.language}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tool.type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="ml-auto flex items-center gap-6">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{tool.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Download className="h-4 w-4" />
                <span className="text-sm">{tool.downloads}</span>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            {tool.description}
          </p>

          {/* Expandable Features */}
          {isExpanded && (
            <div className="animate-fade-in border-border mt-6 border-t pt-6">
              <h5 className="text-foreground mb-3 text-sm font-semibold">
                Key Features:
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {tool.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="group/feature flex cursor-pointer items-start gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${tool.gradient} mt-2 flex-shrink-0 transition-transform group-hover/feature:scale-125`}
                    ></div>
                    <span className="leading-relaxed transition-transform duration-200 group-hover/feature:translate-x-1">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }
  // Grid view (default)
  return (
    <Card
      className="group border-border/50 bg-card/80 relative cursor-pointer overflow-hidden border backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:border-blue-300/50 hover:shadow-2xl hover:shadow-blue-500/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Gradient Top Border with Animation */}
      <div
        className={`h-1 bg-gradient-to-r ${tool.gradient} relative overflow-hidden transition-all duration-500 group-hover:h-4`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        ></div>
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
      </div>

      {/* Coming Soon Badge */}
      {tool.comingSoon && (
        <div className="absolute top-6 right-6 z-10">
          <Badge className="animate-pulse border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:animate-none">
            <Sparkles className="mr-1 h-3 w-3 animate-spin" />
            Coming Soon
          </Badge>
        </div>
      )}

      <CardHeader className="p-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <div
            className={`relative rounded-2xl bg-gradient-to-r p-4 ${tool.gradient} overflow-hidden text-white shadow-xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-6`}
          >
            <ToolIcon className="relative z-10 h-6 w-6" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-full"></div>
            {isHovered && (
              <div className="bg-background/10 absolute inset-0 animate-pulse rounded-2xl"></div>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-100 dark:bg-amber-950/30 dark:group-hover:bg-amber-900/40">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 group-hover:animate-spin" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {tool.rating}
            </span>
          </div>
        </div>

        <CardTitle className="text-foreground mb-4 text-2xl leading-tight font-bold transition-all duration-300 group-hover:text-blue-600">
          {tool.name}
        </CardTitle>

        <div className="mb-4 flex items-center gap-3">
          <Badge
            className={`bg-gradient-to-r px-3 py-1 text-sm font-medium ${tool.gradient} border-0 text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg`}
          >
            {tool.language}
          </Badge>
          <Badge
            variant="outline"
            className="bg-card/80 px-3 py-1 text-sm font-medium backdrop-blur-sm transition-all duration-300 group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:text-blue-600 hover:scale-105"
          >
            {tool.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6 pt-0">
        <p className="text-base leading-relaxed text-slate-600 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
          {tool.description}
        </p>

        <div className="space-y-4">
          <h5 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <div
              className={`h-2 w-2 rounded-full bg-gradient-to-r ${tool.gradient}`}
            ></div>
            Key Features
          </h5>
          <div className="space-y-2">
            {tool.features.slice(0, 4).map((feature, idx) => (
              <div
                key={idx}
                className="group/feature flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
              >
                <div
                  className={`h-2 w-2 rounded-full bg-gradient-to-r ${tool.gradient} mt-2 flex-shrink-0 transition-all duration-300 group-hover/feature:scale-150 group-hover/feature:shadow-lg`}
                ></div>
                <span className="leading-relaxed transition-all duration-300 group-hover/feature:translate-x-2 group-hover/feature:font-medium">
                  {feature}
                </span>
              </div>
            ))}
            {tool.features.length > 4 && (
              <div className="mt-3 inline-block rounded-lg bg-slate-100 px-2 py-1 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-500">
                +{tool.features.length - 4} more features
              </div>
            )}
          </div>
        </div>

        <div className="border-border flex items-center justify-between border-t pt-4 transition-all duration-300 group-hover:border-blue-300">
          <div className="group/download flex cursor-pointer items-center gap-2 rounded-full bg-slate-50 px-3 py-2 transition-all duration-300 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/30">
            <Download className="h-4 w-4 text-slate-500 transition-all duration-300 group-hover/download:animate-bounce group-hover/download:text-blue-500" />
            <span className="text-sm font-medium text-slate-600 transition-all duration-300 group-hover/download:text-blue-600 dark:text-slate-400 dark:group-hover/download:text-blue-400">
              {tool.downloads}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="group/trending flex cursor-pointer items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 transition-all duration-300 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40">
              <TrendingUp className="h-4 w-4 text-emerald-600 transition-all duration-300 group-hover/trending:scale-125 group-hover/trending:text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600 transition-all duration-300 group-hover/trending:text-emerald-500 dark:text-emerald-400">
                Popular
              </span>
            </div>
            {isHovered && (
              <button className="animate-fade-in rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 p-2 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:from-blue-600 hover:to-indigo-600 hover:shadow-xl">
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
