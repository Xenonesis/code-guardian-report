import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Home,
  Moon,
  Sun,
  Menu,
  X,
  Info,
  Lock,
  Award,
  User,
  Settings,
  LogOut,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "../lib/auth-context";
import { AuthModal } from "./auth-modal";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Mount detection and scroll detection for navbar styling
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileDropdownOpen && !target.closest("[data-profile-dropdown]")) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: <Home className="h-4 w-4" />,
    },
    {
      path: "/about",
      label: "About",
      icon: <Info className="h-4 w-4" />,
    },
    {
      path: "/privacy",
      label: "Privacy",
      icon: <Lock className="h-4 w-4" />,
    },
    {
      path: "/terms",
      label: "Terms",
      icon: <Award className="h-4 w-4" />,
    },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  if (!mounted) return null;

  const navContent = (
    <>
      <nav
        className={cn(
          "portal-navbar transition-all duration-300",
          isScrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg border-b border-slate-200/50 dark:border-slate-700/50"
            : "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-700/30"
        )}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          width: "100%",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Code Guardian Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(false)}
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
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm group",
                    isActive(item.path)
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>

                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
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

              {/* Auth Section */}
              {user && userProfile ? (
                <div className="relative" data-profile-dropdown>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    }}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium shadow-lg">
                      {userProfile.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
                      {userProfile.displayName}
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {userProfile.displayName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {userProfile.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsProfileDropdownOpen(false);
                            // Use window.location for navigation to ensure it works
                            window.location.href = "/dashboard";
                          }}
                        >
                          <User className="h-4 w-4" />
                          Dashboard
                        </Link>
                        <button
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsProfileDropdownOpen(false);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}

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
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors duration-200",
                      isActive(item.path)
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Mobile Auth Section */}
                {user && userProfile ? (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 space-y-1">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {userProfile.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {userProfile.email}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileDropdownOpen(false);
                        navigate("/dashboard");
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all duration-200"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
  return createPortal(navContent, document.body);
};
