/**
 * Notification System Demo Component
 * Demonstrates all notification features
 */

import React, { useState } from "react";
import { notify } from "@/services/notifications/NotificationManager";
import {
  enhancedNotifications,
  batchNotifications,
} from "@/utils/enhancedToastNotifications";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Zap, AlertTriangle, CheckCircle, Info } from "lucide-react";

const NotificationDemo: React.FC = () => {
  const { unreadCount, getStats } = useNotifications();
  const [demoCount, setDemoCount] = useState(0);

  const stats = getStats();

  const testBasicNotifications = () => {
    notify.success("Success Notification");
    notify.error("Error Notification");
    notify.warning("Warning Notification");
    notify.info("Info Notification");
  };

  const testPriorities = () => {
    notify.info("Low Priority", { priority: "low" });
    notify.success("Normal Priority", { priority: "normal" });
    notify.warning("High Priority", { priority: "high" });
    notify.error("Urgent Priority", { priority: "urgent" });
  };

  const testCategories = () => {
    notify.info("System notification", { category: "system" });
    notify.success("Analysis notification", { category: "analysis" });
    notify.warning("Security notification", { category: "security" });
    notify.error("Auth notification", { category: "auth" });
  };

  const testBatching = () => {
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        notify.info(`Batch notification ${i}`, {
          message: "Testing batching system",
          priority: "normal",
        });
      }, i * 100);
    }
  };

  const testWithActions = () => {
    notify.warning("Action Required", {
      message: "This notification has an action button",
      priority: "high",
      action: {
        label: "View Details",
        onClick: () => alert("Action clicked!"),
      },
    });
  };

  const testEnhancedNotifications = () => {
    enhancedNotifications.analysisCompleted(5, "example.js");
    enhancedNotifications.criticalIssuesFound(3, "auth.ts");
    enhancedNotifications.fileUploadCompleted("data.csv");
  };

  const testBatchAnalysis = () => {
    batchNotifications.analysisResults([
      { filename: "app.js", issueCount: 5 },
      { filename: "api.ts", issueCount: 12 },
      { filename: "utils.js", issueCount: 3 },
    ]);
  };

  const testSecurityNotifications = () => {
    enhancedNotifications.criticalIssuesFound(5, "payment.js");
    enhancedNotifications.vulnerabilitiesDetected(8, "database.sql");
  };

  const testWorkflow = () => {
    const count = demoCount + 1;
    setDemoCount(count);

    // Simulate analysis workflow
    enhancedNotifications.analysisStarted(`demo-file-${count}.js`);

    setTimeout(() => {
      enhancedNotifications.analysisCompleted(7, `demo-file-${count}.js`);
    }, 2000);

    setTimeout(() => {
      if (count % 3 === 0) {
        enhancedNotifications.criticalIssuesFound(2, `demo-file-${count}.js`);
      }
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Bell className="h-10 w-10 text-primary" />
          Notification System Demo
        </h1>
        <p className="text-lg text-muted-foreground">
          Test and explore all notification features including priorities,
          categories, batching, and more.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Bell className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="destructive" className="mb-2">
                {stats.unread}
              </Badge>
              <div className="text-3xl font-bold">{stats.unread}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-3xl font-bold">{stats.byType.warning}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-3xl font-bold">{stats.byType.success}</div>
              <div className="text-sm text-muted-foreground">Success</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Basic Notifications
            </CardTitle>
            <CardDescription>Test all notification types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testBasicNotifications}
              className="w-full"
              variant="outline"
            >
              Test All Types
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => notify.success("Success!")}
                variant="outline"
                size="sm"
              >
                Success
              </Button>
              <Button
                onClick={() => notify.error("Error!")}
                variant="outline"
                size="sm"
              >
                Error
              </Button>
              <Button
                onClick={() => notify.warning("Warning!")}
                variant="outline"
                size="sm"
              >
                Warning
              </Button>
              <Button
                onClick={() => notify.info("Info!")}
                variant="outline"
                size="sm"
              >
                Info
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Priorities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Priority Levels
            </CardTitle>
            <CardDescription>Test different priority levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testPriorities}
              className="w-full"
              variant="outline"
            >
              Test All Priorities
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => notify.info("Low", { priority: "low" })}
                variant="outline"
                size="sm"
              >
                Low
              </Button>
              <Button
                onClick={() => notify.info("Normal", { priority: "normal" })}
                variant="outline"
                size="sm"
              >
                Normal
              </Button>
              <Button
                onClick={() => notify.warning("High", { priority: "high" })}
                variant="outline"
                size="sm"
              >
                High
              </Button>
              <Button
                onClick={() => notify.error("Urgent", { priority: "urgent" })}
                variant="outline"
                size="sm"
              >
                Urgent
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Test notification categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testCategories}
              className="w-full"
              variant="outline"
            >
              Test Categories
            </Button>
            <div className="flex flex-wrap gap-2">
              {[
                "system",
                "analysis",
                "security",
                "auth",
                "storage",
                "network",
                "export",
                "general",
              ].map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() =>
                    notify.info(`${cat} notification`, { category: cat as any })
                  }
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Batching */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Batching</CardTitle>
            <CardDescription>
              Test batching multiple notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testBatching} className="w-full" variant="outline">
              Send 5 Notifications (Batched)
            </Button>
            <p className="text-xs text-muted-foreground">
              Sends 5 notifications quickly to demonstrate batching. Configure
              batching in preferences.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>With Actions</CardTitle>
            <CardDescription>Notifications with action buttons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testWithActions}
              className="w-full"
              variant="outline"
            >
              Test Action Button
            </Button>
            <Button
              onClick={() => enhancedNotifications.sessionExpired()}
              className="w-full"
              variant="outline"
            >
              Session Expired (with action)
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Notifications</CardTitle>
            <CardDescription>
              Pre-configured notification templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={testEnhancedNotifications}
              className="w-full"
              variant="outline"
            >
              Test Enhanced
            </Button>
            <Button
              onClick={testBatchAnalysis}
              className="w-full"
              variant="outline"
            >
              Batch Analysis
            </Button>
            <Button
              onClick={testSecurityNotifications}
              className="w-full"
              variant="outline"
            >
              Security Alerts
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Simulation */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Complete Workflow Simulation</CardTitle>
            <CardDescription>
              Simulates a complete analysis workflow with multiple notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testWorkflow} className="w-full" size="lg">
              Start Analysis Workflow (Demo #{demoCount + 1})
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              This simulates a real analysis workflow: starts analysis,
              completes with results, and sometimes shows critical issues. Watch
              the notification center!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">1. Open Notification Center</h4>
            <p className="text-sm text-muted-foreground">
              Click the bell icon in the top navigation bar to view all
              notifications.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">2. Configure Preferences</h4>
            <p className="text-sm text-muted-foreground">
              Click the settings icon in the notification center to customize:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-2">
              <li>Enable/disable notifications</li>
              <li>Configure batching (delay and max size)</li>
              <li>Filter by category and priority</li>
              <li>Enable browser notifications</li>
              <li>Enable sound notifications</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">3. Test Features</h4>
            <p className="text-sm text-muted-foreground">
              Use the buttons above to test different notification types and
              features.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">4. Manage Notifications</h4>
            <p className="text-sm text-muted-foreground">
              In the notification center, you can:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-2">
              <li>Mark individual notifications as read</li>
              <li>Mark all as read</li>
              <li>Dismiss notifications</li>
              <li>Clear all notifications</li>
              <li>Filter by category or priority</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDemo;
