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
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 transition-colors duration-300 ${className}`}>
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

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto mobile-container py-12 relative z-10">
          <div className="text-center">
            {/* Brand */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Bug & Weak Code Finder
              </h3>
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Empowering developers worldwide with AI-powered code security and quality analysis.
              Built with passion for secure development.
            </p>

            {/* Features */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Lock className="h-4 w-4 text-emerald-500" />
                <span>Privacy-focused</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Github className="h-4 w-4 text-purple-500" />
                <span>Open Source</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="flex flex-col items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-500">
              <div className="flex items-center gap-2">
                <span>© June 2025 Code Guardian Report. Built with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>by Aditya Kumar Tiwari</span>
              </div>

              {/* Developer Social Links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/Xenonesis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                  <span className="text-xs">GitHub</span>
                </a>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <a
                  href="https://www.linkedin.com/in/itisaddy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                  <span className="text-xs">LinkedIn</span>
                </a>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <a
                  href="https://www.instagram.com/i__aditya7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="text-xs">Instagram</span>
                </a>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <a
                  href="https://iaddy.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Portfolio
                </a>
              </div>

              <div className="text-xs text-slate-400 dark:text-slate-600">
                Cybersecurity Enthusiast | Full-Stack Developer | Lifelong Learner
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;
