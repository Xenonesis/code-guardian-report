import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Zap,
  Clock,
  Database,
  Wifi,
  Monitor,
  Cpu,
  HardDrive,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: MemoryInfo;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  networkRequests: number;
  cacheHitRate: number;
  errorRate: number;
  userInteractions: number;
}

interface PerformanceMonitorProps {
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    networkRequests: 0,
    cacheHitRate: 0,
    errorRate: 0,
    userInteractions: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Performance measurement functions
  const measurePerformance = useCallback(() => {
    // Web Vitals and Performance API measurements
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
    const renderTime = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    // Memory usage (if available)
    const memoryInfo = (performance as PerformanceWithMemory).memory;
    const memoryUsage = memoryInfo ? 
      Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100) : 0;

    // Network requests
    const resources = performance.getEntriesByType('resource');
    const networkRequests = resources.length;

    // Simulated metrics (in real app, these would come from actual monitoring)
    const bundleSize = Math.round(Math.random() * 500 + 200); // KB
    const cacheHitRate = Math.round(Math.random() * 30 + 70); // %
    const errorRate = Math.round(Math.random() * 5); // %
    const userInteractions = Math.round(Math.random() * 50 + 10);

    setMetrics({
      loadTime: Math.round(loadTime),
      renderTime: Math.round(renderTime),
      memoryUsage,
      bundleSize,
      networkRequests,
      cacheHitRate,
      errorRate,
      userInteractions
    });

    setLastUpdate(new Date());
  }, []);

  // Core Web Vitals calculation
  const getWebVitalsScore = useCallback(() => {
    const lcp = metrics.loadTime; // Largest Contentful Paint
    const fid = metrics.renderTime; // First Input Delay (approximated)
    const cls = Math.random() * 0.1; // Cumulative Layout Shift (simulated)

    const lcpScore = lcp < 2500 ? 100 : lcp < 4000 ? 75 : 50;
    const fidScore = fid < 100 ? 100 : fid < 300 ? 75 : 50;
    const clsScore = cls < 0.1 ? 100 : cls < 0.25 ? 75 : 50;

    return Math.round((lcpScore + fidScore + clsScore) / 3);
  }, [metrics]);

  // Performance grade calculation
  const getPerformanceGrade = useCallback(() => {
    const score = getWebVitalsScore();
    if (score >= 90) return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900' };
    return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' };
  }, [getWebVitalsScore]);

  // Auto-refresh performance metrics
  useEffect(() => {
    measurePerformance();
    
    if (isMonitoring) {
      const interval = setInterval(measurePerformance, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, measurePerformance]);

  const performanceGrade = getPerformanceGrade();
  const webVitalsScore = getWebVitalsScore();

  const performanceCards = [
    {
      title: 'Load Time',
      value: `${metrics.loadTime}ms`,
      icon: <Clock className="h-5 w-5" />,
      status: metrics.loadTime < 2000 ? 'good' : metrics.loadTime < 4000 ? 'needs-improvement' : 'poor',
      description: 'Time to fully load the page'
    },
    {
      title: 'Render Time',
      value: `${metrics.renderTime}ms`,
      icon: <Monitor className="h-5 w-5" />,
      status: metrics.renderTime < 100 ? 'good' : metrics.renderTime < 300 ? 'needs-improvement' : 'poor',
      description: 'First contentful paint time'
    },
    {
      title: 'Memory Usage',
      value: `${metrics.memoryUsage}%`,
      icon: <Cpu className="h-5 w-5" />,
      status: metrics.memoryUsage < 70 ? 'good' : metrics.memoryUsage < 85 ? 'needs-improvement' : 'poor',
      description: 'JavaScript heap memory usage'
    },
    {
      title: 'Bundle Size',
      value: `${metrics.bundleSize}KB`,
      icon: <HardDrive className="h-5 w-5" />,
      status: metrics.bundleSize < 300 ? 'good' : metrics.bundleSize < 500 ? 'needs-improvement' : 'poor',
      description: 'Total JavaScript bundle size'
    },
    {
      title: 'Network Requests',
      value: metrics.networkRequests.toString(),
      icon: <Wifi className="h-5 w-5" />,
      status: metrics.networkRequests < 20 ? 'good' : metrics.networkRequests < 50 ? 'needs-improvement' : 'poor',
      description: 'Total HTTP requests made'
    },
    {
      title: 'Cache Hit Rate',
      value: `${metrics.cacheHitRate}%`,
      icon: <Database className="h-5 w-5" />,
      status: metrics.cacheHitRate > 80 ? 'good' : metrics.cacheHitRate > 60 ? 'needs-improvement' : 'poor',
      description: 'Percentage of cached responses'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'needs-improvement': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800';
      case 'needs-improvement': return 'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800';
      case 'poor': return 'from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-red-200 dark:border-red-800';
      default: return 'from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Performance Monitor
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Real-time application performance metrics and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={isMonitoring ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isMonitoring ? 'animate-spin' : ''}`} />
            {isMonitoring ? 'Monitoring' : 'Start Monitor'}
          </Button>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card className={`bg-gradient-to-br ${performanceGrade.bg} border-0 shadow-xl`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Overall Performance Score
              </h3>
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${performanceGrade.color}`}>
                  {performanceGrade.grade}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${performanceGrade.color}`}>
                    {webVitalsScore}/100
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Web Vitals Score</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Zap className={`h-12 w-12 ${performanceGrade.color}`} />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Based on Core Web Vitals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-6">
          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {performanceCards.map((card, index) => (
              <Card 
                key={index} 
                className={`bg-gradient-to-br ${getStatusBg(card.status)} card-hover animate-fade-in animate-stagger-${Math.min(index + 1, 5)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={getStatusColor(card.status)}>
                      {card.icon}
                    </div>
                    <Badge 
                      variant={card.status === 'good' ? 'default' : card.status === 'needs-improvement' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {card.status === 'good' ? 'Good' : card.status === 'needs-improvement' ? 'Needs Work' : 'Poor'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {card.title}
                  </h3>
                  <p className={`text-2xl font-bold ${getStatusColor(card.status)} mb-2`}>
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription>
                  Google's Core Web Vitals metrics for user experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Largest Contentful Paint (LCP)</span>
                    <span className="text-sm text-slate-600">{metrics.loadTime}ms</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (2500 / Math.max(metrics.loadTime, 1)) * 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Target: &lt; 2.5s</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">First Input Delay (FID)</span>
                    <span className="text-sm text-slate-600">{metrics.renderTime}ms</span>
                  </div>
                  <Progress 
                    value={Math.min(100, (100 / Math.max(metrics.renderTime, 1)) * 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-slate-500 mt-1">Target: &lt; 100ms</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Cumulative Layout Shift (CLS)</span>
                    <span className="text-sm text-slate-600">0.05</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <p className="text-xs text-slate-500 mt-1">Target: &lt; 0.1</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>
                  Recommendations to improve your application performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.loadTime > 2000 && (
                    <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Slow Load Time
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          Consider code splitting and lazy loading to improve initial load time.
                        </p>
                      </div>
                    </div>
                  )}

                  {metrics.memoryUsage > 70 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          High Memory Usage
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Memory usage is high. Check for memory leaks and optimize component re-renders.
                        </p>
                      </div>
                    </div>
                  )}

                  {metrics.cacheHitRate < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Low Cache Hit Rate
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Improve caching strategy to reduce network requests and improve performance.
                        </p>
                      </div>
                    </div>
                  )}

                  {webVitalsScore > 85 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Excellent Performance
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Your application is performing well across all key metrics!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>
                Actionable steps to improve your application's performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Code Splitting</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Implement dynamic imports and route-based code splitting to reduce initial bundle size.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-100">Image Optimization</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use modern image formats (WebP, AVIF) and implement lazy loading for images.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">Caching Strategy</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Implement service workers and optimize cache headers for better resource caching.
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100">Bundle Analysis</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Regularly analyze your bundle to identify and remove unused dependencies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitor;
