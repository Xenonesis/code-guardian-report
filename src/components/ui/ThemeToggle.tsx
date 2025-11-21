import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Theme } from '@/hooks/useDarkMode';

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  variant?: 'icon' | 'dropdown';
  className?: string;
}

/**
 * Theme toggle component with support for light, dark, and system modes
 * Can be displayed as a simple icon toggle or a dropdown menu
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  theme, 
  onThemeChange, 
  variant = 'icon',
  className 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: 'Light' },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: 'Dark' },
    { value: 'system', icon: <Monitor className="h-4 w-4" />, label: 'System' },
  ];

  const currentThemeOption = themeOptions.find(opt => opt.value === theme) || themeOptions[2];

  const handleThemeSelect = (newTheme: Theme) => {
    onThemeChange(newTheme);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-theme-toggle]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'icon') {
    // Simple icon toggle - cycles through themes
    const handleClick = () => {
      const currentIndex = themeOptions.findIndex(opt => opt.value === theme);
      const nextIndex = (currentIndex + 1) % themeOptions.length;
      onThemeChange(themeOptions[nextIndex].value);
    };

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          "p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200",
          className
        )}
        aria-label={`Switch theme (current: ${theme})`}
        title={`Current: ${currentThemeOption.label} - Click to change`}
      >
        <div className="relative">
          {React.cloneElement(currentThemeOption.icon as React.ReactElement, {
            className: cn(
              "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200",
              theme === 'light' && "text-amber-500",
              theme === 'dark' && "text-slate-400",
              theme === 'system' && "text-blue-500"
            ),
          })}
        </div>
      </Button>
    );
  }

  // Dropdown variant
  return (
    <div className="relative" data-theme-toggle>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200",
          isOpen && "bg-slate-100 dark:bg-slate-800",
          className
        )}
        aria-label="Toggle theme menu"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {React.cloneElement(currentThemeOption.icon as React.ReactElement, {
            className: cn(
              "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200",
              theme === 'light' && "text-amber-500",
              theme === 'dark' && "text-slate-400",
              theme === 'system' && "text-blue-500"
            ),
          })}
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeSelect(option.value)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150",
                theme === option.value
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <div className={cn(
                "flex-shrink-0",
                theme === option.value && "scale-110"
              )}>
                {React.cloneElement(option.icon as React.ReactElement, {
                  className: cn(
                    "h-4 w-4 transition-all duration-200",
                    option.value === 'light' && theme === option.value && "text-amber-500",
                    option.value === 'dark' && theme === option.value && "text-slate-400",
                    option.value === 'system' && theme === option.value && "text-blue-500"
                  ),
                })}
              </div>
              <span>{option.label}</span>
              {theme === option.value && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
