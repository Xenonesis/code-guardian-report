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
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer hover-lift transition-all duration-300 min-w-0 flex-1 sm:flex-initial"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="relative p-1.5 sm:p-2 lg:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-110 flex-shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Sparkles className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2 w-2 sm:h-3 sm:w-3 text-yellow-400 animate-pulse" />
            </div>
            <div className="hidden xs:block min-w-0">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                Bug & Weak Code Finder
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
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
                  "relative flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl font-medium transition-all duration-300 group text-sm lg:text-base",
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10"
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
                  "relative flex items-center justify-center p-2 rounded-lg font-medium transition-all duration-300 group touch-target",
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10"
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
              className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 group touch-target"
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
              className="md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 touch-target"
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
            <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-xl animate-slide-down max-h-screen overflow-y-auto z-50">
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
