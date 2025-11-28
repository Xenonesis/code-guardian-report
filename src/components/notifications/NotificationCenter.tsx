/**
 * Notification Center Component
 * Displays notification history with filtering and actions
 */

import React, { useState, useEffect } from 'react';
import { Bell, Settings, Check, Trash2, Filter, X } from 'lucide-react';
import { NotificationManager, Notification, NotificationCategory, NotificationPriority } from '@/services/notifications/NotificationManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import NotificationPreferences from './NotificationPreferences';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = NotificationManager.subscribe((notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read && !n.dismissed).length);
    });

    // Listen for custom event to open panel
    const handleOpenPanel = () => setIsOpen(true);
    window.addEventListener('openNotificationPanel', handleOpenPanel);

    return () => {
      unsubscribe();
      window.removeEventListener('openNotificationPanel', handleOpenPanel);
    };
  }, []);

  const filteredNotifications = notifications
    .filter(n => !n.dismissed)
    .filter(n => filterCategory === 'all' || n.category === filterCategory)
    .filter(n => filterPriority === 'all' || n.priority === filterPriority)
    .filter(n => !showOnlyUnread || !n.read)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleMarkAsRead = (id: string) => {
    NotificationManager.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    NotificationManager.markAllAsRead();
  };

  const handleDismiss = (id: string) => {
    NotificationManager.dismiss(id);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      NotificationManager.clearAll();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-950';
      case 'warning':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950';
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      normal: 'bg-blue-500',
      low: 'bg-gray-500',
    };
    
    if (priority === 'normal') return null; // Don't show badge for normal priority
    
    return (
      <Badge variant="secondary" className={cn('text-xs', colors[priority], 'text-white')}>
        {priority}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const stats = NotificationManager.getStats();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative p-1 sm:p-1.5', className)}>
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-xl">
        {showPreferences ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowPreferences(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NotificationPreferences />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount} new</Badge>
                  )}
                </SheetTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPreferences(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <SheetDescription>
                View and manage your notifications
              </SheetDescription>
            </SheetHeader>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 my-4">
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-blue-600">{stats.byType.info}</div>
                <div className="text-xs text-muted-foreground">Info</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-orange-600">{stats.byType.warning}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <div className="text-2xl font-bold text-red-600">{stats.byType.error}</div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            </div>

            {/* Filters */}
            <Tabs defaultValue="all" className="mb-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" onClick={() => setShowOnlyUnread(false)}>
                  All
                </TabsTrigger>
                <TabsTrigger value="unread" onClick={() => setShowOnlyUnread(true)}>
                  Unread ({unreadCount})
                </TabsTrigger>
                <TabsTrigger value="filters">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as any)}
                  >
                    <option value="all">All Categories</option>
                    <option value="system">System</option>
                    <option value="analysis">Analysis</option>
                    <option value="security">Security</option>
                    <option value="auth">Authentication</option>
                    <option value="storage">Storage</option>
                    <option value="network">Network</option>
                    <option value="export">Export</option>
                    <option value="general">General</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as any)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </TabsContent>
            </Tabs>

            {/* Notification List */}
            <ScrollArea className="h-[calc(100vh-400px)]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 rounded-lg border transition-all',
                        !notification.read && 'bg-accent/50 border-primary/50',
                        notification.read && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold',
                            getNotificationColor(notification.type)
                          )}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            {getPriorityBadge(notification.priority)}
                          </div>
                          
                          {notification.message && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            <span>•</span>
                            <span className="capitalize">{notification.category}</span>
                          </div>

                          {notification.action && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto mt-2"
                              onClick={notification.action.onClick}
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDismiss(notification.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
