import { type VariantProps, cva } from "class-variance-authority";

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
        default:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:bg-destructive/90",
        outline:
          "border-2 border-white/30 dark:border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-xl hover:border-primary/50 text-slate-700 dark:text-slate-300 shadow-md hover:shadow-lg hover:bg-white/20 dark:hover:bg-black/20",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:shadow-lg hover:bg-secondary/80",
        ghost: "hover:bg-muted text-muted-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        modern:
          "bg-card backdrop-blur-xl border border-border text-card-foreground shadow-md hover:shadow-lg hover:bg-card/90",
        glass:
          "backdrop-blur-2xl bg-card/50 border border-border text-card-foreground shadow-md hover:bg-card/60",
        gradient:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90",
        success:
          "bg-green-600 text-white shadow-md hover:shadow-lg hover:bg-green-700",
        warning:
          "bg-yellow-600 text-white shadow-md hover:shadow-lg hover:bg-yellow-700",
        ultra:
          "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90",
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
        "icon-xl": "h-16 w-16 rounded-3xl",
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
