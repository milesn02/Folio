import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-border/30 via-border/60 to-border/30 bg-[length:200%_100%] animate-shimmer",
        className,
      )}
      {...props}
    />
  )
}

// Dark variant for use on navy/dark backgrounds
function SkeletonDark({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-white/[0.06] via-white/[0.14] to-white/[0.06] bg-[length:200%_100%] animate-shimmer",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton, SkeletonDark }
