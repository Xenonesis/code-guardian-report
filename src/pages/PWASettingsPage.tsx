import React from 'react';
import { PWADashboard } from '../components/pwa/PWADashboard';
import { PageLayout } from '../components/layout/PageLayout';
import { Home, Settings, Smartphone, ChevronRight } from 'lucide-react';
import { useNavigation } from '@/lib/navigation-context';

export function PWASettingsPage() {
  const { navigateTo } = useNavigation();
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </span>
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          <span className="flex items-center gap-1.5 font-medium">
            <Smartphone className="h-4 w-4" />
            PWA
          </span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">PWA Settings</h1>
          <p className="text-muted-foreground">
            Manage your progressive web app experience, offline storage, and notifications.
          </p>
        </div>

        {/* PWA Dashboard */}
        <PWADashboard />
      </div>
    </PageLayout>
  );
}

export default PWASettingsPage;
