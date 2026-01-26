"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Shield,
  Home,
  Menu,
  X,
  Info,
  Lock,
  Award,
  User,
  LogOut,
  History,
  Github,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { AuthModal } from "@/components/auth/AuthModal";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { PWAQuickActions } from "@/components/pwa/PWAQuickActions";
import type { Theme } from "@/hooks/useDarkMode";

interface NavigationProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  theme,
  onThemeChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { user, userProfile, logout } = useAuth();
  const { currentSection, navigateTo } = useNavigation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    // Instant scroll - Lenis handles smooth animation
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  };

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: <Home className="h-4 w-4" />,
      description: "Back to main page",
    },
    {
      id: "about",
      label: "About",
      icon: <Info className="h-4 w-4" />,
      description: "Learn more about us",
    },
    // Show History only for authenticated users
    ...(user
      ? [
          {
            id: "history",
            label: "History",
            icon: <History className="h-4 w-4" />,
            description: "View scan history",
          },
        ]
      : []),
    // Show GitHub Analysis for all users (will prompt non-GitHub users to sign in)
    {
      id: "github-analysis",
      label: "GitHub",
      icon: <Github className="h-4 w-4" />,
      description: "Analyze repositories",
      badge: "Pro",
    },
    {
      id: "privacy",
      label: "Privacy",
      icon: <Lock className="h-4 w-4" />,
      description: "Privacy policy",
    },
    {
      id: "terms",
      label: "Terms",
      icon: <Award className="h-4 w-4" />,
      description: "Terms of service",
    },
  ];

  const isActive = (sectionId: string) => {
    return currentSection === sectionId;
  };

  if (!mounted) return null;

  const navContent = (
    <nav
      className={cn(
        "portal-navbar transition-all duration-500 ease-out",
        isScrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50"
          : "bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-transparent"
      )}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        width: "100%",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 xs:h-15 sm:h-16 md:h-[64px] lg:h-[68px]">
          {/* Code Guardian Logo - Enhanced */}
          <button
            onClick={() => handleNavigate("home")}
            className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0 min-w-0"
          >
            {/* Shield Icon with Glow Effect */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="relative p-1.5 xs:p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                <Shield
                  className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white drop-shadow-sm"
                  strokeWidth={2.5}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 to-transparent"></div>
              </div>
            </div>

            {/* Brand Text - Enhanced */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 xs:gap-1.5">
                <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent tracking-tight truncate">
                  Code Guardian
                </h1>
                <Sparkles className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0" />
              </div>
              <p className="text-[9px] xs:text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide hidden sm:block truncate">
                Security Analysis Platform
              </p>
            </div>
          </button>

          {/* Desktop Navigation - Enhanced */}
          <div className="hidden lg:flex items-center flex-1 justify-center px-4">
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/50 rounded-full p-1 gap-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  onMouseEnter={() => setActiveHover(item.id)}
                  onMouseLeave={() => setActiveHover(null)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 xl:px-4 py-2 rounded-full font-medium transition-all duration-300 text-xs xl:text-sm group",
                    isActive(item.id)
                      ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/80"
                  )}
                >
                  <span
                    className={cn(
                      "transition-transform duration-200 flex-shrink-0",
                      activeHover === item.id &&
                        !isActive(item.id) &&
                        "scale-110"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="whitespace-nowrap">{item.label}</span>

                  {/* Pro Badge */}
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full uppercase tracking-wider shadow-sm flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tablet Navigation (md breakpoint) */}
          <div className="hidden md:flex lg:hidden items-center gap-0.5 flex-1 justify-center px-2">
            {navItems.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all duration-200 text-xs",
                  isActive(item.id)
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="hidden md:inline truncate">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right side actions - Enhanced */}
          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
            {/* Authentication Section - Desktop */}
            {user ? (
              <div className="hidden md:block relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                    {(userProfile?.displayName ||
                      userProfile?.githubUsername ||
                      user?.email)?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate hidden lg:block">
                    {userProfile?.displayName ||
                      userProfile?.githubUsername ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform duration-200 hidden lg:block",
                      showUserDropdown && "rotate-180"
                    )}
                  />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {userProfile?.displayName ||
                          userProfile?.githubUsername ||
                          "User"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleNavigate("history");
                          setShowUserDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <History className="h-4 w-4" />
                        <span>Scan History</span>
                      </button>
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-200"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 lg:px-5 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Notification Center */}
            <NotificationCenter className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-full bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 transition-all duration-200" />

            {/* PWA Quick Actions */}
            <PWAQuickActions className="hidden sm:flex h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-full bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 transition-all duration-200" />

            {/* Theme Toggle */}
            <ThemeToggle
              theme={theme}
              onThemeChange={onThemeChange}
              className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-full bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 transition-all duration-200"
            />

            {/* Mobile Menu Toggle - Enhanced */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 p-0 rounded-full transition-all duration-300 md:hidden flex items-center justify-center",
                isMobileMenuOpen
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 rotate-90"
                  : "bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
              )}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 xs:h-5 xs:w-5" />
              ) : (
                <Menu className="h-4 w-4 xs:h-5 xs:w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced Full Screen Overlay */}
        <div
          className={cn(
            "md:hidden fixed inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-out",
            isMobileMenuOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          )}
          style={{
            top: "calc(56px + env(safe-area-inset-top))",
            height: "calc(100vh - 56px - env(safe-area-inset-top))",
          }}
        >
          <div className="h-full overflow-y-auto px-3 xs:px-4 py-4 xs:py-6">
            {/* Navigation Items */}
            <div className="space-y-1">
              <p className="text-[10px] xs:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 xs:px-4 mb-2 xs:mb-3">
                Navigation
              </p>
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex items-center gap-3 xs:gap-4 px-3 xs:px-4 py-3 xs:py-4 rounded-xl xs:rounded-2xl font-medium transition-all duration-300 w-full text-left group",
                    isActive(item.id)
                      ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:bg-slate-200 dark:active:bg-slate-800"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isMobileMenuOpen
                      ? "slideIn 0.3s ease-out forwards"
                      : "none",
                  }}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 p-2 xs:p-2.5 rounded-lg xs:rounded-xl transition-all duration-200",
                      isActive(item.id)
                        ? "bg-white/20"
                        : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "block [&>svg]:h-4 [&>svg]:w-4 xs:[&>svg]:h-5 xs:[&>svg]:w-5 transition-transform duration-200 group-hover:scale-110",
                        isActive(item.id)
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm xs:text-base font-semibold">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 xs:px-2 py-0.5 text-[9px] xs:text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs xs:text-sm mt-0.5",
                        isActive(item.id)
                          ? "text-white/70"
                          : "text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full transition-all duration-200 flex-shrink-0",
                      isActive(item.id) ? "bg-white" : "bg-transparent"
                    )}
                  ></div>
                </button>
              ))}
            </div>

            {/* Mobile Authentication Section - Enhanced */}
            <div className="mt-6 xs:mt-8 pt-4 xs:pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[10px] xs:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 xs:px-4 mb-2 xs:mb-3">
                Account
              </p>
              {user ? (
                <div className="space-y-2 xs:space-y-3">
                  {/* User Profile Card */}
                  <div className="flex items-center gap-3 xs:gap-4 px-3 xs:px-4 py-3 xs:py-4 rounded-xl xs:rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/50 dark:to-slate-900/50">
                    <div className="w-10 h-10 xs:w-12 xs:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base xs:text-lg font-bold shadow-lg flex-shrink-0">
                      {(userProfile?.displayName ||
                        userProfile?.githubUsername ||
                        user?.email)?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm xs:text-base font-semibold text-slate-900 dark:text-white truncate">
                        {userProfile?.displayName ||
                          userProfile?.githubUsername ||
                          "User"}
                      </p>
                      <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 xs:gap-4 px-3 xs:px-4 py-3 xs:py-4 rounded-xl xs:rounded-2xl font-medium transition-all duration-200 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30"
                  >
                    <div className="p-2 xs:p-2.5 rounded-lg xs:rounded-xl bg-red-50 dark:bg-red-900/20 flex-shrink-0">
                      <LogOut className="h-4 w-4 xs:h-5 xs:w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm xs:text-base font-semibold">
                        Sign Out
                      </span>
                      <p className="text-xs xs:text-sm text-red-500/70 dark:text-red-400/70 mt-0.5 truncate">
                        Log out of your account
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 xs:space-y-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 xs:gap-4 px-3 xs:px-4 py-3 xs:py-4 rounded-xl xs:rounded-2xl font-medium transition-all duration-200 w-full text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:bg-slate-200 dark:active:bg-slate-800"
                  >
                    <div className="p-2 xs:p-2.5 rounded-lg xs:rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      <User className="h-4 w-4 xs:h-5 xs:w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm xs:text-base font-semibold">
                        Sign In
                      </span>
                      <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        Access your account
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 xs:gap-4 px-3 xs:px-4 py-3 xs:py-4 rounded-xl xs:rounded-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 w-full text-left shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <div className="p-2 xs:p-2.5 rounded-lg xs:rounded-xl bg-white/20 flex-shrink-0">
                      <Sparkles className="h-4 w-4 xs:h-5 xs:w-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm xs:text-base font-semibold">
                        Get Started
                      </span>
                      <p className="text-xs xs:text-sm text-white/70 mt-0.5 truncate">
                        Create a free account
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Footer in mobile menu */}
            <div className="mt-6 xs:mt-8 pt-4 xs:pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-[10px] xs:text-xs text-slate-400 dark:text-slate-500">
                © 2024 Code Guardian. All rights reserved.
              </p>
            </div>
          </div>
        </div>
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
