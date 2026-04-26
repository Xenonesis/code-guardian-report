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
  GitFork,
  ChevronDown,
  FileClock,
  Zap,
  Cpu,
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
    const githubUserId = githubProvider?.id;
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
    let ticking = false;

    const updateScrollState = () => {
      const nextIsScrolled = window.scrollY > 20;
      setIsScrolled((prev) =>
        prev === nextIsScrolled ? prev : nextIsScrolled
      );
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScrollState);
      }
    };

    updateScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const previousStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
    };

    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      const scrollbarCompensation = Math.max(
        0,
        window.innerWidth - document.documentElement.clientWidth
      );

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      if (scrollbarCompensation > 0) {
        document.body.style.paddingRight = `${scrollbarCompensation}px`;
      }
      document.documentElement.style.setProperty("scrollbar-gutter", "stable");
    } else {
      const top = document.body.style.top;
      document.body.style.position = previousStyles.position;
      document.body.style.top = previousStyles.top;
      document.body.style.left = previousStyles.left;
      document.body.style.right = previousStyles.right;
      document.body.style.overflow = previousStyles.overflow;
      document.body.style.paddingRight = previousStyles.paddingRight;
      document.documentElement.style.removeProperty("scrollbar-gutter");
      if (top) {
        window.scrollTo(0, parseInt(top, 10) * -1);
      }
    }

    return () => {
      document.body.style.position = previousStyles.position;
      document.body.style.top = previousStyles.top;
      document.body.style.left = previousStyles.left;
      document.body.style.right = previousStyles.right;
      document.body.style.overflow = previousStyles.overflow;
      document.body.style.paddingRight = previousStyles.paddingRight;
      document.documentElement.style.removeProperty("scrollbar-gutter");
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
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
    { id: "github-analysis", label: "GitHub", icon: GitFork, badge: "Pro" },
    { id: "mcp-setup", label: "MCP", icon: Cpu, badge: "New" },
    { id: "changelog", label: "Changelog", icon: FileClock },
    { id: "legal", label: "Legal", icon: Shield },
  ];

  const isActive = (id: string) => currentSection === id;

  if (!mounted) return null;

  const navContent = (
    <>
      <motion.nav
        role="banner"
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
              className="group flex items-center gap-2 transition-opacity hover:opacity-90 sm:gap-2.5"
            >
              <div className="relative">
                <div className="from-primary/25 to-primary/5 border-primary/35 relative flex h-9 w-9 items-center justify-center rounded-lg border bg-gradient-to-tr shadow-[0_0_0_1px_hsl(var(--background))_inset] transition-transform group-hover:scale-105">
                  <Shield className="text-primary h-5 w-5 transition-colors" />
                </div>
              </div>
              <div className="hidden items-center sm:flex">
                <span className="font-display text-foreground text-lg font-medium tracking-tight whitespace-nowrap md:text-xl">
                  Code Guardian
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
                      "group focus-visible:ring-primary/50 relative flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors outline-none focus-visible:ring-2",
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
                          "h-4 w-4",
                          active ? "opacity-90" : "opacity-60"
                        )}
                      />
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
              <div className="border-border/50 bg-muted/30 hidden items-center gap-0.5 rounded-xl border p-0.5 backdrop-blur-sm md:flex">
                <ThemeToggle />
                <NotificationCenter className="hover:bg-muted/60 h-8 w-8 rounded-lg transition-colors" />
                <PWAQuickActions className="hover:bg-muted/60 hidden h-8 w-8 rounded-lg transition-colors sm:flex" />
              </div>

              {/* Mobile Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="border-border/50 hover:bg-muted/70 h-9 w-9 rounded-lg border lg:hidden"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
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
      <div
        className={cn(
          "bg-background/96 fixed inset-0 z-40 overflow-y-scroll overscroll-contain backdrop-blur-3xl transition-opacity duration-200 lg:hidden",
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="from-primary/12 via-primary/4 to-background pointer-events-none fixed inset-0 z-[-1] bg-gradient-to-b" />
        <div className="relative px-6 pt-24 pb-20">
          {isMobileMenuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
                hidden: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 },
                },
              }}
            >
              <div className="border-border/50 bg-muted/25 mb-4 flex items-center justify-between rounded-xl border p-2">
                <span className="text-muted-foreground font-mono text-[10px] tracking-[0.12em] uppercase">
                  Quick Actions
                </span>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <NotificationCenter className="hover:bg-muted/60 h-8 w-8 rounded-lg transition-colors" />
                  <PWAQuickActions className="hover:bg-muted/60 h-8 w-8 rounded-lg transition-colors" />
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = isActive(item.id);
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      onClick={() => handleNavigate(item.id)}
                      className={cn(
                        "group border-border/45 relative flex w-full items-center gap-4 overflow-hidden rounded-xl border px-4 py-3 text-left transition-all active:scale-95",
                        active
                          ? "bg-primary text-primary-foreground shadow-primary/25 shadow-lg"
                          : "bg-background/60 text-muted-foreground hover:bg-muted/55 hover:text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-foreground group-hover:bg-background"
                        )}
                      >
                        <Icon className="h-5 w-5" />
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
                        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
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
                className="space-y-4 pt-6"
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
          )}
        </div>
      </div>
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
