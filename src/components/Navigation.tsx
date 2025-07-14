import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Moon, Sun, Menu, X, Building2, Lock, Sparkles, Zap, Star, ArrowRight, Globe, Users, Award, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isDarkMode, toggleDarkMode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Enhanced scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    {
      path: '/',
      label: 'Platform',
      icon: <Home className="h-4 w-4" />,
      description: 'AI-Powered Security Analysis',
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      hoverColor: 'hover:text-blue-600 dark:hover:text-blue-400',
      category: 'main',
      badge: 'AI'
    },
    {
      path: '/about',
      label: 'Solutions',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Enterprise Security Suite',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      hoverColor: 'hover:text-emerald-600 dark:hover:text-emerald-400',
      category: 'main',
      badge: 'Enterprise'
    }
  ];

  const legalItems = [
    {
      path: '/privacy',
      label: 'Privacy Policy',
      icon: <Lock className="h-4 w-4" />,
      description: 'Data Protection & Security',
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      hoverColor: 'hover:text-slate-700 dark:hover:text-slate-300',
      category: 'legal'
    },
    {
      path: '/terms',
      label: 'Terms of Service',
      icon: <Award className="h-4 w-4" />,
      description: 'Service Agreement & Terms',
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      hoverColor: 'hover:text-slate-700 dark:hover:text-slate-300',
      category: 'legal'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={cn(
      "professional-nav sticky top-0 z-50 transition-all duration-500",
      isScrolled
        ? "bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl shadow-2xl border-b border-slate-200/60 dark:border-slate-700/60"
        : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/40 dark:border-slate-700/40"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Enhanced Premium Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 sm:gap-4 group cursor-pointer transition-all duration-500 min-w-0 flex-1 sm:flex-initial touch-target hover:scale-105"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* Premium Shield Icon with Gradient */}
            <div className="relative p-3 sm:p-3 lg:p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl group-hover:shadow-3xl transition-all duration-500 flex-shrink-0 group-hover:rotate-3">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 blur transition-all duration-500"></div>
            </div>

            {/* Enhanced Brand Text */}
            <div className="min-w-0 flex-1 sm:flex-initial">
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent truncate">
                  Code Guardian
                </h1>
                <div className="hidden lg:flex items-center">
                  <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg animate-pulse">
                    AI
                  </span>
                </div>
              </div>
              <div className="hidden sm:block text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">
                AI-Powered Security Platform
              </div>
            </div>
          </Link>

          {/* Enhanced Premium Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold transition-all duration-500 text-sm group overflow-hidden",
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl scale-105`
                    : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:text-slate-900 dark:hover:text-white hover:scale-105"
                )}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <span className="relative z-10">{item.label}</span>

                {/* Badge */}
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded-full">
                    {item.badge}
                  </span>
                )}

                {/* Enhanced Active Indicator */}
                {isActive(item.path) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </Link>
            ))}
          </div>

          {/* Enhanced Premium Tablet Navigation */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center justify-center p-4 rounded-2xl font-medium transition-all duration-500 touch-target group",
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl scale-110`
                    : "text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:scale-110"
                )}
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={`${item.label} - ${item.description}`}
              >
                <div className="transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                  {item.icon}
                </div>

                {/* Enhanced Active Indicator */}
                {isActive(item.path) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-sm"></div>
              </Link>
            ))}
          </div>

          {/* Enhanced Premium Controls */}
          <div className="flex items-center gap-3">
            {/* Premium Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-500 touch-target group hover:scale-110"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:rotate-12 transition-transform duration-500" />
              )}
            </Button>

            {/* Enhanced Premium Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 h-12 w-12 rounded-2xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-500 active:scale-95 flex items-center justify-center group hover:scale-110"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-slate-600 dark:text-slate-400 transition-transform duration-300 group-hover:rotate-90" />
              ) : (
                <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400 transition-transform duration-300 group-hover:scale-110" />
              )}
            </Button>
          </div>
        </div>

        {/* Premium Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Premium Mobile Menu Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/60 backdrop-blur-md z-40 animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Premium Mobile Menu Content */}
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-t border-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 shadow-2xl animate-slide-down max-h-screen overflow-y-auto z-50">
              {/* Premium Mobile Menu Header */}
              <div className="container mx-auto mobile-container py-6 border-b border-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">Navigation</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">AI-Powered Security Platform</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-3 rounded-2xl hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-110"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              {/* Premium Enhanced Mobile Menu Items */}
              <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Main Navigation */}
                <div className="mb-8 sm:mb-10">
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 px-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Platform
                  </h4>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {navItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "mobile-nav-item relative overflow-hidden flex items-center gap-4 sm:gap-5 px-5 sm:px-7 py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-semibold transition-all duration-700 touch-target-lg group active:scale-95 border-2",
                        isActive(item.path)
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl border-white/30 scale-105`
                          : `text-slate-800 dark:text-slate-200 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 hover:scale-105 hover:shadow-xl`
                      )}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      <div className={cn(
                        "flex-shrink-0 p-4 rounded-2xl transition-all duration-500 relative",
                        isActive(item.path)
                          ? "bg-white/20 text-white scale-110 shadow-lg"
                          : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-lg"
                      )}>
                        {item.icon}
                        {isActive(item.path) && (
                          <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg sm:text-xl">{item.label}</span>
                          {item.badge && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-bold rounded-full",
                              isActive(item.path)
                                ? "bg-white/20 text-white"
                                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className={cn(
                          "text-sm sm:text-base transition-colors duration-300",
                          isActive(item.path)
                            ? "text-white/90"
                            : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                        )}>
                          {item.description}
                        </div>
                      </div>

                      {/* Enhanced Active Indicator */}
                      {isActive(item.path) && (
                        <div className="flex flex-col gap-1 items-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                          <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }}></div>
                        </div>
                      )}

                      {/* Enhanced Hover Effect Overlay */}
                      <div className={cn(
                        "absolute inset-0 rounded-2xl transition-opacity duration-500",
                        isActive(item.path)
                          ? "bg-gradient-to-r from-white/10 to-transparent opacity-100"
                          : "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100"
                      )}></div>

                      {/* Shimmer Effect */}
                      {!isActive(item.path) && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
                      )}
                    </Link>
                    ))}
                  </div>
                </div>

                {/* Legal & Compliance Pages */}
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 px-3 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-emerald-500" />
                    Legal & Compliance
                  </h4>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {legalItems.map((item, index) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "mobile-nav-item relative overflow-hidden flex items-center gap-4 sm:gap-5 px-5 sm:px-7 py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-semibold transition-all duration-700 touch-target group active:scale-95 border-2",
                          isActive(item.path)
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl border-white/30 scale-105`
                            : `text-slate-800 dark:text-slate-200 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 hover:scale-105 hover:shadow-xl`
                        )}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                        style={{ animationDelay: `${(navItems.length + index) * 0.15}s` }}
                      >
                        <div className={cn(
                          "flex-shrink-0 p-3 rounded-xl transition-all duration-500 relative",
                          isActive(item.path)
                            ? "bg-white/20 text-white scale-110 shadow-lg"
                            : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-lg"
                        )}>
                          {item.icon}
                          {isActive(item.path) && (
                            <div className="absolute inset-0 bg-white/10 rounded-xl animate-pulse"></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-base sm:text-lg mb-1">{item.label}</div>
                          <div className={cn(
                            "text-sm transition-colors duration-300",
                            isActive(item.path)
                              ? "text-white/90"
                              : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                          )}>
                            {item.description}
                          </div>
                        </div>

                        {/* Enhanced Active Indicator */}
                        {isActive(item.path) && (
                          <div className="flex flex-col gap-1 items-center">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }}></div>
                          </div>
                        )}

                        {/* Enhanced Hover Effect Overlay */}
                        <div className={cn(
                          "absolute inset-0 rounded-2xl transition-opacity duration-500",
                          isActive(item.path)
                            ? "bg-gradient-to-r from-white/10 to-transparent opacity-100"
                            : "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100"
                        )}></div>

                        {/* Shimmer Effect */}
                        {!isActive(item.path) && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
