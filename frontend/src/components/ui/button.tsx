import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow hover:bg-brand-600 focus-visible:ring-brand-500/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-brand-400 bg-background shadow-sm hover:bg-brand-50 hover:text-brand-700 hover:border-brand-500 focus-visible:ring-brand-500/20",
        secondary:
          "bg-brand-50 text-brand-700 shadow-sm hover:bg-brand-100 focus-visible:ring-brand-500/20",
        ghost: "hover:bg-brand-50 hover:text-brand-700 focus-visible:ring-brand-500/20",
        link: "text-brand-600 underline-offset-4 hover:underline hover:text-brand-700",
        brand: "brand-gradient-button text-white shadow-lg hover:shadow-xl font-semibold",
        success: "bg-success-500 text-white shadow hover:bg-success-600 focus-visible:ring-success-500/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
