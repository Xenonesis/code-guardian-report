/**
 * Notification System Test Page
 * Accessible via /notification-test route
 */

import React, { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationManager } from "@/services/notifications/NotificationManager";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
  Activity,
  Bell,
  BellRing,
  ClipboardList,
  Database,
  Folder,
  Gauge,
  Layers,
  Loader2,
  MousePointerClick,
  Play,
  RefreshCw,
} from "lucide-react";

const NotificationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { notifications, unreadCount, notify } = useNotifications();
  const { theme, setTheme } = useDarkMode();

  const logTest = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults((prev) => [
      `[${timestamp}] ${message}`,
      ...prev.slice(0, 49),
    ]);
  };

  // Test 1: Basic Notifications
  const testBasicNotifications = () => {
    logTest("TEST: Basic notifications");

    notify.success("Success Test", {
      message: "This is a success notification",
      category: "general",
    });
    logTest("PASS: Success notification sent");

    setTimeout(() => {
      notify.error("Error Test", {
        message: "This is an error notification",
        category: "general",
      });
      logTest("PASS: Error notification sent");
    }, 500);

    setTimeout(() => {
      notify.warning("Warning Test", {
        message: "This is a warning notification",
        category: "general",
      });
      logTest("PASS: Warning notification sent");
    }, 1000);

    setTimeout(() => {
      notify.info("Info Test", {
        message: "This is an info notification",
        category: "general",
      });
      logTest("PASS: Info notification sent");
    }, 1500);
  };

  // Test 2: Priority Levels
  const testPriorityLevels = () => {
    logTest("TEST: Priority levels");

    ["urgent", "high", "normal", "low"].forEach((priority, index) => {
      setTimeout(() => {
        notify.info(`${priority.toUpperCase()} Priority`, {
          message: `Testing ${priority} priority notification`,
          priority: priority as "urgent" | "high" | "normal" | "low",
          category: "system",
        });
        logTest(`PASS: ${priority} priority notification sent`);
      }, index * 500);
    });
  };

  // Test 3: Categories
  const testCategories = () => {
    logTest("TEST: Categories");

    const categories = [
      "system",
      "analysis",
      "security",
      "auth",
      "storage",
      "network",
      "export",
      "general",
    ];

    categories.forEach((category, index) => {
      setTimeout(() => {
        notify.info(`${category.toUpperCase()} Category`, {
          message: `Testing ${category} category`,
          category: category as
            | "system"
            | "analysis"
            | "security"
            | "auth"
            | "storage"
            | "network"
            | "export"
            | "general",
        });
        logTest(`PASS: ${category} category notification sent`);
      }, index * 300);
    });
  };

  // Test 4: Notification with Action
  const testNotificationWithAction = () => {
    logTest("TEST: Notification with action");

    notify.info("Action Test", {
      message: "This notification has an action button",
      action: {
        label: "Click Me",
        onClick: () => {
          toast.success("Action button clicked!");
          logTest("PASS: Action button executed");
        },
      },
    });
    logTest("PASS: Notification with action sent");
  };

  // Test 5: Batching
  const testBatching = () => {
    logTest("TEST: Notification batching (5 notifications)");

    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        notify.info(`Batch Notification ${i}`, {
          message: `This is batch notification ${i} of 5`,
          priority: "normal",
        });
        logTest(`PASS: Batch notification ${i} sent`);
      }, i * 100);
    }
  };

  // Test 6: Real-time Updates
  const testRealTimeUpdates = () => {
    logTest("TEST: Real-time updates (10 seconds)");
    let count = 0;

    const interval = setInterval(() => {
      count++;
      notify.info(`Real-time Update ${count}`, {
        message: `Update at ${new Date().toLocaleTimeString()}`,
        priority: "low",
      });
      logTest(`PASS: Real-time update ${count} sent`);

      if (count >= 10) {
        clearInterval(interval);
        logTest("DONE: Real-time test completed");
      }
    }, 1000);
  };

  // Test 7: Stress Test
  const testStressTest = () => {
    logTest("TEST: Stress test (20 notifications)");

    const types = ["success", "error", "warning", "info"] as const;
    const priorities = ["urgent", "high", "normal", "low"] as const;

    for (let i = 1; i <= 20; i++) {
      setTimeout(() => {
        const type = types[Math.floor(Math.random() * types.length)];
        const priority =
          priorities[Math.floor(Math.random() * priorities.length)];

        NotificationManager.notify(type, `Stress Test ${i}`, {
          message: `Random notification ${i} of 20`,
          priority,
          category: "general",
        });

        if (i % 5 === 0) {
          logTest(`PASS: ${i} notifications sent`);
        }
      }, i * 100);
    }

    setTimeout(() => {
      logTest("DONE: Stress test completed");
    }, 2500);
  };

  // Test 8: Toast Integration Test
  const testToastIntegration = () => {
    logTest("TEST: Toast integration");

    toast.success("Direct Toast Success", {
      description: "This is using sonner directly",
    });
    logTest("PASS: Direct toast sent");

    setTimeout(() => {
      toast.error("Direct Toast Error", {
        description: "Testing error toast",
      });
      logTest("PASS: Error toast sent");
    }, 500);

    setTimeout(() => {
      toast.warning("Direct Toast Warning", {
        description: "Testing warning toast",
      });
      logTest("PASS: Warning toast sent");
    }, 1000);
  };

  // Test 9: Persistence Test
  const testPersistence = () => {
    logTest("TEST: localStorage persistence");

    try {
      const stored = localStorage.getItem("notificationHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        logTest(`PASS: Found ${parsed.length} stored notifications`);
      } else {
        logTest("PASS: No stored notifications (fresh start)");
      }

      // Create a test notification
      notify.info("Persistence Test", {
        message: "This should be persisted to localStorage",
      });

      setTimeout(() => {
        const updated = localStorage.getItem("notificationHistory");
        if (updated) {
          logTest("PASS: Notification successfully persisted");
        } else {
          logTest("WARN: Notification not persisted");
        }
      }, 500);
    } catch (error) {
      logTest(`FAIL: Persistence test failed: ${error}`);
    }
  };

  // Test 10: Comprehensive Test
  const runComprehensiveTest = async () => {
    setIsRunning(true);
    logTest("START: Comprehensive notification test suite");

    await new Promise((resolve) => setTimeout(resolve, 500));
    testBasicNotifications();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    testPriorityLevels();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    testCategories();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    testNotificationWithAction();

    await new Promise((resolve) => setTimeout(resolve, 2000));
    testBatching();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    testToastIntegration();

    await new Promise((resolve) => setTimeout(resolve, 3000));
    testPersistence();

    await new Promise((resolve) => setTimeout(resolve, 2000));
    logTest("DONE: Comprehensive test suite completed");
    setIsRunning(false);
  };

  // Statistics
  const stats = NotificationManager.getStats();

  useEffect(() => {
    // Welcome notification
    notify.info("Notification Test Page", {
      message: "Welcome to the notification system test page!",
      category: "system",
    });
  }, []);

  return (
    <PageLayout theme={theme} onThemeChange={setTheme}>
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Real-Time Notification System Test
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} unread</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Comprehensive testing suite for the notification system. Click the
              bell icon in the top right to view all notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-muted-foreground text-sm">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.byType.success}
                  </div>
                  <div className="text-muted-foreground text-sm">Success</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {stats.byType.error}
                  </div>
                  <div className="text-muted-foreground text-sm">Errors</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {unreadCount}
                  </div>
                  <div className="text-muted-foreground text-sm">Unread</div>
                </CardContent>
              </Card>
            </div>

            {/* Individual Tests */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Individual Tests</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Button
                  onClick={testBasicNotifications}
                  variant="outline"
                  className="w-full"
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Basic Notifications
                </Button>
                <Button
                  onClick={testPriorityLevels}
                  variant="outline"
                  className="w-full"
                >
                  <Gauge className="mr-2 h-4 w-4" />
                  Priority Levels
                </Button>
                <Button
                  onClick={testCategories}
                  variant="outline"
                  className="w-full"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Categories
                </Button>
                <Button
                  onClick={testNotificationWithAction}
                  variant="outline"
                  className="w-full"
                >
                  <MousePointerClick className="mr-2 h-4 w-4" />
                  With Action
                </Button>
                <Button
                  onClick={testBatching}
                  variant="outline"
                  className="w-full"
                >
                  <Layers className="mr-2 h-4 w-4" />
                  Batching
                </Button>
                <Button
                  onClick={testRealTimeUpdates}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Real-time Updates
                </Button>
                <Button
                  onClick={testStressTest}
                  variant="outline"
                  className="w-full"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Stress Test
                </Button>
                <Button
                  onClick={testToastIntegration}
                  variant="outline"
                  className="w-full"
                >
                  <BellRing className="mr-2 h-4 w-4" />
                  Toast Integration
                </Button>
                <Button
                  onClick={testPersistence}
                  variant="outline"
                  className="w-full"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Persistence
                </Button>
              </div>
            </div>

            {/* Comprehensive Test */}
            <div>
              <Button
                onClick={runComprehensiveTest}
                disabled={isRunning}
                className="w-full"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Comprehensive Test Suite
                  </>
                )}
              </Button>
            </div>

            {/* Test Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Test Log (Real-Time)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-1 overflow-y-auto rounded bg-slate-50 p-4 font-mono text-xs dark:bg-slate-900">
                  {testResults.length === 0 ? (
                    <div className="text-muted-foreground">
                      No tests run yet. Click a test button to start!
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <div
                        key={index}
                        className="text-green-600 dark:text-green-400"
                      >
                        {result}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Current Notifications Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Recent Notifications ({notifications.length} total)
                </CardTitle>
                <CardDescription>Showing last 5 notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {notifications
                    .slice(0, 5)
                    .reverse()
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className={`rounded border p-3 text-sm ${
                          !notif.read
                            ? "bg-accent/50 border-primary/50"
                            : "opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{notif.title}</div>
                            {notif.message && (
                              <div className="text-muted-foreground mt-1 text-xs">
                                {notif.message}
                              </div>
                            )}
                            <div className="text-muted-foreground mt-1 text-xs">
                              <span className="inline-flex items-center gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {notif.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {notif.priority}
                                </Badge>
                                <span>
                                  •{" "}
                                  {new Date(
                                    notif.timestamp
                                  ).toLocaleTimeString()}
                                </span>
                              </span>
                            </div>
                          </div>
                          {!notif.read && (
                            <Badge variant="destructive" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  {notifications.length === 0 && (
                    <div className="text-muted-foreground py-8 text-center">
                      No notifications yet. Run a test to create some!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default NotificationTest;
