import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import {
  Download,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Share2,
  RefreshCw,
  Trash2,
  HardDrive,
  Smartphone,
  Monitor,
  Settings,
  CheckCircle2,
  XCircle,
  Zap,
  Cloud,
} from "lucide-react";
import { usePWA, usePWACapabilities } from "../../hooks/usePWA";
import {
  formatBytes,
  getCacheSize,
  clearAppCache,
  getInstallationInstructions,
} from "../../utils/pwaUtils";
import { toast } from "sonner";

export function PWAManager() {
  const {
    status,
    isInstalled,
    isOnline,
    isInstallable,
    hasNotificationPermission,
    promptInstall,
    enableNotifications,
    disableNotifications,
    updateApp,
  } = usePWA();

  const capabilities = usePWACapabilities();
  const [cacheSize, setCacheSize] = React.useState<number>(0);
  const [isClearing, setIsClearing] = React.useState(false);

  React.useEffect(() => {
    getCacheSize().then(setCacheSize);
  }, []);

  const refreshCacheSize = async () => {
    const size = await getCacheSize();
    setCacheSize(size);
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAppCache();
      await refreshCacheSize();
      toast.success("Cache cleared successfully");
    } catch (error) {
      toast.error("Failed to clear cache");
    } finally {
      setIsClearing(false);
    }
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast.success("App installed successfully!");
    } else {
      toast.info(getInstallationInstructions());
    }
  };

  const handleNotificationToggle = async () => {
    if (hasNotificationPermission) {
      await disableNotifications();
      toast.info("Notifications disabled");
    } else {
      const enabled = await enableNotifications();
      if (enabled) {
        toast.success("Notifications enabled!");
      } else {
        toast.error("Could not enable notifications");
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">PWA Settings</CardTitle>
          </div>
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="flex items-center gap-1"
          >
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
        <CardDescription>
          Manage your app experience and offline capabilities
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Installation Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Download className="h-4 w-4" />
            App Installation
          </h3>

          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                {isInstalled ? (
                  <Smartphone className="h-5 w-5 text-blue-600" />
                ) : (
                  <Monitor className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isInstalled ? "App Installed" : "Install as App"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {isInstalled
                    ? "Running in standalone mode"
                    : "Get faster access and work offline"}
                </p>
              </div>
            </div>

            {!isInstalled && isInstallable && (
              <Button size="sm" onClick={handleInstall}>
                <Download className="mr-1 h-4 w-4" />
                Install
              </Button>
            )}

            {isInstalled && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Installed
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Notifications Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>

          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div
                className={`rounded-lg p-2 ${hasNotificationPermission ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                {hasNotificationPermission ? (
                  <Bell className="h-5 w-5 text-green-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-muted-foreground text-xs">
                  {hasNotificationPermission
                    ? "You will receive security alerts"
                    : "Enable to get security updates"}
                </p>
              </div>
            </div>

            <Switch
              checked={hasNotificationPermission}
              onCheckedChange={handleNotificationToggle}
              disabled={!capabilities.notifications}
            />
          </div>
        </div>

        <Separator />

        {/* Storage Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <HardDrive className="h-4 w-4" />
            Storage & Cache
          </h3>

          <div className="bg-muted/50 space-y-3 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Cached Data</p>
                <p className="text-muted-foreground text-xs">
                  {formatBytes(cacheSize)} stored for offline use
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshCacheSize}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  disabled={isClearing || cacheSize === 0}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  {isClearing ? "Clearing..." : "Clear"}
                </Button>
              </div>
            </div>

            {/* Progress bar for cache usage */}
            <div className="space-y-1">
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Cache Usage</span>
                <span>{formatBytes(cacheSize)} / 100 MB</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{
                    width: `${Math.min((cacheSize / (100 * 1024 * 1024)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Capabilities Section */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4" />
            Capabilities
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <CapabilityItem
              icon={Cloud}
              label="Service Worker"
              enabled={capabilities.install}
            />
            <CapabilityItem
              icon={Bell}
              label="Push Notifications"
              enabled={capabilities.notifications}
            />
            <CapabilityItem
              icon={RefreshCw}
              label="Background Sync"
              enabled={capabilities.backgroundSync}
            />
            <CapabilityItem
              icon={Share2}
              label="Native Sharing"
              enabled={capabilities.share}
            />
          </div>
        </div>

        {/* Update Section */}
        {status.serviceWorkerReady && (
          <>
            <Separator />
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Check for Updates</p>
                  <p className="text-muted-foreground text-xs">
                    Ensure you have the latest version
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={updateApp}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Update
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CapabilityItem({
  icon: Icon,
  label,
  enabled,
}: {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly enabled: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg p-2 ${
        enabled
          ? "bg-green-50 dark:bg-green-900/20"
          : "bg-gray-50 dark:bg-gray-800/50"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${enabled ? "text-green-600" : "text-gray-400"}`}
      />
      <span className="text-xs font-medium">{label}</span>
      {enabled ? (
        <CheckCircle2 className="ml-auto h-3 w-3 text-green-500" />
      ) : (
        <XCircle className="ml-auto h-3 w-3 text-gray-400" />
      )}
    </div>
  );
}

export default PWAManager;
