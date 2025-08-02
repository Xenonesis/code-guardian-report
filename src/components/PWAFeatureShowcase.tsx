import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Download, 
  Wifi, 
  Bell, 
  Share2, 
  Smartphone, 
  Monitor,
  Zap,
  Shield,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { PWAShareButton } from './PWAShareButton';
import { formatBytes, getCacheSize } from '../utils/pwaUtils';

export function PWAFeatureShowcase() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isUpdateAvailable,
    installApp,
    requestNotificationPermission 
  } = usePWA();
  
  const [cacheSize, setCacheSize] = React.useState<number>(0);

  React.useEffect(() => {
    getCacheSize().then(setCacheSize);
  }, []);

  const features = [
    {
      icon: Download,
      title: 'App Installation',
      description: 'Install as a native app on any device',
      status: isInstalled ? 'Installed' : isInstallable ? 'Available' : 'Not Available',
      color: isInstalled ? 'green' : isInstallable ? 'blue' : 'gray'
    },
    {
      icon: Wifi,
      title: 'Offline Support',
      description: 'Works without internet connection',
      status: isOnline ? 'Online' : 'Offline',
      color: isOnline ? 'green' : 'orange'
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Get notified about security updates',
      status: Notification.permission === 'granted' ? 'Enabled' : 'Available',
      color: Notification.permission === 'granted' ? 'green' : 'blue'
    },
    {
      icon: Share2,
      title: 'Native Sharing',
      description: 'Share analysis results easily',
      status: 'navigator' in window && 'share' in navigator ? 'Supported' : 'Fallback',
      color: 'navigator' in window && 'share' in navigator ? 'green' : 'blue'
    },
    {
      icon: RefreshCw,
      title: 'Auto Updates',
      description: 'Seamless background updates',
      status: isUpdateAvailable ? 'Update Available' : 'Up to Date',
      color: isUpdateAvailable ? 'orange' : 'green'
    },
    {
      icon: HardDrive,
      title: 'Smart Caching',
      description: `${formatBytes(cacheSize)} cached for faster loading`,
      status: 'Active',
      color: 'green'
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600" />
          <CardTitle>Progressive Web App Features</CardTitle>
        </div>
        <CardDescription>
          Enhanced user experience with modern web technologies
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <feature.icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
              <Badge 
                variant={feature.color === 'green' ? 'default' : 'secondary'}
                className={`
                  ${feature.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                  ${feature.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
                  ${feature.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                  ${feature.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
                `}
              >
                {feature.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {isInstallable && !isInstalled && (
            <Button onClick={installApp} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Install App
            </Button>
          )}
          
          {Notification.permission !== 'granted' && (
            <Button 
              variant="outline" 
              onClick={requestNotificationPermission}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Enable Notifications
            </Button>
          )}
          
          <PWAShareButton 
            title="Code Guardian Enterprise"
            text="Check out this amazing AI-powered security analysis platform!"
            variant="outline"
          />
        </div>

        {/* Device Support */}
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Device Support
          </h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span>Mobile Devices</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-4 w-4 text-green-600" />
              <span>Desktop Browsers</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}