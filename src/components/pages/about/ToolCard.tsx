import React from 'react';
import { FileCode, Star, Download, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, index }) => {
  return (
    <Card
      key={index}
      className="modern-card group relative overflow-hidden hover-float-strong cursor-pointer"
    >
      {/* Gradient Top Border */}
      <div className={`h-1 bg-gradient-to-r ${tool.gradient} group-hover:h-2 transition-all duration-300`}></div>

      {/* Coming Soon Badge */}
      {tool.comingSoon && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r ${tool.gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 hover-bounce`}>
            <FileCode className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex items-center gap-1 text-amber-500 group-hover:text-amber-400 transition-colors group-hover:scale-110">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current group-hover:animate-pulse" />
            <span className="text-xs sm:text-sm font-medium">{tool.rating}</span>
          </div>
        </div>

        <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:scale-105 leading-tight">
          {tool.name}
        </CardTitle>

        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="secondary" className="text-xs hover-float-subtle cursor-pointer group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
            {tool.language}
          </Badge>
          <Badge variant="outline" className="text-xs hover-float-subtle cursor-pointer group-hover:border-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {tool.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {tool.description}
        </p>

        <div className="space-y-2">
          <h5 className="font-semibold text-sm text-slate-900 dark:text-white">Key Features:</h5>
          <div className="grid grid-cols-1 gap-1">
            {tool.features.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer group/feature">
                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tool.gradient} mt-1.5 flex-shrink-0 group-hover/feature:scale-125 transition-transform`}></div>
                <span className="leading-relaxed group-hover/feature:translate-x-1 transition-transform duration-200">{feature}</span>
              </div>
            ))}
            {tool.features.length > 4 && (
              <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                +{tool.features.length - 4} more features
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group/download">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 group-hover/download:animate-bounce" />
            <span className="text-xs sm:text-sm group-hover/download:font-semibold transition-all">{tool.downloads}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer group/trending">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 group-hover/trending:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-medium group-hover/trending:font-bold transition-all">Popular</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
