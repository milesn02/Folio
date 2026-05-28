import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: boolean
  elevated?: boolean
  flush?: boolean
}

export function Card({ className, accent, elevated, flush, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white border border-border/70',
        elevated ? 'shadow-md' : 'shadow-sm',
        accent && 'border-l-[3px] border-l-accent',
        flush && 'overflow-hidden',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 py-3.5 border-b border-border/60',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-xs font-bold uppercase tracking-[.07em] text-text-lt',
        className,
      )}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />
}
