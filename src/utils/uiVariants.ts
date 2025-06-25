import { type VariantProps, cva } from "class-variance-authority";

// Badge variants
export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// Button variants
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-white shadow-2xl hover:shadow-[0_20px_40px_-12px_rgba(59,130,246,0.4)] transform hover:scale-110 focus:scale-110 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500",
        destructive:
          "text-white shadow-2xl hover:shadow-[0_20px_40px_-12px_rgba(239,68,68,0.4)] transform hover:scale-110 bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 hover:from-red-500 hover:via-pink-500 hover:to-rose-500",
        outline:
          "border-2 border-white/30 dark:border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-xl hover:border-blue-300/50 dark:hover:border-blue-600/50 text-slate-700 dark:text-slate-300 shadow-xl hover:shadow-2xl transform hover:scale-110 hover:bg-white/20 dark:hover:bg-black/20",
        secondary:
          "bg-white/15 dark:bg-black/15 backdrop-blur-xl border border-white/20 dark:border-white/10 text-slate-900 dark:text-slate-100 hover:bg-white/25 dark:hover:bg-black/25 shadow-xl hover:shadow-2xl transform hover:scale-110",
        ghost: "hover:bg-white/10 dark:hover:bg-black/10 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transform hover:scale-110",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transform hover:scale-105",
        modern: "bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-white/30 dark:border-white/20 text-slate-900 dark:text-white shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:bg-white dark:hover:bg-slate-700 transform hover:scale-110",
        glass: "backdrop-blur-2xl bg-white/10 dark:bg-black/10 border border-white/30 dark:border-white/20 text-slate-900 dark:text-white shadow-2xl hover:bg-white/20 dark:hover:bg-black/20 hover:border-white/50 dark:hover:border-white/30 transform hover:scale-110",
        gradient: "text-white shadow-2xl hover:shadow-[0_20px_40px_-12px_rgba(147,51,234,0.4)] transform hover:scale-110 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:via-pink-500 hover:to-rose-500",
        success: "text-white shadow-2xl hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.4)] transform hover:scale-110 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500",
        warning: "text-white shadow-2xl hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.4)] transform hover:scale-110 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400",
        ultra: "text-white shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.5)] transform hover:scale-110 focus:scale-110 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 animate-gradient-flow"
      },
      size: {
        default: "h-12 px-8 py-3 text-sm",
        sm: "h-10 px-6 py-2 text-xs rounded-xl",
        lg: "h-14 px-10 py-4 text-base rounded-2xl",
        xl: "h-16 px-12 py-5 text-lg rounded-3xl",
        ultra: "h-18 px-14 py-6 text-xl rounded-3xl",
        icon: "h-12 w-12 rounded-2xl",
        "icon-sm": "h-10 w-10 rounded-xl",
        "icon-lg": "h-14 w-14 rounded-2xl",
        "icon-xl": "h-16 w-16 rounded-3xl"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Toggle variants
export const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type BadgeProps = VariantProps<typeof badgeVariants>;
export type ButtonProps = VariantProps<typeof buttonVariants>;
export type ToggleProps = VariantProps<typeof toggleVariants>;