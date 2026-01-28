import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, Sparkles } from "lucide-react";

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
  columns?: "auto" | 2 | 3 | 4;
  variant?: "default" | "modern" | "minimal";
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  features,
  title,
  subtitle,
  className = "",
  columns = "auto",
  variant = "modern",
}) => {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  return (
    <section
      className={`relative py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 ${className}`}
    >
      {/* Section Header */}
      {title && (
        <div className="mb-8 px-4 text-center sm:mb-12 sm:px-0 lg:mb-16">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:mb-4 sm:text-4xl lg:text-5xl dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mx-auto max-w-3xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Features Grid */}
      <div
        className={`grid ${getGridCols()} container mx-auto gap-4 px-4 sm:gap-6 lg:gap-8`}
      >
        {features.map((feature, index) => (
          <Card
            key={index}
            className={`group relative cursor-pointer overflow-hidden transition-all duration-500 hover:scale-105 ${
              variant === "modern"
                ? "modern-card border-0 shadow-xl hover:shadow-2xl"
                : "border bg-white/90 shadow-lg backdrop-blur-sm hover:shadow-xl dark:bg-slate-800/90"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Gradient Top Border */}
            {feature.gradient && (
              <div
                className={`h-1 bg-gradient-to-r ${feature.gradient} transition-all duration-300 group-hover:h-2`}
              ></div>
            )}

            {/* Coming Soon Badge */}
            {feature.comingSoon && (
              <div className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
                <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 text-xs font-medium text-white">
                  <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="xs:inline hidden">Soon</span>
                </div>
              </div>
            )}

            <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
              {/* Icon */}
              <div className="mb-3 flex items-center justify-between sm:mb-4">
                <div
                  className={`rounded-lg p-2 transition-all duration-300 group-hover:scale-110 sm:rounded-xl sm:p-3 ${
                    feature.gradient
                      ? `bg-gradient-to-r ${feature.gradient} text-white shadow-lg`
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="h-5 w-5 sm:h-6 sm:w-6">{feature.icon}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 transition-colors group-hover:text-slate-600 group-hover:opacity-100 sm:h-5 sm:w-5 dark:group-hover:text-slate-300" />
              </div>

              {/* Title */}
              <CardTitle className="text-lg leading-tight font-bold text-slate-900 transition-colors duration-300 group-hover:text-blue-600 sm:text-xl dark:text-white dark:group-hover:text-blue-400">
                {feature.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 p-4 pt-0 sm:space-y-4 sm:p-6">
              {/* Description */}
              <CardDescription className="text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                {feature.description}
              </CardDescription>

              {/* Benefits List */}
              {feature.benefits && (
                <ul className="space-y-1.5 sm:space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-start gap-2 text-xs text-slate-600 sm:text-sm dark:text-slate-400"
                    >
                      <div
                        className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                          feature.gradient
                            ? `bg-gradient-to-r ${feature.gradient}`
                            : "bg-blue-500"
                        }`}
                      ></div>
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>

            {/* Hover Effect Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:to-blue-900/20"></div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
