import React, { useState } from "react";
import {
  Shield,
  Brain,
  Zap,
  Database,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  color: string;
  gradient: string;
}

export const EnhancedFeatureShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string>("security");

  const features: Feature[] = [
    {
      id: "security",
      icon: <Shield className="h-6 w-6" />,
      title: "Advanced Security Analysis",
      description:
        "Comprehensive vulnerability detection using OWASP standards and real-time threat intelligence.",
      benefits: [
        "OWASP Top 10 Coverage",
        "CVE Database Integration",
        "Zero-day Detection",
        "Compliance Reporting",
      ],
      color: "emerald",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "ai",
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Insights",
      description:
        "Next-generation AI with GPT-4 and Claude integration for intelligent code recommendations.",
      benefits: [
        "Smart Fix Suggestions",
        "Contextual Analysis",
        "Auto-generated Prompts",
        "Learning Algorithms",
      ],
      color: "purple",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      id: "performance",
      icon: <Zap className="h-6 w-6" />,
      title: "Performance Optimization",
      description:
        "Lightning-fast processing with real-time analytics and comprehensive performance tracking.",
      benefits: [
        "Real-time Processing",
        "Performance Metrics",
        "Bundle Analysis",
        "Optimization Insights",
      ],
      color: "amber",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      id: "storage",
      icon: <Database className="h-6 w-6" />,
      title: "Persistent Storage",
      description:
        "Advanced results storage with cross-tab synchronization and intelligent history management.",
      benefits: [
        "Persistent Results",
        "Cross-tab Sync",
        "Data Compression",
        "Export Capabilities",
      ],
      color: "blue",
      gradient: "from-blue-500 to-indigo-600",
    },
  ];

  const activeFeatureData =
    features.find((f) => f.id === activeFeature) || features[0];

  return (
    <section className="relative overflow-hidden py-20">
      {/* Enhanced Background Elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="float-animation absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl"></div>
        <div className="float-animation delay-2s absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-2xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          {/* Enhanced Header */}
          <div className="mb-16 text-center">
            <div className="mx-auto mb-8 max-w-4xl rounded-xl border border-slate-200/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 dark:border-slate-700/50 dark:bg-slate-900/90">
              <h3 className="gradient-text-animated mb-6 text-4xl font-bold sm:text-5xl">
                Platform Capabilities
              </h3>
              <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300">
                Discover the powerful features that make Code Guardian the
                ultimate security analysis platform
              </p>
            </div>
          </div>

          <div className="grid items-start gap-12 lg:grid-cols-2">
            {/* Enhanced Feature Tabs */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <Card
                  key={feature.id}
                  className={`enhanced-card-hover glow-on-hover cursor-pointer rounded-xl border p-6 backdrop-blur-sm transition-all duration-700 ${
                    activeFeature === feature.id
                      ? "border-2 border-blue-400/50 bg-white/90 shadow-2xl shadow-blue-500/30 dark:border-blue-500/50 dark:bg-slate-900/90"
                      : "border-slate-200/50 bg-white/90 shadow-sm hover:border-slate-300/50 dark:border-slate-700/50 dark:bg-slate-900/90 dark:hover:border-white/20"
                  }`}
                  onClick={() => setActiveFeature(feature.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Enhanced Icon Container */}
                      <div
                        className={`relative rounded-2xl bg-gradient-to-r p-4 ${feature.gradient} text-white shadow-xl ${
                          activeFeature === feature.id
                            ? "scale-110 rotate-3"
                            : ""
                        } transition-all duration-500`}
                      >
                        {feature.icon}
                        {activeFeature === feature.id && (
                          <div className="bg-background/20 absolute inset-0 animate-pulse rounded-2xl"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h4
                          className={`mb-3 text-xl font-bold ${
                            activeFeature === feature.id
                              ? "gradient-text-animated"
                              : "text-foreground"
                          } transition-all duration-500`}
                        >
                          {feature.title}
                        </h4>
                        <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                          {feature.description}
                        </p>
                      </div>

                      {/* Enhanced Arrow */}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          activeFeature === feature.id
                            ? "scale-110 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-700"
                        } transition-all duration-500`}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Active Feature Details */}
            <div className="relative lg:sticky lg:top-8">
              <Card className="enhanced-card-hover overflow-hidden rounded-xl border border-slate-200/50 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 dark:border-slate-700/50 dark:bg-slate-900/90">
                {/* Enhanced Background Decoration */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${activeFeatureData.gradient} opacity-10`}
                ></div>
                <div className="float-animation absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 blur-3xl"></div>
                <div className="float-animation delay-2s absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/25 to-teal-500/25 blur-2xl"></div>

                {/* Particle System */}
                <div className="particle-system">
                  <div
                    className="particle"
                    style={{ left: "10%", animationDelay: "0s" }}
                  ></div>
                  <div
                    className="particle"
                    style={{ left: "90%", animationDelay: "3s" }}
                  ></div>
                  <div
                    className="particle"
                    style={{ left: "50%", animationDelay: "6s" }}
                  ></div>
                </div>

                <CardContent className="relative z-10 p-10">
                  {/* Enhanced Header */}
                  <div className="mb-8 flex items-center gap-6">
                    <div
                      className={`rounded-3xl bg-gradient-to-r p-5 ${activeFeatureData.gradient} animate-pulse text-white shadow-2xl`}
                    >
                      <div className="text-2xl">{activeFeatureData.icon}</div>
                    </div>
                    <div>
                      <h4 className="gradient-text-animated mb-2 text-3xl font-bold">
                        {activeFeatureData.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 animate-pulse text-yellow-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Featured Capability
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Description */}
                  <div className="mb-8 rounded-xl border border-slate-200/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 dark:border-slate-700/50 dark:bg-slate-900/90">
                    <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-200">
                      {activeFeatureData.description}
                    </p>
                  </div>

                  {/* Enhanced Benefits Section */}
                  <div className="space-y-6">
                    <h5 className="text-foreground flex items-center gap-3 text-xl font-bold">
                      <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 p-2">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      Key Benefits
                    </h5>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {activeFeatureData.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="enhanced-card-hover group rounded-xl border border-slate-200/50 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-slate-300/50 dark:border-slate-700/50 dark:bg-slate-900/90"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`h-3 w-3 rounded-full bg-gradient-to-r ${activeFeatureData.gradient} transition-transform duration-300 group-hover:scale-125`}
                            ></div>
                            <span className="text-foreground/80 group-hover:text-foreground font-medium transition-colors duration-300">
                              {benefit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeatureShowcase;
