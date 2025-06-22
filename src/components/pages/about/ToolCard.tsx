import React, { useState } from 'react';
import { FileCode, Star, Download, TrendingUp, Sparkles, ChevronDown, ChevronUp, ExternalLink, Shield, Zap } from 'lucide-react';
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
  viewMode?: 'grid' | 'list';
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, index, viewMode = 'grid' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const getToolIcon = (type: string) => {
    if (type.toLowerCase().includes('security')) return Shield;
    if (type.toLowerCase().includes('quality')) return Star;
    return Zap;
  };
  
  const ToolIcon = getToolIcon(tool.type);
  
  if (viewMode === 'list') {
    return (
      <Card 
        className="modern-card group relative overflow-hidden hover-float-subtle cursor-pointer transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`h-1 bg-gradient-to-r ${tool.gradient} group-hover:h-2 transition-all duration-300`}></div>
        
        {tool.comingSoon && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Icon and Basic Info */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.gradient} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <ToolIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{tool.language}</Badge>
                  <Badge variant="outline" className="text-xs">{tool.type}</Badge>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 ml-auto">
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
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
            {tool.description}
          </p>
          
          {/* Expandable Features */}
          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
              <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-3">Key Features:</h5>
              <div className="grid grid-cols-2 gap-2">
                {tool.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200 cursor-pointer group/feature">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tool.gradient} mt-2 flex-shrink-0 group-hover/feature:scale-125 transition-transform`}></div>
                    <span className="leading-relaxed group-hover/feature:translate-x-1 transition-transform duration-200">{feature}</span>
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
      className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 hover:-translate-y-2 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Gradient Top Border with Animation */}
      <div className={`h-1 bg-gradient-to-r ${tool.gradient} group-hover:h-4 transition-all duration-500 relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>

      {/* Coming Soon Badge */}
      {tool.comingSoon && (
        <div className="absolute top-6 right-6 z-10">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg animate-pulse hover:animate-none hover:scale-110 transition-transform duration-300">
            <Sparkles className="h-3 w-3 mr-1 animate-spin" />
            Coming Soon
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className={`relative p-4 rounded-2xl bg-gradient-to-r ${tool.gradient} text-white shadow-xl group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 overflow-hidden`}>
            <ToolIcon className="h-6 w-6 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            {isHovered && (
              <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>
            )}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-full group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40 transition-all duration-300 group-hover:scale-110">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400 group-hover:animate-spin" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{tool.rating}</span>
          </div>
        </div>

        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 leading-tight mb-4">
          {tool.name}
        </CardTitle>

        <div className="flex items-center gap-3 mb-4">
          <Badge 
            className={`px-3 py-1 text-sm font-medium bg-gradient-to-r ${tool.gradient} text-white border-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}
          >
            {tool.language}
          </Badge>
          <Badge 
            variant="outline" 
            className="px-3 py-1 text-sm font-medium bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm group-hover:border-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-all duration-300 hover:scale-105"
          >
            {tool.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6 pt-0">
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
          {tool.description}
        </p>

        <div className="space-y-4">
          <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tool.gradient}`}></div>
            Key Features
          </h5>
          <div className="space-y-2">
            {tool.features.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-300 cursor-pointer group/feature p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${tool.gradient} mt-2 flex-shrink-0 group-hover/feature:scale-150 group-hover/feature:shadow-lg transition-all duration-300`}></div>
                <span className="leading-relaxed group-hover/feature:translate-x-2 group-hover/feature:font-medium transition-all duration-300">{feature}</span>
              </div>
            ))}
            {tool.features.length > 4 && (
              <div className="text-sm text-slate-500 dark:text-slate-500 mt-3 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg inline-block">
                +{tool.features.length - 4} more features
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-all duration-300">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 cursor-pointer group/download">
            <Download className="h-4 w-4 text-slate-500 group-hover/download:text-blue-500 group-hover/download:animate-bounce transition-all duration-300" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover/download:text-blue-600 dark:group-hover/download:text-blue-400 transition-all duration-300">{tool.downloads}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full cursor-pointer group/trending hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all duration-300">
              <TrendingUp className="h-4 w-4 text-emerald-600 group-hover/trending:scale-125 group-hover/trending:text-emerald-500 transition-all duration-300" />
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover/trending:text-emerald-500 transition-all duration-300">Popular</span>
            </div>
            {isHovered && (
              <button className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl animate-fade-in hover:scale-110">
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
