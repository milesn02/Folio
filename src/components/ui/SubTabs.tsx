import { cn } from '@/lib/utils'

interface SubTabsProps {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
  className?: string
}

export function SubTabs({ tabs, active, onChange, className }: SubTabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 bg-surface rounded-lg border border-border', className)}>
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'px-3 py-1 rounded-md text-[12px] font-semibold transition-all duration-150',
            active === t
              ? 'bg-white text-text shadow-sm border border-border'
              : 'text-text-lt hover:text-text',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
