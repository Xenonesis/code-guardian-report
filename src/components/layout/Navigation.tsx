import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Shield, Home, Moon, Sun, Menu, X, Info, Lock, Award, User, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useNavigation } from '@/lib/navigation-context';
import { AuthModal } from '@/components/auth/AuthModal';

interface NavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user, userProfile, logout } = useAuth();
  const { currentSection, navigateTo } = useNavigation();

  // Mount detection and scroll detection for navbar styling
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigate to section
  const handleNavigate = (sectionId: string) => {
    navigateTo(sectionId);
    setIsMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-4 w-4" />
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="h-4 w-4" />
    },
    // Show History only for authenticated users
    ...(user ? [{
      id: 'history',
      label: 'History',
      icon: <History className="h-4 w-4" />
    }] : []),
    {
      id: 'privacy',
      label: 'Privacy',
      icon: <Lock className="h-4 w-4" />
    },
    {
      id: 'terms',
      label: 'Terms',
      icon: <Award className="h-4 w-4" />
    }
  ];

  const isActive = (sectionId: string) => {
    return currentSection === sectionId;
  };

  if (!mounted) return null;

  const navContent = (
    <nav 
      className={cn(
        "portal-navbar transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50 dark:border-slate-700/50"
          : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-700/30"
      )}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        width: '100%'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Code Guardian Logo */}
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            {/* Shield Icon */}
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
              <Shield className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            
            {/* Brand Text */}
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent leading-tight">
                Code Guardian
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-none hidden sm:block">
                Security Analysis
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm group",
                  isActive(item.id)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </div>
                <span>{item.label}</span>
                
                {/* Active indicator */}
                {isActive(item.id) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Authentication Section */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {userProfile?.displayName || 'User'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-red-600 dark:text-red-400"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 md:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="px-4 py-3 space-y-1">
              {/* Navigation Items */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors duration-200 w-full text-left",
                    isActive(item.id)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Mobile Authentication Section */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {userProfile?.displayName || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors duration-200 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors duration-200 w-full text-left text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 w-full text-left"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign Up</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
  
  return (
    <>
      {createPortal(navContent, document.body)}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};