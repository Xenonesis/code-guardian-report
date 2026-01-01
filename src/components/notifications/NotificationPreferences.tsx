/**
 * Notification Preferences Component
 * Allows users to configure notification settings
 */

import React, { useState, useEffect } from "react";
import {
  NotificationManager,
  NotificationPreferences as Preferences,
} from "@/services/notifications/NotificationManager";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Volume2, Layers, Clock, Archive, RotateCcw } from "lucide-react";

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<Preferences>(
    NotificationManager.getPreferences()
  );

  useEffect(() => {
    const unsubscribe = NotificationManager.subscribeToPreferences((prefs) => {
      setPreferences(prefs);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (key: keyof Preferences) => {
    NotificationManager.updatePreferences({
      [key]: !preferences[key],
    });
  };

  const handleCategoryToggle = (category: keyof Preferences["categories"]) => {
    NotificationManager.updatePreferences({
      categories: {
        ...preferences.categories,
        [category]: !preferences.categories[category],
      },
    });
  };

  const handlePriorityToggle = (priority: keyof Preferences["priorities"]) => {
    NotificationManager.updatePreferences({
      priorities: {
        ...preferences.priorities,
        [priority]: !preferences.priorities[priority],
      },
    });
  };

  const handleBatchingDelayChange = (value: number[]) => {
    NotificationManager.updatePreferences({
      batchingDelay: value[0],
    });
  };

  const handleMaxBatchSizeChange = (value: number[]) => {
    NotificationManager.updatePreferences({
      maxNotificationsPerBatch: value[0],
    });
  };

  const handleAutoMarkAsReadDelayChange = (value: number[]) => {
    NotificationManager.updatePreferences({
      autoMarkAsReadDelay: value[0],
    });
  };

  const handleMaxHistorySizeChange = (value: number[]) => {
    NotificationManager.updatePreferences({
      maxHistorySize: value[0],
    });
  };

  const handleReset = () => {
    if (confirm("Reset all notification preferences to default?")) {
      NotificationManager.resetPreferences();
    }
  };

  const handleRequestBrowserPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        NotificationManager.updatePreferences({
          showBrowserNotifications: true,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>
            Control how notifications are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="flex flex-col gap-1">
              <span>Enable Notifications</span>
              <span className="text-sm text-muted-foreground font-normal">
                Turn notifications on or off
              </span>
            </Label>
            <Switch
              id="enabled"
              checked={preferences.enabled}
              onCheckedChange={() => handleToggle("enabled")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label
              htmlFor="browser-notifications"
              className="flex flex-col gap-1"
            >
              <span>Browser Notifications</span>
              <span className="text-sm text-muted-foreground font-normal">
                Show desktop notifications
              </span>
            </Label>
            <div className="flex items-center gap-2">
              {!preferences.showBrowserNotifications &&
                "Notification" in window &&
                Notification.permission === "default" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRequestBrowserPermission}
                  >
                    Enable
                  </Button>
                )}
              <Switch
                id="browser-notifications"
                checked={preferences.showBrowserNotifications}
                onCheckedChange={() => handleToggle("showBrowserNotifications")}
                disabled={
                  "Notification" in window &&
                  Notification.permission === "denied"
                }
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="play-sound" className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Play Sound
              </span>
              <span className="text-sm text-muted-foreground font-normal">
                Play notification sounds
              </span>
            </Label>
            <Switch
              id="play-sound"
              checked={preferences.playSound}
              onCheckedChange={() => handleToggle("playSound")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Batching Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Batching
          </CardTitle>
          <CardDescription>
            Group multiple notifications together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="batching-enabled" className="flex flex-col gap-1">
              <span>Enable Batching</span>
              <span className="text-sm text-muted-foreground font-normal">
                Group notifications that arrive close together
              </span>
            </Label>
            <Switch
              id="batching-enabled"
              checked={preferences.batchingEnabled}
              onCheckedChange={() => handleToggle("batchingEnabled")}
            />
          </div>

          {preferences.batchingEnabled && (
            <>
              <div className="space-y-2">
                <Label>
                  Batching Delay:{" "}
                  {(preferences.batchingDelay / 1000).toFixed(1)}s
                </Label>
                <Slider
                  value={[preferences.batchingDelay]}
                  onValueChange={handleBatchingDelayChange}
                  min={500}
                  max={5000}
                  step={500}
                />
                <p className="text-sm text-muted-foreground">
                  Time to wait before showing batched notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Max Batch Size: {preferences.maxNotificationsPerBatch}
                </Label>
                <Slider
                  value={[preferences.maxNotificationsPerBatch]}
                  onValueChange={handleMaxBatchSizeChange}
                  min={1}
                  max={10}
                  step={1}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum notifications to show at once
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Auto Mark as Read */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Auto Mark as Read
          </CardTitle>
          <CardDescription>
            Automatically mark notifications as read
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-mark-read" className="flex flex-col gap-1">
              <span>Enable Auto Mark as Read</span>
              <span className="text-sm text-muted-foreground font-normal">
                Mark notifications as read after a delay
              </span>
            </Label>
            <Switch
              id="auto-mark-read"
              checked={preferences.autoMarkAsRead}
              onCheckedChange={() => handleToggle("autoMarkAsRead")}
            />
          </div>

          {preferences.autoMarkAsRead && (
            <div className="space-y-2">
              <Label>Delay: {preferences.autoMarkAsReadDelay}s</Label>
              <Slider
                value={[preferences.autoMarkAsReadDelay]}
                onValueChange={handleAutoMarkAsReadDelayChange}
                min={1}
                max={30}
                step={1}
              />
              <p className="text-sm text-muted-foreground">
                Time before automatically marking as read
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            History
          </CardTitle>
          <CardDescription>Manage notification history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="persist-history" className="flex flex-col gap-1">
              <span>Persist History</span>
              <span className="text-sm text-muted-foreground font-normal">
                Save notification history across sessions
              </span>
            </Label>
            <Switch
              id="persist-history"
              checked={preferences.persistHistory}
              onCheckedChange={() => handleToggle("persistHistory")}
            />
          </div>

          {preferences.persistHistory && (
            <div className="space-y-2">
              <Label>Max History Size: {preferences.maxHistorySize}</Label>
              <Slider
                value={[preferences.maxHistorySize]}
                onValueChange={handleMaxHistorySizeChange}
                min={10}
                max={500}
                step={10}
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of notifications to keep
              </p>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => NotificationManager.clearOld(7)}
          >
            Clear Old Notifications (7+ days)
          </Button>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Choose which types of notifications to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(preferences.categories).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <Label htmlFor={`category-${category}`} className="capitalize">
                {category}
              </Label>
              <Switch
                id={`category-${category}`}
                checked={enabled}
                onCheckedChange={() => handleCategoryToggle(category as any)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Priorities */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Levels</CardTitle>
          <CardDescription>
            Choose which priority levels to show
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(preferences.priorities).map(([priority, enabled]) => (
            <div key={priority} className="flex items-center justify-between">
              <Label htmlFor={`priority-${priority}`} className="capitalize">
                {priority}
              </Label>
              <Switch
                id={`priority-${priority}`}
                checked={enabled}
                onCheckedChange={() => handlePriorityToggle(priority as any)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reset */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
