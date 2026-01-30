"use client";

import React from "react";
import { PWADashboard } from "../components/pwa/PWADashboard";
import { PageLayout } from "../components/layout/PageLayout";
import { Home, Settings, Smartphone, ChevronRight } from "lucide-react";
import { useNavigation } from "@/lib/navigation-context";
import { AnimatedBackground } from "@/components/pages/about/AnimatedBackground";

export function PWASettingsPage() {
  const { navigateTo } = useNavigation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950">
      <AnimatedBackground />
      <PageLayout>
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav
            className="mb-6 flex items-center text-sm"
            aria-label="Breadcrumb"
          >
            <button
              onClick={() => navigateTo("home")}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Settings className="h-4 w-4" />
              Settings
            </span>
            <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />
            <span className="flex items-center gap-1.5 font-medium">
              <Smartphone className="h-4 w-4" />
              PWA
            </span>
          </nav>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">PWA Settings</h1>
            <p className="text-muted-foreground">
              Manage your progressive web app experience, offline storage, and
              notifications.
            </p>
          </div>

          {/* PWA Dashboard */}
          <PWADashboard />
        </div>
      </PageLayout>
    </div>
  );
}

export default PWASettingsPage;
