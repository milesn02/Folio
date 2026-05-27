import { cn, initials, avatarColor } from '@/lib/utils'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const sizeMap = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-10 h-10 text-[13px]',
}

export function Avatar({ name, size = 'md', color, className }: AvatarProps) {
  const bg = color ?? avatarColor(name)
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg font-bold text-white flex-shrink-0 select-none font-sans',
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: bg }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}
