import React, { useState } from 'react';
import { 
  Home, 
  Info, 
  Lock, 
  Award, 
  FileText, 
  Search, 
  Settings, 
  HelpCircle, 
  History, 
  BarChart3, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
  currentSection,
  currentTab,
  onNavigate,
  className = '',
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const mainNavigationItems: SidebarItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-4 w-4" />,
      description: 'Main dashboard and code analysis'
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info className="h-4 w-4" />,
      description: 'Learn about Code Guardian'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: <Lock className="h-4 w-4" />,
      description: 'Privacy policy and data handling'
    },
    {
      id: 'terms',
      label: 'Terms',
      icon: <Award className="h-4 w-4" />,
      description: 'Terms of service and usage'
    }
  ];

  const homeSubItems: SidebarItem[] = [
    {
      id: 'upload',
      label: 'New Scan',
      icon: <FileText className="h-4 w-4" />,
      description: 'Upload and analyze code'
    },
    {
      id: 'ai-config',
      label: 'AI Configuration',
      icon: <Settings className="h-4 w-4" />,
      description: 'Configure AI analysis settings'
    },
    {
      id: 'prompts',
      label: 'Custom Prompts',
      icon: <Search className="h-4 w-4" />,
      description: 'Customize analysis prompts'
    },
    {
      id: 'results',
      label: 'Analysis Results',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'View detailed analysis results'
    },
    {
      id: 'security',
      label: 'Security Report',
      icon: <Shield className="h-4 w-4" />,
      description: 'Security vulnerabilities and fixes'
    },
    {
      id: 'dashboard',
      label: 'Analytics Dashboard',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'Comprehensive analytics view'
    },
    {
      id: 'history',
      label: 'Scan History',
      icon: <History className="h-4 w-4" />,
      description: 'Previous analysis sessions'
    }
  ];

  const helpItems: SidebarItem[] = [
    {
      id: 'help',
      label: 'Help & Documentation',
      icon: <HelpCircle className="h-4 w-4" />,
      description: 'User guides and documentation'
    }
  ];

  const isActive = (itemId: string, isSubItem = false) => {
    if (isSubItem) {
      return currentSection === 'home' && currentTab === itemId;
    }
    return currentSection === itemId;
  };

  const handleItemClick = (item: SidebarItem, isSubItem = false) => {
    if (item.disabled) return;
    
    if (isSubItem) {
      onNavigate('home', item.id);
    } else {
      onNavigate(item.id);
    }
    
    // Close mobile menu on item click
    setIsMobileOpen(false);
  };

  const renderItem = (item: SidebarItem, isSubItem = false) => {
    const active = isActive(item.id, isSubItem);
    
    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item, isSubItem)}
        disabled={item.disabled}
        className={cn(
          "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all duration-200 group",
          active
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200",
          item.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "flex-shrink-0 transition-transform duration-200",
          active ? "scale-110" : "group-hover:scale-105"
        )}>
          {item.icon}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {item.description}
              </p>
            )}
          </div>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className={cn(
      "flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-r border-slate-200/50 dark:border-slate-700/50",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Navigation
          </h2>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          )}
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Main
            </h3>
          )}
          {mainNavigationItems.map(item => renderItem(item))}
        </div>

        {/* Home Sub-items (only show when on home section) */}
        {currentSection === 'home' && (
          <div className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Analysis
              </h3>
            )}
            {homeSubItems.map(item => renderItem(item, true))}
          </div>
        )}

        {/* Help Section */}
        <div className="space-y-2">
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Support
            </h3>
          )}
          {helpItems.map(item => renderItem(item))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 left-4 z-50 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-lg shadow-lg md:hidden"
        aria-label="Toggle sidebar"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        ) : (
          <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        )}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-16 left-0 h-[calc(100vh-4rem)] z-40">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute top-0 left-0 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}; 