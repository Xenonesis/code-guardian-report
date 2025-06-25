import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Sparkles } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  benefits?: string[];
  comingSoon?: boolean;
}

interface FeatureGridProps {
  features: Feature[];
  title?: string;
  subtitle?: string;
  className?: string;
  columns?: 'auto' | 2 | 3 | 4;
  variant?: 'default' | 'modern' | 'minimal';
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  features,
  title,
  subtitle,
  className = '',
  columns = 'auto',
  variant = 'modern'
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <section className={`py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 relative ${className}`}>
      {/* Section Header */}
      {title && (
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 px-4 sm:px-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Features Grid */}
      <div className={`grid ${getGridCols()} gap-4 sm:gap-6 lg:gap-8 container mx-auto px-4`}>
        {features.map((feature, index) => (
          <Card
            key={index}
            className={`group relative overflow-hidden transition-all duration-500 hover:scale-105 cursor-pointer ${
              variant === 'modern'
                ? 'modern-card border-0 shadow-xl hover:shadow-2xl'
                : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border shadow-lg hover:shadow-xl'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}

          >
            {/* Gradient Top Border */}
            {feature.gradient && (
              <div className={`h-1 bg-gradient-to-r ${feature.gradient} group-hover:h-2 transition-all duration-300`}></div>
            )}

            {/* Coming Soon Badge */}
            {feature.comingSoon && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden xs:inline">Soon</span>
                </div>
              </div>
            )}

            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              {/* Icon */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group-hover:scale-110 ${
                  feature.gradient
                    ? `bg-gradient-to-r ${feature.gradient} text-white shadow-lg`
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <div className="h-5 w-5 sm:h-6 sm:w-6">
                    {feature.icon}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100" />
              </div>

              {/* Title */}
              <CardTitle
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight"
              >
                {feature.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              {/* Description */}
              <CardDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </CardDescription>

              {/* Benefits List */}
              {feature.benefits && (
                <ul className="space-y-1.5 sm:space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        feature.gradient
                          ? `bg-gradient-to-r ${feature.gradient}`
                          : 'bg-blue-500'
                      }`}></div>
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-50/50 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
