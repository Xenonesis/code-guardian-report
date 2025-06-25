import React from 'react';
import { Navigation } from '@/components/Navigation';
import { FeatureGrid } from '@/components/features/FeatureGrid';
import { Heart, Shield, Lock, Github, Linkedin, Instagram, Mail } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient?: string;
  benefits?: string[];
}

interface PageLayoutProps {
  children: React.ReactNode;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  showNavigation?: boolean;
  className?: string;
  features?: Feature[];
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  isDarkMode = false,
  toggleDarkMode,
  showNavigation = true,
  className = '',
  features
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20 transition-all duration-500 ${className}`}>
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/10 via-teal-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>
      {showNavigation && toggleDarkMode && (
        <Navigation isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      )}

      <main>
        {children}
      </main>

      {/* Features Section in Footer */}
      {features && features.length > 0 && (
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 py-16 lg:py-24">
          <FeatureGrid
            features={features}
            title="Comprehensive Security & Quality Analysis"
            subtitle="Everything you need to secure and optimize your codebase in one powerful platform"
            columns={4}
            variant="modern"
          />
        </section>
      )}

      {/* Enhanced Modern Footer */}
      <footer className="relative border-t border-white/20 dark:border-white/10 bg-gradient-to-r from-slate-50/95 via-blue-50/95 to-purple-50/95 dark:from-slate-900/95 dark:via-blue-950/95 dark:to-purple-950/95 backdrop-blur-xl overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          <div className="text-center">
            {/* Enhanced Brand */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="relative p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl animate-gradient-flow"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-2">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold gradient-text-rainbow">
                Code Guardian
              </h3>
            </div>

            {/* Enhanced Description */}
            <p className="text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed px-4">
              Empowering developers worldwide with cutting-edge AI-powered code security and quality analysis.
              <span className="block mt-2 text-sm sm:text-base opacity-80">Built with passion for secure, efficient, and maintainable code.</span>
            </p>

            {/* Enhanced Features */}
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 dark:border-white/10 transition-all duration-300 hover:scale-105">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                <span className="text-xs sm:text-sm font-medium">Privacy-focused</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 dark:border-white/10 transition-all duration-300 hover:scale-105">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <span className="text-xs sm:text-sm font-medium">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 dark:border-white/10 transition-all duration-300 hover:scale-105">
                <Github className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                <span className="text-xs sm:text-sm font-medium">Open Source</span>
              </div>
            </div>

            {/* Enhanced Copyright */}
            <div className="flex flex-col items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-2 text-base">
                <span>© 2025 Code Guardian Report. Built with</span>
                <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                <span className="font-medium gradient-text-purple">by Aditya Kumar Tiwari</span>
              </div>

              {/* Developer Social Links */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="https://github.com/Xenonesis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-target"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">GitHub</span>
                </a>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <a
                  href="https://www.linkedin.com/in/itisaddy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-target"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">LinkedIn</span>
                </a>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <a
                  href="https://www.instagram.com/i__aditya7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-pink-600 dark:hover:text-pink-400 transition-colors touch-target"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">Instagram</span>
                </a>
                <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                <a
                  href="https://iaddy.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors touch-target"
                >
                  Portfolio
                </a>
              </div>

              <div className="text-sm text-slate-400 dark:text-slate-600 font-medium">
                🔐 Cybersecurity Enthusiast | 💻 Full-Stack Developer | 📚 Lifelong Learner
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
