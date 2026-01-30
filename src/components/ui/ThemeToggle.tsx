import React, { useEffect, useMemo, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Theme toggle component - cycles through light, dark, and system modes
 *
 * Notes:
 * - `next-themes` resolves the actual theme on the client; rendering theme-dependent UI
 *   before mount can cause hydration mismatches. We gate rendering with `mounted`.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleToggle = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf((theme as any) || "system");
    const safeIndex =
      currentIndex >= 0 ? currentIndex : themes.indexOf("system");
    const nextIndex = (safeIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const effectiveTheme = mounted
    ? (resolvedTheme ?? theme ?? "system")
    : "system";

  const { Icon, color } = useMemo(() => {
    if (effectiveTheme === "light") {
      return { Icon: Sun, color: "text-amber-500" };
    }
    if (effectiveTheme === "dark") {
      return { Icon: Moon, color: "text-slate-400" };
    }
    return { Icon: Monitor, color: "text-blue-500" };
  }, [effectiveTheme]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "rounded-lg p-1.5 transition-all duration-200 hover:bg-slate-100 sm:p-2 dark:hover:bg-slate-800",
        className
      )}
      aria-label={`Current theme: ${mounted ? theme : "system"}. Click to change`}
      title={`Current: ${mounted ? theme : "system"} - Click to change`}
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
