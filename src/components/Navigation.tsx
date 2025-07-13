import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Info, Home, Moon, Sun, Menu, X, Settings, Users, FileCheck, Scale, FileText, ChevronDown, Building2, Lock } from 'lucide-react';
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
      description: 'Security Analysis Dashboard',
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      hoverColor: 'hover:text-slate-700 dark:hover:text-slate-300',
      category: 'main'
    },
    {
      path: '/about',
      label: 'Solutions',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Enterprise Security Tools',
      gradient: 'from-blue-600 via-blue-700 to-blue-800',
      hoverColor: 'hover:text-blue-700 dark:hover:text-blue-300',
      category: 'main'
    }
  ];

  const legalItems = [
    {
      path: '/privacy',
      label: 'Privacy Policy',
      icon: <Lock className="h-4 w-4" />,
      description: 'Data Protection & Privacy',
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      hoverColor: 'hover:text-slate-700 dark:hover:text-slate-300',
      category: 'legal'
    },
    {
      path: '/terms',
      label: 'Terms of Service',
      icon: <FileCheck className="h-4 w-4" />,
      description: 'Service Agreement',
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
      "professional-nav sticky top-0 z-50 transition-all duration-300",
      isScrolled
        ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-slate-700/50"
        : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-700/30"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Professional Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group cursor-pointer transition-all duration-300 min-w-0 flex-1 sm:flex-initial"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative p-2.5 lg:p-3 rounded-xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
              <Shield className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="min-w-0 flex-1 sm:flex-initial">
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white truncate">
                  Code Guardian
                </h1>
                <div className="hidden lg:flex items-center">
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                    Enterprise
                  </span>
                </div>
              </div>
              <div className="hidden sm:block text-xs text-slate-600 dark:text-slate-400 font-medium">
                Enterprise Security Platform
              </div>
            </div>
          </Link>

          {/* Professional Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm",
                  isActive(item.path)
                    ? "bg-slate-900 dark:bg-slate-700 text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                <span>{item.label}</span>

                {/* Professional Active Indicator */}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Professional Tablet Navigation */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center justify-center p-3 rounded-lg font-medium transition-all duration-300 touch-target",
                  isActive(item.path)
                    ? "bg-slate-900 dark:bg-slate-700 text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={`${item.label} - ${item.description}`}
              >
                {item.icon}

                {/* Professional Active Indicator */}
                {isActive(item.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Professional Controls */}
          <div className="flex items-center gap-2">
            {/* Professional Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 touch-target"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </Button>

            {/* Professional Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 touch-target"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Enhanced Mobile Menu Backdrop */}
            <div
              className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-md z-40 animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Enhanced Mobile Menu Content */}
            <div className="md:hidden absolute top-full left-0 right-0 glass-card-ultra border-t border-white/30 dark:border-white/20 shadow-2xl animate-slide-down max-h-screen overflow-y-auto z-50">
              {/* Mobile Menu Header */}
              <div className="container mx-auto mobile-container py-4 border-b border-white/20 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Menu</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Platform Navigation</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl hover:bg-red-500/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Mobile Menu Items */}
              <div className="container mx-auto mobile-container py-6">
                {/* Main Navigation */}
                <div className="mb-8">
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4 px-2">Platform</h4>
                  <div className="flex flex-col gap-4">
                    {navItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "mobile-nav-item glass-card-ultra enhanced-card-hover flex items-center gap-4 px-6 py-5 rounded-2xl font-medium transition-all duration-500 touch-target group",
                        isActive(item.path)
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl glow-on-hover border-2 border-white/30`
                          : `text-slate-800 dark:text-slate-200 ${item.hoverColor} hover:scale-[1.02]`
                      )}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={cn(
                        "flex-shrink-0 p-3 rounded-xl transition-all duration-500",
                        isActive(item.path)
                          ? "bg-white/20 text-white scale-110"
                          : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:scale-125 group-hover:rotate-12"
                      )}>
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-base sm:text-lg mb-1">{item.label}</div>
                        <div className={cn(
                          "text-sm transition-colors duration-300",
                          isActive(item.path)
                            ? "text-white/80"
                            : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                        )}>
                          {item.description}
                        </div>
                      </div>

                      {/* Active Indicator */}
                      {isActive(item.path) && (
                        <div className="flex flex-col gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}

                      {/* Hover Effect Overlay */}
                      {!isActive(item.path) && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      )}
                    </Link>
                    ))}
                  </div>
                </div>

                {/* Legal Pages */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-4 px-2">Legal & Compliance</h4>
                  <div className="flex flex-col gap-4">
                    {legalItems.map((item, index) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "mobile-nav-item glass-card-ultra enhanced-card-hover flex items-center gap-4 px-6 py-5 rounded-2xl font-medium transition-all duration-500 touch-target group",
                          isActive(item.path)
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl glow-on-hover border-2 border-white/30`
                            : `text-slate-800 dark:text-slate-200 ${item.hoverColor} hover:scale-[1.02]`
                        )}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                        style={{ animationDelay: `${(navItems.length + index) * 0.1}s` }}
                      >
                        <div className={cn(
                          "flex-shrink-0 p-3 rounded-xl transition-all duration-500",
                          isActive(item.path)
                            ? "bg-white/20 text-white scale-110"
                            : "bg-gradient-to-r from-blue-500/10 to-purple-500/10 group-hover:scale-125 group-hover:rotate-12"
                        )}>
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-base sm:text-lg mb-1">{item.label}</div>
                          <div className={cn(
                            "text-sm transition-colors duration-300",
                            isActive(item.path)
                              ? "text-white/80"
                              : "text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                          )}>
                            {item.description}
                          </div>
                        </div>

                        {/* Active Indicator */}
                        {isActive(item.path) && (
                          <div className="flex flex-col gap-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}

                        {/* Hover Effect Overlay */}
                        {!isActive(item.path) && (
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
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
