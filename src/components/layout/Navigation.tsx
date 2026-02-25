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
  Zap,
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

  const getUserInitials = () => {
    const name =
      userProfile?.displayName ||
      userProfile?.githubUsername ||
      user?.email ||
      "U";
    return name
      .split(/\s+/)
      .map((n: string) => n[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const close = () => setIsMobileMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [isMobileMenuOpen]);

  const handleNavigate = (sectionId: string) => {
    navigateTo(sectionId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: Info },
    ...(user ? [{ id: "history", label: "History", icon: History }] : []),
    { id: "github-analysis", label: "GitHub", icon: Github, badge: "Pro" },
    { id: "changelog", label: "Changelog", icon: FileClock },
    { id: "legal", label: "Legal", icon: Shield },
  ];

  const isActive = (id: string) => currentSection === id;

  if (!mounted) return null;

  const navContent = (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 right-0 left-0 z-50 w-full transition-all duration-300",
          isScrolled || isMobileMenuOpen
            ? "border-border/40 bg-background/85 border-b shadow-[0_8px_32px_-16px_hsl(var(--foreground)/0.45)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
          className
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Animated top accent line when scrolled */}
        <AnimatePresence>
          {isScrolled && (
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              className="from-primary/0 via-primary/50 to-primary/0 absolute top-0 right-0 left-0 h-px bg-gradient-to-r"
            />
          )}
        </AnimatePresence>

        {/* Ambient gradient */}
        <div className="from-primary/5 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigate("home")}
              aria-label="Go to home"
              className="group flex flex-shrink-0 items-center gap-2.5 focus-visible:outline-none"
            >
              <div className="relative">
                <div className="from-primary/20 to-primary/5 border-primary/25 relative flex h-9 w-9 items-center justify-center rounded-xl border bg-gradient-to-br transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_18px_-4px_hsl(var(--primary)/0.5)]">
                  <Shield className="text-primary h-[18px] w-[18px]" />
                </div>
                {/* Active ping ring on hover */}
                <span className="border-primary/40 absolute inset-0 rounded-xl border opacity-0 transition-opacity duration-300 group-hover:[animation:ping_1s_cubic-bezier(0,0,0.2,1)_1] group-hover:opacity-100" />
              </div>
              <div className="hidden sm:block">
                <span className="text-foreground font-display text-[17px] font-semibold tracking-tight md:text-lg">
                  Code <span className="text-primary">Guardian</span>
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="border-border/35 bg-background/55 hidden items-center rounded-xl border p-1 shadow-[0_2px_16px_-8px_hsl(var(--foreground)/0.25)] backdrop-blur-md lg:flex">
              {navItems.map((item) => {
                const active = isActive(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group focus-visible:ring-primary/50 relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active-pill"
                        className="bg-primary absolute inset-0 rounded-lg"
                        style={{
                          boxShadow:
                            "0 4px 16px -4px hsl(var(--primary)/0.65), 0 0 0 1px hsl(var(--primary)/0.15)",
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.5,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 transition-all duration-200",
                          active
                            ? "opacity-90"
                            : "opacity-50 group-hover:scale-110 group-hover:opacity-80"
                        )}
                      />
                      {item.label}
                      {item.badge && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-primary/15 text-primary"
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

            {/* Tablet Nav */}
            <div className="border-border/35 bg-background/55 hidden items-center rounded-xl border p-1 backdrop-blur-md md:flex lg:hidden">
              {navItems.map((item) => {
                const active = isActive(item.id);
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    aria-current={active ? "page" : undefined}
                    title={item.label}
                    className={cn(
                      "group focus-visible:ring-primary/50 relative flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
                      active
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-tablet-pill"
                        className="bg-primary absolute inset-0 rounded-lg"
                        style={{
                          boxShadow: "0 4px 14px -4px hsl(var(--primary)/0.65)",
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.5,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1">
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          active ? "opacity-90" : "opacity-60"
                        )}
                      />
                      <span className="hidden sm:inline">{item.label}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={cn(
                          "relative z-10 rounded px-1 text-[8px] font-black tracking-widest uppercase",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-primary/15 text-primary"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Auth + Utility */}
            <div className="flex flex-shrink-0 items-center gap-2">
              {/* Auth — desktop */}
              {user ? (
                <div className="relative hidden md:block" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={showUserDropdown}
                    className="border-border/40 bg-background/65 hover:bg-muted/60 group focus-visible:ring-primary/50 flex items-center gap-2 rounded-xl border py-1 pr-2.5 pl-1 shadow-[0_2px_10px_-6px_hsl(var(--foreground)/0.3)] transition-all focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {getGithubAvatarUrl() ? (
                      <img
                        src={getGithubAvatarUrl() as string}
                        alt="Profile"
                        className="ring-background/60 h-7 w-7 rounded-full object-cover ring-2"
                      />
                    ) : (
                      <div className="bg-primary/15 text-primary flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold">
                        {getUserInitials()}
                      </div>
                    )}
                    <span className="hidden max-w-[88px] truncate text-sm font-medium lg:block">
                      {userProfile?.displayName ||
                        userProfile?.githubUsername ||
                        "User"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "text-muted-foreground h-3.5 w-3.5 transition-transform duration-200",
                        showUserDropdown && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{
                          duration: 0.18,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="border-border/50 bg-popover/95 absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border shadow-[0_16px_40px_-16px_hsl(var(--foreground)/0.5)] backdrop-blur-xl"
                      >
                        <div className="border-border/40 bg-muted/20 border-b px-3 py-2.5">
                          <p className="text-foreground truncate text-sm font-semibold">
                            {userProfile?.displayName ||
                              userProfile?.githubUsername ||
                              "User"}
                          </p>
                          <p className="text-muted-foreground truncate text-xs">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-1.5">
                          <button
                            onClick={() => {
                              handleNavigate("history");
                              setShowUserDropdown(false);
                            }}
                            className="text-foreground hover:bg-muted flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                          >
                            <History className="text-muted-foreground h-4 w-4" />
                            Scan History
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setShowUserDropdown(false);
                            }}
                            className="text-destructive hover:bg-destructive/8 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden items-center gap-1.5 md:flex">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAuthModal(true)}
                    className="border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 rounded-lg border px-3.5 text-xs"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setShowAuthModal(true)}
                    className="from-primary to-primary/80 text-primary-foreground shadow-primary/30 hidden h-9 items-center gap-1.5 rounded-lg bg-gradient-to-br px-3.5 text-xs shadow-lg transition-all hover:scale-105 active:scale-95 lg:flex"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Get Started
                  </Button>
                </div>
              )}

              {/* Divider */}
              <div className="bg-border/40 hidden h-5 w-px md:block" />

              {/* Utility pill */}
              <div className="border-border/50 bg-muted/30 flex items-center gap-0.5 rounded-xl border p-0.5 backdrop-blur-sm">
                <ThemeToggle />
                <NotificationCenter className="hover:bg-muted/60 h-8 w-8 rounded-lg transition-colors" />
                <PWAQuickActions className="hover:bg-muted/60 hidden h-8 w-8 rounded-lg transition-colors sm:flex" />
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                className="border-border/40 hover:bg-muted/60 focus-visible:ring-primary/50 flex h-9 w-9 items-center justify-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:outline-none md:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu — bottom sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-background/50 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.06, duration: 0.42 }}
              className="border-border/40 bg-background/96 fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t shadow-[0_-24px_64px_-20px_hsl(var(--foreground)/0.35)] backdrop-blur-2xl md:hidden"
              style={{ maxHeight: "88dvh" }}
            >
              {/* Handle */}
              <div className="flex flex-shrink-0 justify-center pt-3 pb-1">
                <div className="bg-muted-foreground/25 h-1 w-10 rounded-full" />
              </div>

              {/* Drawer header */}
              <div className="border-border/25 flex flex-shrink-0 items-center justify-between border-b px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="from-primary/20 to-primary/5 border-primary/25 flex h-8 w-8 items-center justify-center rounded-lg border bg-gradient-to-br">
                    <Shield className="text-primary h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm leading-tight font-semibold">
                      Code <span className="text-primary">Guardian</span>
                    </p>
                    <p className="text-muted-foreground font-mono text-[9px] leading-tight tracking-widest uppercase">
                      Navigation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/60 flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Nav grid */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {navItems.map((item, i) => {
                    const active = isActive(item.id);
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: i * 0.035,
                          duration: 0.22,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onClick={() => handleNavigate(item.id)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border p-3.5 text-left transition-all active:scale-[0.97]",
                          active
                            ? "border-primary/30 bg-primary/10"
                            : "border-border/35 bg-muted/15 hover:bg-muted/35 hover:border-border/60"
                        )}
                      >
                        {active && (
                          <div className="from-primary/15 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent" />
                        )}
                        <div
                          className={cn(
                            "relative flex h-8 w-8 items-center justify-center rounded-lg",
                            active
                              ? "bg-primary/20 text-primary"
                              : "bg-background/80 text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="relative flex w-full items-center justify-between gap-1">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              active ? "text-primary" : "text-foreground"
                            )}
                          >
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[8px] font-black tracking-widest uppercase",
                                active
                                  ? "bg-primary/20 text-primary"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              {/* Auth footer */}
              <div
                className="border-border/25 flex-shrink-0 border-t px-4 py-4"
                style={{
                  paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
                }}
              >
                {user ? (
                  <div className="flex items-center gap-3">
                    {getGithubAvatarUrl() ? (
                      <img
                        src={getGithubAvatarUrl() as string}
                        alt="Profile"
                        className="ring-primary/20 h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2"
                      />
                    ) : (
                      <div className="bg-primary/15 text-primary ring-primary/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2">
                        {getUserInitials()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-semibold">
                        {userProfile?.displayName ||
                          userProfile?.githubUsername ||
                          "User"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      aria-label="Sign out"
                      className="border-border/40 text-muted-foreground hover:text-destructive hover:border-destructive/40 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="border-border/50 bg-muted/20 hover:bg-muted/50 h-10 flex-1 gap-2 rounded-xl text-sm"
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4" />
                      Sign In
                    </Button>
                    <Button
                      className="from-primary to-primary/80 shadow-primary/25 h-10 flex-1 gap-2 rounded-xl bg-gradient-to-br text-sm shadow-md transition-transform active:scale-95"
                      onClick={() => {
                        setShowAuthModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Zap className="h-4 w-4" />
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
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
