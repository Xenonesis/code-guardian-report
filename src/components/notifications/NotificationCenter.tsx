/**
 * Notification Center Component
 * Displays notification history with filtering and actions
 */

import React, { useState, useEffect } from "react";
import {
  Bell,
  Settings,
  Check,
  Trash2,
  Filter,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  NotificationManager,
  Notification,
  NotificationCategory,
  NotificationPriority,
} from "@/services/notifications/NotificationManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import NotificationPreferences from "./NotificationPreferences";
import { LenisContext } from "../../../app/providers/SmoothScrollProvider";

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filterCategory, setFilterCategory] = useState<
    NotificationCategory | "all"
  >("all");
  const [filterPriority, setFilterPriority] = useState<
    NotificationPriority | "all"
  >("all");
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const lenis = React.useContext(LenisContext);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = NotificationManager.subscribe((notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read && !n.dismissed).length);
    });

    // Listen for custom event to open panel
    const handleOpenPanel = () => setIsOpen(true);
    window.addEventListener("openNotificationPanel", handleOpenPanel);

    return () => {
      unsubscribe();
      window.removeEventListener("openNotificationPanel", handleOpenPanel);
    };
  }, []);

  // Explicitly manage body scroll lock to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPointerEvents = document.body.style.pointerEvents;

      // Nuclear lock for both html and body
      document.body.style.setProperty("overflow", "hidden", "important");
      document.documentElement.style.setProperty(
        "overflow",
        "hidden",
        "important"
      );
      document.body.style.pointerEvents = "none";

      // Stop Lenis if it exists
      if (lenis) {
        lenis.stop();
      }

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.pointerEvents = originalBodyPointerEvents;

        // Start Lenis again
        if (lenis) {
          lenis.start();
        }
      };
    }
    return undefined;
  }, [isOpen, lenis]);

  const filteredNotifications = notifications
    .filter((n) => !n.dismissed)
    .filter((n) => filterCategory === "all" || n.category === filterCategory)
    .filter((n) => filterPriority === "all" || n.priority === filterPriority)
    .filter((n) => !showOnlyUnread || !n.read)
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
    if (confirm("Are you sure you want to clear all notifications?")) {
      NotificationManager.clearAll();
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 dark:bg-green-950";
      case "error":
        return "text-red-600 bg-red-50 dark:bg-red-950";
      case "warning":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950";
      case "info":
      default:
        return "text-primary bg-muted dark:bg-blue-950";
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    const colors = {
      urgent: "bg-red-500 text-white dark:text-white",
      high: "bg-orange-500 text-white dark:text-white",
      normal: "bg-muted text-muted-foreground",
      low: "bg-muted-foreground text-muted",
    };

    if (priority === "normal") return null; // Don't show badge for normal priority

    return (
      <Badge variant="secondary" className={cn("text-xs", colors[priority])}>
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

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
  };

  const stats = NotificationManager.getStats();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative p-1 sm:p-1.5", className)}
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white dark:text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        className="border-border/70 bg-card text-card-foreground pointer-events-auto flex h-full w-full flex-col overflow-hidden overscroll-none border-l p-0 opacity-100 shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.7)] filter-none backdrop-blur-none sm:max-w-xl"
        data-lenis-prevent
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          opacity: 1,
        }}
      >
        {showPreferences ? (
          <div
            className="flex flex-1 flex-col overflow-hidden p-6"
            data-lenis-prevent
          >
            <div className="border-border/60 mb-6 flex items-center justify-between border-b pb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreferences(false)}
                aria-label="Close notification preferences"
                className="h-9 w-9 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="-mr-4 flex-1 overscroll-y-contain pr-4">
              <div className="pr-1 pb-10">
                <NotificationPreferences />
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div
            className="flex flex-1 flex-col overflow-hidden p-6"
            data-lenis-prevent
          >
            <SheetHeader className="border-border/60 mb-4 flex-shrink-0 border-b pb-4">
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
                    aria-label="Open notification settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <SheetDescription>
                View and manage your notifications
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="-mr-4 flex-1 overscroll-y-contain pr-4">
              <div className="pr-1 pb-10">
                {/* Stats */}
                <div className="mb-6 grid grid-cols-4 gap-2">
                  <div className="border-border/60 bg-muted/40 rounded-lg border p-2 text-center">
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <div className="text-muted-foreground text-xs">Total</div>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-lg border p-2 text-center">
                    <div className="text-primary text-2xl font-bold">
                      {stats.byType.info}
                    </div>
                    <div className="text-muted-foreground text-xs">Info</div>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-lg border p-2 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.byType.warning}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Warnings
                    </div>
                  </div>
                  <div className="border-border/60 bg-muted/40 rounded-lg border p-2 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.byType.error}
                    </div>
                    <div className="text-muted-foreground text-xs">Errors</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mb-6 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className="font-tech rounded-md tracking-[0.08em] uppercase"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark all read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    disabled={notifications.length === 0}
                    className="font-tech rounded-md tracking-[0.08em] uppercase"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear all
                  </Button>
                </div>

                {/* Filters */}
                <Tabs defaultValue="all" className="mb-6">
                  <TabsList className="border-border/60 bg-muted/35 grid w-full grid-cols-3 rounded-md border p-1">
                    <TabsTrigger
                      value="all"
                      className="font-tech tracking-[0.08em] uppercase"
                      onClick={() => setShowOnlyUnread(false)}
                    >
                      All
                    </TabsTrigger>
                    <TabsTrigger
                      value="unread"
                      className="font-tech tracking-[0.08em] uppercase"
                      onClick={() => setShowOnlyUnread(true)}
                    >
                      Unread ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger
                      value="filters"
                      className="font-tech tracking-[0.08em] uppercase"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="filters" className="mt-4 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Category
                      </label>
                      <select
                        className="w-full rounded-md border p-2"
                        value={filterCategory}
                        onChange={(e) =>
                          setFilterCategory(
                            e.target.value as
                              | "all"
                              | "system"
                              | "analysis"
                              | "security"
                              | "auth"
                              | "storage"
                              | "network"
                              | "export"
                              | "general"
                          )
                        }
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
                      <label className="mb-2 block text-sm font-medium">
                        Priority
                      </label>
                      <select
                        className="w-full rounded-md border p-2"
                        value={filterPriority}
                        onChange={(e) =>
                          setFilterPriority(
                            e.target.value as
                              | "all"
                              | "urgent"
                              | "high"
                              | "normal"
                              | "low"
                          )
                        }
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

                {/* List Content */}
                {filteredNotifications.length === 0 ? (
                  <div className="text-muted-foreground py-12 text-center">
                    <Bell className="mx-auto mb-4 h-12 w-12 opacity-20" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "border-border/65 hover:border-primary/40 rounded-lg border p-4 transition-all hover:shadow-[0_10px_24px_-20px_hsl(var(--foreground)/0.8)]",
                          !notification.read &&
                            "bg-accent/45 border-primary/45",
                          notification.read && "opacity-70"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={cn(
                              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-semibold",
                              getNotificationColor(notification.type)
                            )}
                          >
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-start justify-between gap-2">
                              <h4 className="text-sm font-semibold">
                                {notification.title}
                              </h4>
                              {getPriorityBadge(notification.priority)}
                            </div>

                            {notification.message && (
                              <p className="text-muted-foreground mb-2 text-sm">
                                {notification.message}
                              </p>
                            )}

                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                              <span>
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {notification.category}
                              </span>
                            </div>

                            {notification.action && (
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-2 h-auto p-0"
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
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
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
              </div>
            </ScrollArea>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
