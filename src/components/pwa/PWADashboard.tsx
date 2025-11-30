import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
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
  CheckCircle2,
  XCircle,
  Zap,
  Cloud,
  CloudOff,
  Database,
  Clock,
  Activity,
  Settings2,
  TestTube,
  Send,
  Signal,
  Upload
} from 'lucide-react';
import { usePWA, usePWACapabilities, useNetworkStatus, usePWAAnalytics } from '../../hooks/usePWA';
import { clearAppCache, getInstallationInstructions } from '../../utils/pwaUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Helper to get installation status label
function getInstallationLabel(isInstalled: boolean, isInstallable: boolean): string {
  if (isInstalled) return 'Installed';
  if (isInstallable) return 'Available';
  return 'Browser Only';
}

// Helper to get installation status
function getInstallationStatus(isInstalled: boolean, isInstallable: boolean): 'success' | 'warning' | 'neutral' {
  if (isInstalled) return 'success';
  if (isInstallable) return 'warning';
  return 'neutral';
}

export function PWADashboard() {
  const {
    status,
    isInstalled,
    isOnline,
    isInstallable,
    hasNotificationPermission,
    isUpdateAvailable,
    metrics,
    refreshMetrics,
    promptInstall,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    updateApp
  } = usePWA();

  const capabilities = usePWACapabilities();
  const networkStatus = useNetworkStatus();
  const { refreshAnalytics } = usePWAAnalytics();
  
  const [isClearing, setIsClearing] = React.useState(false);
  const [isSendingTest, setIsSendingTest] = React.useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearAppCache();
      await refreshMetrics();
      toast.success('Cache cleared successfully');
    } catch {
      toast.error('Failed to clear cache');
    } finally {
      setIsClearing(false);
    }
  };

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast.success('App installed successfully!');
    } else {
      toast.info(getInstallationInstructions());
    }
  };

  const handleTestNotification = async () => {
    setIsSendingTest(true);
    try {
      await sendTestNotification();
      toast.success('Test notification sent!');
    } catch {
      toast.error('Failed to send test notification');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleNotificationToggle = async () => {
    if (hasNotificationPermission) {
      await disableNotifications();
      toast.info('Notifications disabled');
    } else {
      const enabled = await enableNotifications();
      if (enabled) {
        toast.success('Notifications enabled!');
      } else {
        toast.error('Could not enable notifications');
      }
    }
  };

  const getNetworkIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    // Use Signal for all connection types
    return <Signal className="h-4 w-4" />;
  };

  const getNetworkLabel = () => {
    if (!isOnline) return 'Offline';
    if (networkStatus.effectiveType === 'unknown') return 'Online';
    return `${networkStatus.effectiveType.toUpperCase()} - ${networkStatus.downlink} Mbps`;
  };

  // Derived values for status cards
  const installationLabel = getInstallationLabel(isInstalled, isInstallable);
  const installationStatus = getInstallationStatus(isInstalled, isInstallable);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">PWA Dashboard</CardTitle>
              <CardDescription>
                Manage your progressive web app experience
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isOnline ? "default" : "destructive"} 
              className={cn(
                "flex items-center gap-1.5 px-3 py-1",
                isOnline ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""
              )}
            >
              {getNetworkIcon()}
              {getNetworkLabel()}
            </Badge>
            
            {isInstalled && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <Smartphone className="h-3 w-3 mr-1" />
                Installed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-1.5">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Storage</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Status Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatusCard
                icon={isInstalled ? Smartphone : Monitor}
                label="Installation"
                value={installationLabel}
                status={installationStatus}
              />
              <StatusCard
                icon={isOnline ? Wifi : WifiOff}
                label="Connection"
                value={isOnline ? 'Online' : 'Offline'}
                status={isOnline ? 'success' : 'error'}
              />
              <StatusCard
                icon={status.serviceWorkerReady ? Cloud : CloudOff}
                label="Service Worker"
                value={status.serviceWorkerReady ? 'Active' : 'Inactive'}
                status={status.serviceWorkerReady ? 'success' : 'error'}
              />
              <StatusCard
                icon={hasNotificationPermission ? Bell : BellOff}
                label="Notifications"
                value={hasNotificationPermission ? 'Enabled' : 'Disabled'}
                status={hasNotificationPermission ? 'success' : 'neutral'}
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {!isInstalled && isInstallable && (
                  <ActionButton
                    icon={Download}
                    label="Install App"
                    onClick={handleInstall}
                    variant="primary"
                  />
                )}
                {!hasNotificationPermission && capabilities.notifications && (
                  <ActionButton
                    icon={Bell}
                    label="Enable Alerts"
                    onClick={handleNotificationToggle}
                  />
                )}
                <ActionButton
                  icon={Share2}
                  label="Share App"
                  onClick={() => {
                    navigator.share?.({
                      title: 'Code Guardian',
                      text: 'AI-powered security analysis platform',
                      url: globalThis.location.href
                    }).catch(() => {
                      navigator.clipboard.writeText(globalThis.location.href);
                      toast.success('Link copied!');
                    });
                  }}
                />
                {isUpdateAvailable && (
                  <ActionButton
                    icon={RefreshCw}
                    label="Update Now"
                    onClick={updateApp}
                    variant="warning"
                  />
                )}
                <ActionButton
                  icon={RefreshCw}
                  label="Refresh"
                  onClick={() => {
                    refreshMetrics();
                    refreshAnalytics();
                    toast.success('Data refreshed');
                  }}
                />
              </div>
            </div>

            {/* Capabilities Grid */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Device Capabilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <CapabilityBadge label="Service Worker" enabled={capabilities.install} />
                <CapabilityBadge label="Push Notifications" enabled={capabilities.notifications} />
                <CapabilityBadge label="Background Sync" enabled={capabilities.backgroundSync} />
                <CapabilityBadge label="Web Share" enabled={capabilities.share} />
                <CapabilityBadge label="Clipboard" enabled={capabilities.clipboard} />
                <CapabilityBadge label="IndexedDB" enabled={capabilities.indexedDB} />
                <CapabilityBadge label="Cache API" enabled={capabilities.cacheAPI} />
                <CapabilityBadge label="Web Workers" enabled={capabilities.webWorkers} />
              </div>
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-6">
            {/* Cache Stats */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cache Storage</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.cacheSizeFormatted} used
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={refreshMetrics}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearCache}
                    disabled={isClearing || metrics.cacheSize === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isClearing ? 'Clearing...' : 'Clear'}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cache Usage</span>
                  <span className="font-medium">{metrics.cacheSizeFormatted} / 100 MB</span>
                </div>
                <Progress 
                  value={Math.min((metrics.cacheSize / (100 * 1024 * 1024)) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Offline Data */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Offline Data</p>
                    <p className="text-sm text-muted-foreground">
                      {metrics.offlineDataCount} items stored locally
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Pending Syncs:</span>
                  <span className="font-medium">{metrics.pendingSyncs}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Sync:</span>
                  <span className="font-medium">
                    {metrics.lastSyncTime 
                      ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                          Math.round((metrics.lastSyncTime.getTime() - Date.now()) / 60000),
                          'minute'
                        )
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Network Info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isOnline ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                )}>
                  {isOnline ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Network Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? 'Connected to the internet' : 'Working offline'}
                  </p>
                </div>
              </div>
              
              {isOnline && networkStatus.effectiveType !== 'unknown' && (
                <>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{networkStatus.effectiveType.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Speed:</span>
                      <p className="font-medium">{networkStatus.downlink} Mbps</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Latency:</span>
                      <p className="font-medium">{networkStatus.rtt} ms</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {/* Notification Status */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    hasNotificationPermission 
                      ? "bg-green-100 dark:bg-green-900" 
                      : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    {hasNotificationPermission ? (
                      <Bell className="h-5 w-5 text-green-600" />
                    ) : (
                      <BellOff className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      {hasNotificationPermission 
                        ? 'You will receive security alerts and updates' 
                        : 'Enable to get notified about security issues'}
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

            {/* Test Notification */}
            {hasNotificationPermission && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <TestTube className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Test Notification</p>
                      <p className="text-sm text-muted-foreground">
                        Send a test notification to verify setup
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleTestNotification}
                    disabled={isSendingTest}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {isSendingTest ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>
              </div>
            )}

            {/* Notification Types */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Notification Types</h3>
              <div className="space-y-2">
                <NotificationTypeRow 
                  label="Security Alerts" 
                  description="Critical security vulnerabilities found"
                  enabled={hasNotificationPermission}
                />
                <NotificationTypeRow 
                  label="Analysis Complete" 
                  description="When code analysis finishes"
                  enabled={hasNotificationPermission}
                />
                <NotificationTypeRow 
                  label="App Updates" 
                  description="New version available"
                  enabled={hasNotificationPermission}
                />
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Installation */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    {isInstalled ? (
                      <Smartphone className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Monitor className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {isInstalled ? 'App Installed' : 'Install App'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isInstalled 
                        ? 'Running in standalone mode' 
                        : 'Add to home screen for the best experience'}
                    </p>
                  </div>
                </div>
                
                {!isInstalled && isInstallable && (
                  <Button onClick={handleInstall}>
                    <Download className="h-4 w-4 mr-1" />
                    Install
                  </Button>
                )}
                
                {isInstalled && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Installed
                  </Badge>
                )}
              </div>
            </div>

            {/* Update */}
            {status.serviceWorkerReady && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isUpdateAvailable 
                        ? "bg-orange-100 dark:bg-orange-900" 
                        : "bg-green-100 dark:bg-green-900"
                    )}>
                      <RefreshCw className={cn(
                        "h-5 w-5",
                        isUpdateAvailable ? "text-orange-600" : "text-green-600"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium">App Updates</p>
                      <p className="text-sm text-muted-foreground">
                        {isUpdateAvailable 
                          ? 'A new version is available' 
                          : 'You have the latest version'}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant={isUpdateAvailable ? "default" : "outline"} 
                    size="sm" 
                    onClick={updateApp}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {isUpdateAvailable ? 'Update Now' : 'Check'}
                  </Button>
                </div>
              </div>
            )}

            {/* Background Sync */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    status.backgroundSyncSupported 
                      ? "bg-green-100 dark:bg-green-900" 
                      : "bg-gray-100 dark:bg-gray-800"
                  )}>
                    <Cloud className={cn(
                      "h-5 w-5",
                      status.backgroundSyncSupported ? "text-green-600" : "text-gray-500"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium">Background Sync</p>
                    <p className="text-sm text-muted-foreground">
                      {status.backgroundSyncSupported 
                        ? 'Changes sync automatically when online' 
                        : 'Not supported in this browser'}
                    </p>
                  </div>
                </div>
                
                <Badge variant={status.backgroundSyncSupported ? "secondary" : "outline"}>
                  {status.backgroundSyncSupported ? 'Active' : 'Unavailable'}
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Helper Components
function StatusCard({ 
  icon: Icon, 
  label, 
  value, 
  status 
}: { 
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly value: string;
  readonly status: 'success' | 'warning' | 'error' | 'neutral';
}) {
  const statusColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    warning: 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    neutral: 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
  };

  const iconColors = {
    success: 'text-green-600',
    warning: 'text-orange-600',
    error: 'text-red-600',
    neutral: 'text-gray-500'
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      statusColors[status]
    )}>
      <Icon className={cn("h-5 w-5 mb-2", iconColors[status])} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function ActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = 'default' 
}: { 
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly onClick: () => void;
  readonly variant?: 'default' | 'primary' | 'warning';
}) {
  const variantStyles = {
    default: 'bg-muted hover:bg-muted/80',
    primary: 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    warning: 'bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-lg transition-colors",
        variantStyles[variant]
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function CapabilityBadge({ 
  label, 
  enabled 
}: { 
  readonly label: string; 
  readonly enabled: boolean;
}) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs",
      enabled 
        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
        : "bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400"
    )}>
      {enabled ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}
      <span>{label}</span>
    </div>
  );
}

function NotificationTypeRow({ 
  label, 
  description, 
  enabled 
}: { 
  readonly label: string;
  readonly description: string;
  readonly enabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={enabled} disabled />
    </div>
  );
}

export default PWADashboard;
