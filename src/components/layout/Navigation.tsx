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
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { AuthModal } from "@/components/auth/AuthModal";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { PWAQuickActions } from "@/components/pwa/PWAQuickActions";

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
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
        "portal-navbar bg-white transition-all duration-500 ease-out dark:bg-slate-950",
        isScrolled
          ? "border-border/60 border-b shadow-lg shadow-black/5 dark:shadow-black/30"
          : "border-b border-transparent"
      )}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        width: "100%",
        paddingTop: "env(safe-area-inset-top)",
        backgroundColor: "var(--background)",
      }}
    >
      <div className="xs:px-4 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="xs:h-15 flex h-14 items-center justify-between sm:h-16 md:h-[64px] lg:h-[68px]">
          {/* Code Guardian Logo - Enhanced */}
          <button
            onClick={() => handleNavigate("home")}
            className="xs:gap-2 group flex min-w-0 flex-shrink-0 items-center gap-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] sm:gap-3"
          >
            {/* Shield Icon with Glow Effect */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-40 blur-lg transition-opacity duration-300 group-hover:opacity-60"></div>
              <div className="xs:p-2 relative rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-1.5 shadow-lg transition-all duration-300 group-hover:rotate-3 group-hover:shadow-xl sm:p-2.5">
                <Shield
                  className="xs:h-5 xs:w-5 h-4 w-4 text-white drop-shadow-sm sm:h-6 sm:w-6"
                  strokeWidth={2.5}
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/25 to-transparent"></div>
              </div>
            </div>

            {/* Brand Text - Enhanced */}
            <div className="flex min-w-0 flex-col">
              <div className="xs:gap-1.5 flex items-center gap-1">
                <h1 className="xs:text-base truncate bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-sm font-bold tracking-tight text-transparent sm:text-lg lg:text-xl dark:from-white dark:via-blue-100 dark:to-indigo-100">
                  Code Guardian
                </h1>
                <Sparkles className="xs:h-3 xs:w-3 h-2.5 w-2.5 flex-shrink-0 text-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:h-3.5 sm:w-3.5" />
              </div>
              <p className="xs:text-[10px] hidden truncate text-[9px] font-medium tracking-wide text-slate-500 sm:block sm:text-xs dark:text-slate-400">
                Security Analysis Platform
              </p>
            </div>
          </button>

          {/* Desktop Navigation - Enhanced */}
          <div className="hidden flex-1 items-center justify-center px-4 lg:flex">
            <div className="bg-muted/80 flex items-center gap-0.5 rounded-full p-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  onMouseEnter={() => setActiveHover(item.id)}
                  onMouseLeave={() => setActiveHover(null)}
                  className={cn(
                    "group relative flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 xl:px-4 xl:text-sm",
                    isActive(item.id)
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex-shrink-0 transition-transform duration-200",
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
                    <span className="ml-0.5 flex-shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tablet Navigation (md breakpoint) */}
          <div className="hidden flex-1 items-center justify-center gap-0.5 px-2 md:flex lg:hidden">
            {navItems.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "relative flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                  isActive(item.id)
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className="hidden truncate md:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right side actions - Enhanced */}
          <div className="xs:gap-1.5 flex flex-shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
            {/* Authentication Section - Desktop */}
            {user ? (
              <div className="relative hidden md:block" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="group flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-2 transition-all duration-200 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:hover:bg-slate-700/50"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-inner">
                    {(userProfile?.displayName ||
                      userProfile?.githubUsername ||
                      user?.email)?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 lg:block dark:text-slate-300">
                    {userProfile?.displayName ||
                      userProfile?.githubUsername ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "hidden h-4 w-4 text-slate-400 transition-transform duration-200 lg:block",
                      showUserDropdown && "rotate-180"
                    )}
                  />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="animate-in fade-in slide-in-from-top-2 border-border bg-popover absolute right-0 z-50 mt-2 w-56 rounded-xl border py-2 shadow-xl duration-200">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="text-foreground truncate text-sm font-semibold">
                        {userProfile?.displayName ||
                          userProfile?.githubUsername ||
                          "User"}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleNavigate("history");
                          setShowUserDropdown(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <History className="h-4 w-4" />
                        <span>Scan History</span>
                      </button>
                    </div>
                    <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-1.5 md:flex lg:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 lg:px-4 lg:py-2 lg:text-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] lg:px-5 lg:py-2 lg:text-sm"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Notification Center */}
            <NotificationCenter className="xs:h-9 xs:w-9 h-8 w-8 rounded-full bg-slate-100/80 transition-all duration-200 hover:bg-slate-200/80 sm:h-10 sm:w-10 dark:bg-slate-800/50 dark:hover:bg-slate-700/50" />

            {/* PWA Quick Actions */}
            <PWAQuickActions className="xs:h-9 xs:w-9 hidden h-8 w-8 rounded-full bg-slate-100/80 transition-all duration-200 hover:bg-slate-200/80 sm:flex sm:h-10 sm:w-10 dark:bg-slate-800/50 dark:hover:bg-slate-700/50" />

            {/* Mobile Menu Toggle - Enhanced */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "xs:h-9 xs:w-9 flex h-8 w-8 items-center justify-center rounded-full p-0 transition-all duration-300 sm:h-10 sm:w-10 md:hidden",
                isMobileMenuOpen
                  ? "bg-foreground text-background rotate-90"
                  : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700/50"
              )}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="xs:h-5 xs:w-5 h-4 w-4" />
              ) : (
                <Menu className="xs:h-5 xs:w-5 h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced Full Screen Overlay */}
        <div
          className={cn(
            "bg-background fixed inset-0 transition-all duration-300 ease-out md:hidden",
            isMobileMenuOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-4 opacity-0"
          )}
          style={{
            top: "calc(56px + env(safe-area-inset-top))",
            height: "calc(100vh - 56px - env(safe-area-inset-top))",
          }}
        >
          <div className="xs:px-4 xs:py-6 h-full overflow-y-auto px-3 py-4">
            {/* Navigation Items */}
            <div className="space-y-1">
              <p className="xs:text-xs xs:px-4 xs:mb-3 mb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Navigation
              </p>
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "xs:gap-4 xs:px-4 xs:py-4 xs:rounded-2xl group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium transition-all duration-300",
                    isActive(item.id)
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                      : "text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:active:bg-slate-800"
                  )}
                  style={{
                    animationName: isMobileMenuOpen ? "slideIn" : "none",
                    animationDuration: isMobileMenuOpen ? "0.3s" : undefined,
                    animationTimingFunction: isMobileMenuOpen
                      ? "ease-out"
                      : undefined,
                    animationFillMode: isMobileMenuOpen
                      ? "forwards"
                      : undefined,
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div
                    className={cn(
                      "xs:p-2.5 xs:rounded-xl flex-shrink-0 rounded-lg p-2 transition-all duration-200",
                      isActive(item.id)
                        ? "bg-white/30 dark:bg-slate-700"
                        : "bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-800 dark:group-hover:bg-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "xs:[&>svg]:h-5 xs:[&>svg]:w-5 block transition-transform duration-200 group-hover:scale-110 [&>svg]:h-4 [&>svg]:w-4",
                        isActive(item.id)
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="xs:text-base text-sm font-semibold">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="xs:px-2 xs:text-[10px] rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "xs:text-sm mt-0.5 text-xs",
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
                      "xs:w-2 xs:h-2 h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all duration-200",
                      isActive(item.id) ? "bg-foreground" : "bg-transparent"
                    )}
                  ></div>
                </button>
              ))}
            </div>

            {/* Mobile Authentication Section - Enhanced */}
            <div className="xs:mt-8 xs:pt-6 mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
              <p className="xs:text-xs xs:px-4 xs:mb-3 mb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                Account
              </p>
              {user ? (
                <div className="xs:space-y-3 space-y-2">
                  {/* User Profile Card */}
                  <div className="xs:gap-4 xs:px-4 xs:py-4 xs:rounded-2xl flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-3 dark:from-slate-800/50 dark:to-slate-900/50">
                    <div className="xs:w-12 xs:h-12 xs:text-lg flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white shadow-lg">
                      {(userProfile?.displayName ||
                        userProfile?.githubUsername ||
                        user?.email)?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="xs:text-base text-foreground truncate text-sm font-semibold">
                        {userProfile?.displayName ||
                          userProfile?.githubUsername ||
                          "User"}
                      </p>
                      <p className="xs:text-sm truncate text-xs text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="xs:gap-4 xs:px-4 xs:py-4 xs:rounded-2xl flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium text-red-600 transition-all duration-200 hover:bg-red-50 active:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 dark:active:bg-red-900/30"
                  >
                    <div className="xs:p-2.5 xs:rounded-xl flex-shrink-0 rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                      <LogOut className="xs:h-5 xs:w-5 h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="xs:text-base text-sm font-semibold">
                        Sign Out
                      </span>
                      <p className="xs:text-sm mt-0.5 truncate text-xs text-red-500/70 dark:text-red-400/70">
                        Log out of your account
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="xs:space-y-3 space-y-2">
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="xs:gap-4 xs:px-4 xs:py-4 xs:rounded-2xl flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium text-slate-700 transition-all duration-200 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:active:bg-slate-800"
                  >
                    <div className="xs:p-2.5 xs:rounded-xl flex-shrink-0 rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                      <User className="xs:h-5 xs:w-5 h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <span className="xs:text-base text-sm font-semibold">
                        Sign In
                      </span>
                      <p className="xs:text-sm mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        Access your account
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="xs:gap-4 xs:px-4 xs:py-4 xs:rounded-2xl flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-3 text-left font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30"
                  >
                    <div className="xs:p-2.5 xs:rounded-xl bg-background/20 flex-shrink-0 rounded-lg p-2">
                      <Sparkles className="xs:h-5 xs:w-5 h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="xs:text-base text-sm font-semibold">
                        Get Started
                      </span>
                      <p className="xs:text-sm mt-0.5 truncate text-xs text-white/70">
                        Create a free account
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Footer in mobile menu */}
            <div className="xs:mt-8 xs:pt-6 mt-6 border-t border-slate-200 pt-4 text-center dark:border-slate-800">
              <p className="xs:text-xs text-[10px] text-slate-400 dark:text-slate-500">
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
