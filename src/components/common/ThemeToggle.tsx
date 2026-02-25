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
        <Monitor className="text-muted-foreground h-4 w-4 transition-all duration-300" />
      );
    }
    if (theme === "dark") {
      return (
        <Moon className="h-4 w-4 text-cyan-500 transition-all duration-300 hover:text-cyan-400" />
      );
    }
    return (
      <Sun className="h-4 w-4 text-yellow-500 transition-all duration-300 hover:text-yellow-400" />
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
      className="hover:bg-muted/60 h-8 w-8 rounded-lg p-0 transition-all duration-300"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  );
}
