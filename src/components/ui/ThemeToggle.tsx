import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Theme } from "@/hooks/useDarkMode";

interface ThemeToggleProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  className?: string;
}

/**
 * Theme toggle component - cycles through light, dark, and system modes
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onThemeChange,
  className,
}) => {
  const handleToggle = () => {
    const themes: Theme[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const color =
    theme === "light"
      ? "text-amber-500"
      : theme === "dark"
        ? "text-slate-400"
        : "text-blue-500";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "rounded-lg p-1.5 transition-all duration-200 hover:bg-slate-100 sm:p-2 dark:hover:bg-slate-800",
        className
      )}
      aria-label={`Current theme: ${theme}. Click to change`}
      title={`Current: ${theme} - Click to change`}
    >
      <Icon
        className={cn(
          "h-4 w-4 transition-colors duration-200 sm:h-5 sm:w-5",
          color
        )}
      />
    </Button>
  );
};

export default ThemeToggle;
