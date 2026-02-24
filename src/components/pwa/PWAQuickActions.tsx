import React from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import {
  Download,
  Wifi,
  WifiOff,
  Bell,
  Share2,
  RefreshCw,
  Zap,
  CheckCircle2,
  Cloud,
  CloudOff,
  Settings,
} from "lucide-react";
import { usePWA, usePWACapabilities } from "../../hooks/usePWA";
import { useNavigation } from "@/lib/navigation-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PWAQuickActionsProps {
  readonly className?: string;
  readonly showLabel?: boolean;
}

export function PWAQuickActions({
  className,
  showLabel = false,
}: PWAQuickActionsProps) {
  const {
    status,
    isInstalled,
    isOnline,
    isInstallable,
    hasNotificationPermission,
    promptInstall,
    enableNotifications,
    updateApp,
    shareContent,
  } = usePWA();

  const capabilities = usePWACapabilities();
  const { navigateTo } = useNavigation();
  const [open, setOpen] = React.useState(false);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast.success("App installed successfully!");
      setOpen(false);
    }
  };

  const handleNotifications = async () => {
    const enabled = await enableNotifications();
    if (enabled) {
      toast.success("Notifications enabled!");
    } else {
      toast.error("Could not enable notifications");
    }
  };

  const handleShare = async () => {
    const success = await shareContent({
      title: "Code Guardian Enterprise",
      text: "Check out this AI-powered security analysis platform!",
      url: globalThis.location.href,
    });

    if (success) {
      toast.success("Shared successfully!");
      setOpen(false);
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(globalThis.location.href);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to share");
      }
    }
  };

  const handleUpdate = async () => {
    await updateApp();
    toast.info("Checking for updates...");
  };

  // Status indicator color
  const getStatusColor = () => {
    if (!status.serviceWorkerReady) return "bg-muted";
    if (!isOnline) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative", className)}
          aria-label="Open PWA quick actions"
        >
          <div className="relative">
            <Zap className="h-4 w-4" />
            {/* Status indicator dot */}
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full",
                getStatusColor(),
                "ring-background ring-2"
              )}
            />
          </div>
          {showLabel && <span className="ml-2">PWA</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="border-border w-80 rounded-xl border p-3.5 opacity-100 shadow-[0_18px_44px_-26px_hsl(var(--foreground)/0.85)] backdrop-blur-none filter-none"
        align="end"
        style={{
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
          opacity: 1,
        }}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="border-border/60 flex items-center justify-between border-b pb-2.5">
            <h4 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <Zap className="text-primary h-4 w-4" />
              Quick Actions
            </h4>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                isOnline
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              )}
            >
              {isOnline ? (
                <Wifi className="mr-1 h-3 w-3" />
              ) : (
                <WifiOff className="mr-1 h-3 w-3" />
              )}
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Install */}
            {!isInstalled && isInstallable && (
              <ActionButton
                icon={Download}
                label="Install App"
                onClick={handleInstall}
                variant="primary"
              />
            )}

            {isInstalled && (
              <ActionButton
                icon={CheckCircle2}
                label="Installed"
                disabled
                variant="success"
              />
            )}

            {/* Notifications */}
            {!hasNotificationPermission && capabilities.notifications && (
              <ActionButton
                icon={Bell}
                label="Enable Alerts"
                onClick={handleNotifications}
              />
            )}

            {hasNotificationPermission && (
              <ActionButton
                icon={Bell}
                label="Alerts On"
                disabled
                variant="success"
              />
            )}

            {/* Share */}
            <ActionButton icon={Share2} label="Share" onClick={handleShare} />

            {/* Update */}
            <ActionButton
              icon={RefreshCw}
              label="Check Update"
              onClick={handleUpdate}
              disabled={!status.serviceWorkerReady}
            />
          </div>

          {/* Status Info */}
          <div className="border-border/60 border-t pt-2.5">
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                {status.serviceWorkerReady ? (
                  <>
                    <Cloud className="text-primary h-3 w-3" />
                    Service Worker Ready
                  </>
                ) : (
                  <>
                    <CloudOff className="text-muted-foreground h-3 w-3" />
                    Initializing...
                  </>
                )}
              </span>

              {status.backgroundSyncSupported && (
                <span className="flex items-center gap-1">
                  <RefreshCw className="text-primary h-3 w-3" />
                  Sync Available
                </span>
              )}
            </div>

            {/* Link to PWA Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="font-tech border-border/50 hover:bg-muted/60 mt-2 w-full rounded-md border text-xs tracking-[0.08em] uppercase"
              onClick={() => {
                navigateTo("pwa-settings");
                setOpen(false);
              }}
            >
              <Settings className="mr-1 h-3 w-3" />
              PWA Settings & Dashboard
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ActionButtonProps {
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly variant?: "default" | "primary" | "success";
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = "default",
}: ActionButtonProps) {
  const variantStyles = {
    default: "border-border/60 bg-muted/50 text-foreground hover:bg-muted/75 border",
    primary:
      "border-primary/25 bg-primary/12 text-primary hover:bg-primary/18 border",
    success:
      "border-green-300 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300 border",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "font-tech flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-lg p-3 text-[11px] tracking-[0.08em] uppercase transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant]
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

export default PWAQuickActions;
