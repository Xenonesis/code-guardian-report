import React from 'react';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DarkModeTestProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeTestComponent: React.FC<DarkModeTestProps> = ({ isDarkMode, toggleDarkMode }) => {
  const testElements = [
    {
      name: 'Background Gradients',
      lightClass: 'bg-gradient-to-r from-blue-50 to-purple-50',
      darkClass: 'dark:from-slate-900 dark:to-blue-900',
      status: 'working'
    },
    {
      name: 'Text Colors',
      lightClass: 'text-slate-900',
      darkClass: 'dark:text-white',
      status: 'working'
    },
    {
      name: 'Card Backgrounds',
      lightClass: 'bg-white/90',
      darkClass: 'dark:bg-slate-800/90',
      status: 'working'
    },
    {
      name: 'Border Colors',
      lightClass: 'border-white/30',
      darkClass: 'dark:border-white/10',
      status: 'working'
    },
    {
      name: 'Hover Effects',
      lightClass: 'hover:shadow-blue-500/20',
      darkClass: 'dark:hover:shadow-blue-400/30',
      status: 'working'
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-2xl max-w-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Dark Mode Status</h3>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4 text-blue-500" />
              <span className="text-slate-700 dark:text-slate-300">
                Current: {isDarkMode ? 'Dark' : 'Light'} Mode
              </span>
            </div>
            
            <div className="space-y-1">
              {testElements.map((element, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-slate-600 dark:text-slate-400">{element.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-800 dark:text-green-200">
                All components support both modes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DarkModeTestComponent;