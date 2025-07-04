import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Info, Home, Moon, Sun, Menu, X, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isDarkMode, toggleDarkMode }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: <Home className="h-4 w-4" />,
      description: 'Code Analysis Platform',
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      path: '/about',
      label: 'About',
      icon: <Info className="h-4 w-4" />,
      description: 'Tools & Features',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="container mx-auto mobile-container">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer hover-lift transition-all duration-300 min-w-0 flex-1 sm:flex-initial"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative p-2 sm:p-3 lg:p-4 rounded-2xl shadow-2xl hover:shadow-[0_20px_40px_-12px_rgba(59,130,246,0.4)] transition-all duration-500 group-hover:scale-110 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl animate-gradient-flow"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-1">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 lg:h-9 lg:w-9 text-white transition-all duration-500" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="hidden xs:block min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold gradient-text-rainbow truncate">
                Code Guardian
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
                <span className="hidden sm:inline">AI-Powered Analysis</span>
                <span className="sm:hidden">AI Analysis</span>
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-3 rounded-2xl font-semibold transition-all duration-500 group text-sm lg:text-base hover:scale-105",
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)]`
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm"
                )}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <div className="transition-all duration-300">
                  {item.icon}
                </div>
                <span className="hidden xl:inline">{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Tablet Navigation */}
          <div className="hidden md:flex lg:hidden items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center justify-center p-3 rounded-2xl font-semibold transition-all duration-500 group touch-target hover:scale-110",
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl hover:shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)]`
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/10 backdrop-blur-sm"
                )}
                aria-current={isActive(item.path) ? 'page' : undefined}
                aria-label={`${item.label} - ${item.description}`}
              >
                {item.icon}
                {isActive(item.path) && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="relative p-2 sm:p-3 rounded-2xl hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-sm transition-all duration-500 group touch-target hover:scale-110 shadow-lg"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="relative">
                {isDarkMode ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 group-hover:rotate-180 transition-transform duration-500" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300 group-hover:rotate-12 transition-transform duration-300" />
                )}
              </div>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 sm:p-3 rounded-2xl hover:bg-white/20 dark:hover:bg-black/20 backdrop-blur-sm transition-all duration-500 touch-target hover:scale-110 shadow-lg"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700 dark:text-slate-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Mobile Menu Backdrop */}
            <div 
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Mobile Menu Content */}
            <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-white/20 dark:border-white/10 shadow-2xl animate-slide-down max-h-screen overflow-y-auto z-50">
              <div className="container mx-auto mobile-container py-4">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "mobile-nav-item flex items-center gap-3 px-4 py-4 rounded-xl font-medium transition-all duration-300 touch-target",
                        isActive(item.path)
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                      <div className="flex-shrink-0">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm sm:text-base">{item.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{item.description}</div>
                      </div>
                    </Link>
                  ))}
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
