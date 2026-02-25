"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Shield,
  Home,
  Menu,
  X,
  Info,
  User,
  LogOut,
  History,
  Github,
  ChevronDown,
  FileClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useNavigation } from "@/lib/navigation-context";
import { AuthModal } from "@/components/auth/AuthModal";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { PWAQuickActions } from "@/components/pwa/PWAQuickActions";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { LenisContext } from "../../../app/providers/SmoothScrollProvider";

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const { user, userProfile, logout } = useAuth();
  const { currentSection, navigateTo } = useNavigation();
  const lenis = React.useContext(LenisContext);

  const getGithubAvatarUrl = () => {
    const githubProvider = user?.providerData?.find(
      (p) => p.providerId === "github.com"
    );
    const githubUserId = githubProvider?.uid;

    return (
      userProfile?.githubMetadata?.avatarUrl ||
      githubProvider?.photoURL ||
      user?.photoURL ||
      (githubUserId
        ? `https://avatars.githubusercontent.com/u/${githubUserId}`
        : null)
    );
  };

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

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      if (lenis) {
        lenis.stop();
      }

      return () => {
        document.body.style.overflow = originalStyle;
        if (lenis) {
          lenis.start();
        }
      };
    }
  }, [isMobileMenuOpen, lenis]);

  const handleNavigate = (sectionId: string) => {
    navigateTo(sectionId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "home", label: "Home", icon: <Home className="h-4 w-4" /> },
    { id: "about", label: "About", icon: <Info className="h-4 w-4" /> },
    ...(user
      ? [
          {
            id: "history",
            label: "History",
            icon: <History className="h-4 w-4" />,
          },
        ]
      : []),
    {
      id: "github-analysis",
      label: "GitHub",
      icon: <Github className="h-4 w-4" />,
      badge: "Pro",
    },
    {
      id: "changelog",
      label: "Changelog",
      icon: <FileClock className="h-4 w-4" />,
    },
    { id: "legal", label: "Legal", icon: <Shield className="h-4 w-4" /> },
  ];

  const isActive = (sectionId: string) => currentSection === sectionId;

  if (!mounted) return null;

  const navContent = (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 w-full transition-all duration-300",
          isScrolled || isMobileMenuOpen
            ? "border-border/50 bg-background/85 supports-[backdrop-filter]:bg-background/70 border-b shadow-[0_10px_40px_-24px_hsl(var(--foreground)/0.65)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent py-2",
          className
        )}
        style={{
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="from-primary/6 via-primary/2 to-background pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b" />
        <div className="via-primary/45 pointer-events-none absolute right-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent" />
        <div className="relative z-50 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between sm:h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigate("home")}
              className="group flex items-center gap-2 transition-opacity hover:opacity-90 sm:gap-2.5"
              aria-label="Go to home"
            >
              <div className="from-primary/25 to-primary/5 border-primary/35 relative flex h-9 w-9 items-center justify-center rounded-lg border bg-gradient-to-tr shadow-[0_0_0_1px_hsl(var(--background))_inset] transition-transform group-hover:scale-105">
                <Shield className="text-primary h-5 w-5 transition-colors" />
              </div>
              <div className="hidden items-center sm:flex">
                <span className="font-display text-foreground text-lg font-medium tracking-tight whitespace-nowrap md:text-xl">
                  Code Guardian
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="border-border/45 bg-background/70 hidden items-center justify-center rounded-xl border p-1.5 shadow-[0_4px_24px_-16px_hsl(var(--foreground)/0.5)] backdrop-blur-sm lg:flex">
              <div className="flex items-center gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={cn(
                        "relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="active-nav-pill"
                          className="bg-primary absolute inset-0 rounded-lg shadow-[0_8px_18px_-10px_hsl(var(--primary))]"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-[10px] tracking-[0.14em] uppercase opacity-70">
                          {item.id.slice(0, 2)}
                        </span>
                        {item.label}
                        {item.badge && (
                          <span
                            className={cn(
                              "font-tech rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-[0.08em] uppercase",
                              active
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tablet Nav (Icon Only) */}
            <div className="border-border/45 bg-background/70 hidden items-center justify-center rounded-xl border p-1 backdrop-blur-sm md:flex lg:hidden">
              <div className="flex items-center gap-1">
                {navItems.slice(0, 4).map((item) => {
                  const active = isActive(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={cn(
                        "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                      aria-label={item.label}
                    >
                      {active && (
                        <motion.div
                          layoutId="active-nav-tablet-pill"
                          className="bg-primary absolute inset-0 rounded-lg shadow-[0_8px_18px_-10px_hsl(var(--primary))]"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex h-4 w-4 items-center justify-center">
                        {item.icon}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-4">
              {/* Auth — Desktop */}
              {user ? (
                <div className="relative hidden md:block" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="group border-border/50 bg-background/75 hover:bg-muted/60 flex items-center gap-3 rounded-xl border py-1 pr-3 pl-1 text-sm shadow-[0_6px_20px_-14px_hsl(var(--foreground)/0.7)] transition-all"
                  >
                    {getGithubAvatarUrl() ? (
                      <img
                        src={getGithubAvatarUrl() as string}
                        alt="Profile"
                        className="ring-background h-7 w-7 rounded-full object-cover ring-2"
                      />
                    ) : (
                      <div className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full">
                        <User className="text-primary h-4 w-4" />
                      </div>
                    )}
                    <span className="hidden max-w-[100px] truncate text-sm font-medium lg:block">
                      {userProfile?.displayName || "User"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "text-muted-foreground h-4 w-4 transition-transform duration-200",
                        showUserDropdown && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="border-border bg-popover/92 absolute right-0 z-50 mt-2 w-64 rounded-xl border p-2 shadow-[0_16px_48px_-22px_hsl(var(--foreground)/0.75)] backdrop-blur-xl"
                      >
                        <div className="px-3 py-2.5">
                          <p className="text-foreground truncate text-sm font-semibold">
                            {userProfile?.displayName ||
                              userProfile?.githubUsername ||
                              "User"}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {user?.email}
                          </p>
                        </div>
                        <div className="bg-border/50 my-1 h-px" />
                        <button
                          onClick={() => {
                            handleNavigate("history");
                            setShowUserDropdown(false);
                          }}
                          className="text-foreground hover:bg-muted flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                        >
                          <History className="h-4 w-4" />
                          Scan History
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserDropdown(false);
                          }}
                          className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden items-center gap-3 md:flex">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAuthModal(true)}
                    className="text-muted-foreground hover:text-foreground border-border/50 hover:bg-muted/60 rounded-lg border px-4 font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="text-primary-foreground from-primary to-primary/85 hover:to-primary shadow-primary/20 rounded-lg border border-transparent bg-gradient-to-r px-6 shadow-lg transition-all hover:scale-105 active:scale-95"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              <div className="bg-border/60 hidden h-6 w-px sm:block" />

              <ThemeToggle />
              <NotificationCenter className="hover:bg-muted/60 border-border/40 h-9 w-9 rounded-lg border transition-colors" />
              <PWAQuickActions className="hover:bg-muted/60 border-border/40 hidden h-9 w-9 rounded-lg border transition-colors sm:flex" />

              {/* Mobile Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="border-border/50 hover:bg-muted/70 h-9 w-9 rounded-lg border lg:hidden"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-background/96 fixed inset-0 z-40 flex flex-col backdrop-blur-3xl lg:hidden"
            data-lenis-prevent
          >
            <div className="from-primary/12 via-primary/4 to-background pointer-events-none absolute inset-0 bg-gradient-to-b" />
            <motion.div
              className="relative flex flex-1 flex-col overflow-y-auto px-6 pt-24 pb-20"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
                hidden: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 },
                },
              }}
            >
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = isActive(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      onClick={() => handleNavigate(item.id)}
                      className={cn(
                        "group border-border/45 relative flex w-full items-center gap-4 overflow-hidden rounded-xl border px-4 py-3 text-left transition-all active:scale-98",
                        active
                          ? "bg-primary text-primary-foreground shadow-primary/25 shadow-lg"
                          : "bg-background/60 hover:bg-muted/55 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted group-hover:bg-background text-foreground"
                        )}
                      >
                        {React.cloneElement(
                          item.icon as React.ReactElement<{
                            className?: string;
                          }>,
                          {
                            className: "h-5 w-5",
                          }
                        )}
                      </div>
                      <span className="text-lg font-semibold tracking-tight">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={cn(
                            "ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wider uppercase",
                            active
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary/10 text-primary"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <motion.div
                          layoutId="mobile-active-glow"
                          className="absolute inset-0 -z-10 bg-gradient-to-r from-white/10 to-transparent opacity-20"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="mt-auto space-y-4 pt-6"
              >
                <div className="via-border h-px w-full bg-gradient-to-r from-transparent to-transparent" />

                {user ? (
                  <div className="space-y-3">
                    <div className="border-border/50 bg-muted/30 flex items-center gap-4 rounded-2xl border p-3">
                      {getGithubAvatarUrl() ? (
                        <img
                          src={getGithubAvatarUrl() as string}
                          alt="Profile"
                          className="ring-primary/20 h-10 w-10 rounded-full object-cover ring-2"
                        />
                      ) : (
                        <div className="bg-primary/10 ring-primary/20 flex h-10 w-10 items-center justify-center rounded-full ring-2">
                          <User className="text-primary h-5 w-5" />
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="text-foreground truncate font-semibold">
                          {userProfile?.displayName || "User"}
                        </p>
                        <p className="text-muted-foreground truncate text-sm">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      className="h-11 w-full justify-center gap-2 rounded-xl text-base font-medium shadow-sm"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <Button
                      variant="outline"
                      className="border-border/50 bg-background/50 hover:bg-muted/50 h-11 w-full justify-center gap-2 rounded-xl text-base font-medium backdrop-blur-sm"
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-5 w-5" />
                      Sign In
                    </Button>
                    <Button
                      className="shadow-primary/20 h-11 w-full justify-center gap-2 rounded-xl text-base font-medium shadow-lg transition-transform active:scale-95"
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Shield className="h-5 w-5" />
                      Get Started
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
