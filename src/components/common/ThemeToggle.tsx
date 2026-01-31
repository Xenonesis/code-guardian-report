"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return (
        <Monitor className="h-5 w-5 text-slate-600 transition-all duration-300 dark:text-slate-400" />
      );
    }
    if (theme === "dark") {
      return (
        <Moon className="h-5 w-5 text-indigo-500 transition-all duration-300 hover:text-indigo-400" />
      );
    }
    return (
      <Sun className="h-5 w-5 text-yellow-500 transition-all duration-300 hover:text-yellow-400" />
    );
  };

  const getLabel = () => {
    if (theme === "system") return "System theme";
    if (theme === "dark") return "Dark theme";
    return "Light theme";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="h-9 w-9 rounded-full p-0 transition-all duration-300"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  );
}
