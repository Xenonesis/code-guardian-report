import * as React from "react";
import { cn } from "@/lib/utils";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "modern"
    | "glass"
    | "gradient"
    | "elevated"
    | "interactive";
  hover?: boolean;
  glow?: "blue" | "purple" | "green" | "orange" | "none";
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      className,
      variant = "modern",
      hover = true,
      glow = "none",
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "rounded-lg border bg-card text-card-foreground shadow-sm",
      modern:
        "rounded-xl bg-background border border-border shadow-sm transition-all duration-200",
      glass:
        "rounded-xl backdrop-blur-md bg-background/60 border border-border/50 shadow-sm",
      gradient:
        "rounded-xl bg-gradient-to-br from-background to-muted/50 border border-border/50 shadow-sm",
      elevated:
        "rounded-xl bg-card border border-border/50 shadow-md transition-all duration-200",
      interactive:
        "rounded-xl bg-background border border-border shadow-sm transition-all duration-200 cursor-pointer hover:border-primary/50",
    };

    const hoverEffects = {
      default: hover ? "hover:shadow-md" : "",
      modern: hover
        ? "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20"
        : "",
      glass: hover
        ? "hover:bg-background/80 hover:shadow-md hover:-translate-y-0.5"
        : "",
      gradient: hover ? "hover:shadow-md hover:-translate-y-0.5" : "",
      elevated: hover ? "hover:shadow-lg hover:-translate-y-0.5" : "",
      interactive: hover
        ? "hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.005]"
        : "",
    };

    const glowEffects = {
      blue: "hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]",
      purple: "hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]",
      green: "hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]",
      orange: "hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]",
      none: "",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          hoverEffects[variant],
          glow !== "none" && glowEffects[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 sm:p-8", className)}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
  }
>(({ className, gradient = false, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  return (
    <h3
      ref={ref}
      className={cn(
        "leading-tight font-bold tracking-tight",
        sizes[size],
        gradient
          ? "bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-200"
          : "text-foreground",
        className
      )}
      {...props}
    />
  );
});
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-relaxed text-slate-600 dark:text-slate-400",
      className
    )}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 sm:p-8", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 sm:p-8", className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
};
