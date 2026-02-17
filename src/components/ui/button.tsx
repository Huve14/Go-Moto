import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Autovent gradient primary button
        default: 'bg-gradient-to-r from-autovent-500 to-teal-500 text-white hover:-translate-y-0.5 shadow-lg hover:shadow-autovent-500/30 active:scale-[0.98]',
        // Outline button with gradient hover
        outline:
          'border border-white/30 bg-transparent text-white hover:border-transparent hover:bg-gradient-to-r hover:from-autovent-500 hover:to-teal-500',
        // Secondary solid button (theme-aware)
        secondary:
          'bg-muted text-foreground hover:bg-muted/80 backdrop-blur-sm border border-border',
        // Ghost button (theme-aware)
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-accent',
        // Link style
        link: 'text-autovent-500 underline-offset-4 hover:underline font-medium',
        // Destructive
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        // Soft secondary for lights
        soft:
          'bg-primary/10 text-primary hover:bg-primary/20',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4',
        lg: 'h-12 rounded-xl px-8 text-base',
        xl: 'h-14 rounded-xl px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
