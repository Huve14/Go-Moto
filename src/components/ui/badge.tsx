import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Autovent gradient badge
        default:
          'border-transparent bg-gradient-to-r from-autovent-500 to-teal-500 text-white',
        // Outline with gradient text
        outline: 
          'border-autovent-500/30 bg-autovent-500/10 text-autovent-500',
        // Secondary muted (theme-aware)
        secondary:
          'border-border bg-muted text-muted-foreground',
        // Teal accent
        accent:
          'border-transparent bg-teal-500/20 text-teal-400',
        // Success
        success:
          'border-transparent bg-teal-500/20 text-teal-400',
        // Warning
        warning:
          'border-transparent bg-amber-500/20 text-amber-400',
        // Destructive
        destructive:
          'border-transparent bg-destructive/20 text-destructive',
        // Featured/highlight
        featured:
          'border-transparent bg-gradient-to-r from-autovent-500 to-teal-500 text-white animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
