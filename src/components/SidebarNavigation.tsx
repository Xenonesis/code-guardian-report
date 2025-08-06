import React from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  badge?: string;
  disabled?: boolean;
}

interface SidebarNavigationProps {
  currentSection: string;
  currentTab?: string;
  onNavigate: (section: string, tab?: string) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = () => {
  return null;
};