import * as React from "react"
import { cn } from "@/lib/utils"

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'modern' | 'glass' | 'gradient' | 'elevated' | 'interactive'
  hover?: boolean
  glow?: 'blue' | 'purple' | 'green' | 'orange' | 'none'
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'modern', hover = true, glow = 'none', children, ...props }, ref) => {
    const variants = {
      default: "rounded-lg border bg-card text-card-foreground shadow-sm",
      modern: "rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl transition-all duration-300",
      glass: "rounded-2xl backdrop-blur-xl bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 shadow-2xl",
      gradient: "rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-0 shadow-xl",
      elevated: "rounded-2xl bg-card border-0 shadow-2xl transition-all duration-500",
      interactive: "rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl transition-all duration-500 cursor-pointer"
    }

    const hoverEffects = {
      default: hover ? "hover:shadow-xl hover:-translate-y-1" : "",
      modern: hover ? "hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]" : "",
      glass: hover ? "hover:bg-white/20 dark:hover:bg-black/20 hover:-translate-y-1" : "",
      gradient: hover ? "hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]" : "",
      elevated: hover ? "hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.03]" : "",
      interactive: hover ? "hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] active:scale-[1.01] active:-translate-y-1" : ""
    }

    const glowEffects = {
      blue: "hover:shadow-blue-500/25 hover:shadow-2xl",
      purple: "hover:shadow-purple-500/25 hover:shadow-2xl", 
      green: "hover:shadow-emerald-500/25 hover:shadow-2xl",
      orange: "hover:shadow-orange-500/25 hover:shadow-2xl",
      none: ""
    }

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          hoverEffects[variant],
          glow !== 'none' && glowEffects[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 sm:p-8", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, gradient = false, size = 'md', ...props }, ref) => {
  const sizes = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl", 
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl"
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "font-bold leading-tight tracking-tight",
        sizes[size],
        gradient 
          ? "bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent"
          : "text-slate-900 dark:text-white",
        className
      )}
      {...props}
    />
  )
})
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-600 dark:text-slate-400 leading-relaxed", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 sm:p-8 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 sm:p-8 pt-0", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardFooter, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent 
}