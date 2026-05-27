import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-0.5 leading-none',
  {
    variants: {
      variant: {
        default:  'bg-border text-text-md',
        success:  'bg-success-bg text-success border border-success-border',
        danger:   'bg-danger-bg text-danger border border-danger-border',
        info:     'bg-info-bg text-info border border-info-border',
        accent:   'bg-accent/15 text-accent',
        navy:     'bg-navy/10 text-navy',
        outline:  'border border-border text-text-md bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
