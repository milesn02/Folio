import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:   'bg-navy text-white hover:bg-navy-md',
        primary:   'bg-accent text-navy hover:bg-accent-lt',
        ghost:     'bg-transparent text-text-md hover:bg-border/60',
        outline:   'border border-border bg-white text-text hover:bg-surface',
        destructive: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20',
        link:      'text-accent underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-7 px-3 text-xs',
        md:   'h-8 px-4 text-sm',
        lg:   'h-9 px-5 text-sm',
        icon: 'h-8 w-8 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
