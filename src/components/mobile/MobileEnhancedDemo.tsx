import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Smartphone, 
  Tablet, 
  Monitor,
  Star,
  Heart,
  Zap
} from 'lucide-react';

/**
 * Mobile Enhanced Demo Component
 * Showcases the beautiful and responsive mobile UI enhancements
 */
export const MobileEnhancedDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'cards' | 'buttons' | 'forms' | 'animations'>('cards');

  const demoCards = [
    {
      title: 'Security Score',
      value: '95',
      icon: Shield,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Issues Found',
      value: '3',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800'
    },
    {
      title: 'Fixed',
      value: '12',
      icon: CheckCircle,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    }
  ];

  const deviceSizes = [
    { name: 'Mobile', icon: Smartphone, width: 'max-w-sm' },
    { name: 'Tablet', icon: Tablet, width: 'max-w-md' },
    { name: 'Desktop', icon: Monitor, width: 'max-w-4xl' }
  ];

  return (
    <div className="layout-mobile space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="heading-mobile-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Mobile UI Showcase
        </h1>
        <p className="text-mobile-body text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Experience our beautiful and responsive mobile-first design system with enhanced touch interactions and performance optimizations.
        </p>
      </div>

      {/* Device Size Indicators */}
      <div className="flex justify-center gap-2 sm:gap-4">
        {deviceSizes.map((device) => (
          <div key={device.name} className="flex items-center gap-1 sm:gap-2 badge-mobile-lg bg-slate-100 dark:bg-slate-800">
            <device.icon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">{device.name}</span>
          </div>
        ))}
      </div>

      {/* Demo Navigation */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {[
          { key: 'cards', label: 'Cards', icon: Star },
          { key: 'buttons', label: 'Buttons', icon: Heart },
          { key: 'forms', label: 'Forms', icon: Zap },
          { key: 'animations', label: 'Animations', icon: Shield }
        ].map((item) => (
          <Button
            key={item.key}
            variant={activeDemo === item.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveDemo(item.key as any)}
            className="btn-mobile-compact touch-feedback"
          >
            <item.icon className="h-3 w-3 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">{item.label}</span>
            <span className="xs:hidden">{item.label.slice(0, 3)}</span>
          </Button>
        ))}
      </div>

      {/* Demo Content */}
      <div className="animate-mobile-fade-in">
        {activeDemo === 'cards' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="heading-mobile-md text-center">Responsive Cards</h2>
            
            {/* Summary Cards */}
            <div className="grid-mobile-cards">
              {demoCards.map((card, index) => (
                <Card 
                  key={card.title}
                  className={`bg-gradient-to-br ${card.bgColor} ${card.borderColor} card-mobile-interactive animate-mobile-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 bg-gradient-to-r ${card.color} rounded-lg flex-shrink-0`}>
                        <card.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg sm:text-2xl font-bold text-slate-800 dark:text-slate-200 truncate">
                          {card.value}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                          {card.title}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Card */}
            <Card className="card-mobile-feature animate-mobile-scale-in">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="heading-mobile-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Mobile-First Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <p className="text-mobile-body">
                  Our mobile-first approach ensures optimal performance and user experience across all device sizes.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="badge-mobile bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Touch Optimized
                  </Badge>
                  <Badge className="badge-mobile bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Performance First
                  </Badge>
                  <Badge className="badge-mobile bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Responsive
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeDemo === 'buttons' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="heading-mobile-md text-center">Mobile Buttons</h2>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="heading-mobile-sm">Touch-Optimized Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <Button className="btn-mobile touch-feedback">Primary</Button>
                  <Button variant="outline" className="btn-mobile touch-feedback">Outline</Button>
                  <Button variant="ghost" className="btn-mobile touch-feedback">Ghost</Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="heading-mobile-sm">Size Variants</h3>
                <div className="mobile-button-stack">
                  <Button className="btn-mobile-compact">Compact Button</Button>
                  <Button className="btn-mobile">Regular Button</Button>
                  <Button className="btn-mobile-large">Large Button</Button>
                  <Button className="btn-mobile-full">Full Width Button</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'forms' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="heading-mobile-md text-center">Mobile Forms</h2>
            
            <Card className="card-mobile">
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Input</label>
                  <input 
                    type="text" 
                    placeholder="Touch-friendly input"
                    className="input-mobile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Compact Input</label>
                  <input 
                    type="text" 
                    placeholder="Compact input"
                    className="input-mobile-compact"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Textarea</label>
                  <textarea 
                    placeholder="Touch-optimized textarea"
                    className="textarea-mobile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Select</label>
                  <select className="select-mobile">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeDemo === 'animations' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="heading-mobile-md text-center">Mobile Animations</h2>
            
            <div className="grid-mobile-cards">
              <Card className="card-mobile-interactive animate-mobile-bounce">
                <CardContent className="p-4 text-center">
                  <div className="animate-mobile-pulse">
                    <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  </div>
                  <p className="text-sm font-medium">Bounce Animation</p>
                </CardContent>
              </Card>

              <Card className="card-mobile-interactive animate-mobile-fade-in">
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-red-500 animate-mobile-pulse" />
                  <p className="text-sm font-medium">Fade In</p>
                </CardContent>
              </Card>

              <Card className="card-mobile-interactive animate-mobile-scale-in">
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium">Scale In</p>
                </CardContent>
              </Card>
            </div>

            <Card className="card-mobile mobile-gpu-accelerated">
              <CardContent className="p-4">
                <h3 className="heading-mobile-sm mb-3">Performance Features</h3>
                <div className="space-y-2 text-mobile-body">
                  <div className="mobile-icon-text">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>GPU Acceleration</span>
                  </div>
                  <div className="mobile-icon-text">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Touch Optimized</span>
                  </div>
                  <div className="mobile-icon-text">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Smooth Scrolling</span>
                  </div>
                  <div className="mobile-icon-text">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Reduced Motion Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="text-mobile-caption">
          Mobile UI enhanced with responsive design, touch interactions, and performance optimizations
        </p>
      </div>
    </div>
  );
};
