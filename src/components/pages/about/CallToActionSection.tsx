import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CallToActionSectionProps {
  className?: string;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  className = "",
}) => {
  const scrollToHome = () => {
    const homeSection = document.getElementById("home");
    if (homeSection) {
      homeSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className={`relative py-16 text-center sm:py-20 ${className}`}>
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="float-animation absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/20 to-pink-500/30 blur-3xl"></div>
        <div className="float-animation delay-2s absolute top-1/3 right-1/4 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-500/25 to-teal-500/25 blur-2xl"></div>
        <div className="float-animation delay-4s absolute bottom-1/4 left-1/3 h-24 w-24 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <Card className="glass-card-ultra enhanced-card-hover glow-on-hover group relative mx-auto max-w-4xl overflow-hidden">
          {/* Enhanced Animated Gradient Overlay */}
          <div className="animated-border absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>

          {/* Enhanced Floating Elements */}
          <div className="float-animation absolute top-6 right-6 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30 blur-2xl transition-transform duration-1000 group-hover:scale-150"></div>
          <div className="float-animation delay-2s absolute bottom-6 left-6 h-16 w-16 rounded-full bg-gradient-to-tr from-emerald-500/25 to-teal-500/25 blur-xl transition-transform delay-200 duration-1000 group-hover:scale-125"></div>

          {/* Particle System */}
          <div className="particle-system opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <div
              className="particle"
              style={{ left: "20%", animationDelay: "0s" }}
            ></div>
            <div
              className="particle"
              style={{ left: "80%", animationDelay: "3s" }}
            ></div>
            <div
              className="particle"
              style={{ left: "50%", animationDelay: "6s" }}
            ></div>
          </div>

          <CardContent className="relative z-10 p-10 sm:p-16">
            <div className="mx-auto max-w-3xl">
              {/* Enhanced Title */}
              <h3 className="gradient-text-animated mb-8 text-4xl font-bold transition-transform duration-500 group-hover:scale-105 sm:text-5xl">
                Ready to Secure Your Code?
              </h3>

              {/* Enhanced Description */}
              <div className="glass-card-ultra mb-10 p-6">
                <p className="text-xl leading-relaxed text-slate-800 dark:text-slate-200">
                  Start analyzing your codebase today with our comprehensive
                  security and quality tools. Join thousands of developers who
                  trust Code Guardian for their security needs.
                </p>
              </div>

              {/* Enhanced CTA Button */}
              <div className="relative mb-12 inline-block">
                <Button
                  onClick={scrollToHome}
                  size="lg"
                  className="btn-enhanced-cta hover:shadow-3xl rounded-3xl border-0 px-12 py-6 text-xl font-bold text-white shadow-2xl transition-all duration-500 hover:scale-110 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-600"
                >
                  <span className="relative z-10 flex items-center gap-4">
                    Get Started Now
                    <Download className="h-6 w-6 transition-transform duration-300 group-hover:animate-bounce" />
                  </span>
                </Button>
              </div>

              {/* Enhanced Trust Indicators */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  {
                    label: "25,000+ Developers",
                    color: "from-green-500 to-emerald-500",
                    delay: "0s",
                  },
                  {
                    label: "150,000+ Vulnerabilities Found",
                    color: "from-blue-500 to-indigo-500",
                    delay: "0.3s",
                  },
                  {
                    label: "Free Forever",
                    color: "from-purple-500 to-pink-500",
                    delay: "0.6s",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="glass-card-ultra enhanced-card-hover group p-4"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className={`h-3 w-3 bg-gradient-to-r ${item.color} animate-pulse rounded-full transition-transform duration-300 group-hover:scale-125`}
                      ></div>
                      <span className="text-sm font-semibold text-slate-700 transition-colors duration-300 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
