import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "avatar" | "chart" | "button";
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  animate?: boolean;
}

const variantStyles = {
  default: "bg-white/5 dark:bg-white/5",
  card: "bg-white/5 dark:bg-white/5",
  text: "bg-white/5 dark:bg-white/5",
  avatar: "bg-white/5 dark:bg-white/5",
  chart: "bg-white/5 dark:bg-white/5",
  button: "bg-white/5 dark:bg-white/5",
};

const roundedStyles = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "default",
  width,
  height,
  rounded,
  animate = true,
}) => {
  const baseClasses = cn(
    "relative overflow-hidden",
    variantStyles[variant],
    rounded && roundedStyles[rounded],
    animate && "skeleton-shimmer",
    className
  );

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return <div className={baseClasses} style={style} />;
};

export default Skeleton;
