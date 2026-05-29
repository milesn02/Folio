import { useState, useRef, useEffect } from 'react'
import { FileDown, StickyNote, MoreHorizontal, Trash2, BookOpen } from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { TABS, TAB_LABELS, type TabId } from '@/lib/constants'
import { useClientStore, selectActiveClient } from '@/store/clientStore'
import { useUiStore } from '@/store/uiStore'
import type { PresenceUser } from '@/hooks/usePresence'

interface TopBarProps {
  onDelete: () => void
  onDownloadSummary: () => void
  onDownloadReport: () => void
  savedAt: Date | null
  clientName: string
  presence?: PresenceUser[]
}

function savedLabel(savedAt: Date | null): string {
  if (!savedAt) return ''
  const mins = Math.floor((Date.now() - savedAt.getTime()) / 60000)
  if (mins < 1) return 'Saved just now'
  if (mins < 60) return `Saved ${mins}m ago`
  return `Saved ${Math.floor(mins / 60)}h ago`
}

export function TopBar({ onDelete, onDownloadSummary, onDownloadReport, savedAt, clientName, presence = [] }: TopBarProps) {
  const { activeTab, setActiveTab } = useClientStore()
  const { openNotes } = useUiStore()
  const activeClient = useClientStore(selectActiveClient)
  const strat = activeClient?.data?.strat
  const [menuOpen, setMenuOpen] = useState(false)
  const [, forceUpdate] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function isHidden(tab: string) {
    if (tab === 'augusta') return !strat?.augusta?.y
    if (tab === 'roth')    return !strat?.backdoor?.y
    if (tab === 'hsa')     return !strat?.health?.y
    return false
  }

  return (
    <div className="flex items-stretch h-[52px] border-b border-border/60 bg-white flex-shrink-0 overflow-hidden">

      {/* Client name + saved */}
      <div className="flex items-center gap-3 px-5 flex-shrink-0 border-r border-border/40 min-w-0 max-w-[280px]">
        <h1 className="text-[15px] font-semibold text-text tracking-tight truncate leading-none">
          {clientName}
        </h1>
        {savedAt && (
          <span className="text-[10px] font-medium text-text-xs whitespace-nowrap flex-shrink-0 bg-surface px-1.5 py-0.5 rounded">
            {savedLabel(savedAt)}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-1 overflow-x-auto scrollbar-none">
        {TABS.map(tab => {
          const hidden = isHidden(tab)
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => !hidden && setActiveTab(tab)}
              style={{
                maxWidth: hidden ? 0 : 200,
                paddingLeft: hidden ? 0 : undefined,
                paddingRight: hidden ? 0 : undefined,
                opacity: hidden ? 0 : 1,
                overflow: 'hidden',
                pointerEvents: hidden ? 'none' : 'auto',
                transition: 'max-width 0.2s cubic-bezier(0.16,1,0.3,1), opacity 0.15s ease, padding 0.2s ease',
              }}
              className={cn(
                'relative flex-shrink-0 px-4 h-full flex items-center text-[13px] whitespace-nowrap cursor-pointer',
                'transition-colors duration-150',
                active
                  ? 'font-semibold text-navy'
                  : 'font-medium text-text-lt hover:text-text-md',
              )}
            >
              {TAB_LABELS[tab as TabId]}
              <span className={cn(
                'absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full transition-all duration-200',
                active ? 'bg-accent opacity-100' : 'opacity-0',
              )} />
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 px-2 border-l border-border/40 flex-shrink-0">

        {/* Presence */}
        {presence.length > 0 && (
          <div className="flex items-center gap-1 mr-1.5">
            {presence.map(u => (
              <Tooltip key={u.userId}>
                <TooltipTrigger asChild>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white cursor-default"
                    style={{ backgroundColor: u.color }}
                  >
                    {initials(u.displayName)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{u.displayName} is viewing</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={openNotes}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-text-lt hover:text-text hover:bg-surface transition-all cursor-pointer"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Client notes</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDownloadReport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-text-lt hover:text-text hover:bg-surface transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Annual engagement report PDF</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onDownloadSummary}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium text-text-lt hover:text-text hover:bg-surface transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Summary</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>One-page client summary PDF</TooltipContent>
        </Tooltip>

        <div className="relative" ref={menuRef}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center justify-center w-8 h-8 rounded-md text-text-lt hover:text-text hover:bg-surface transition-all cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>More options</TooltipContent>
          </Tooltip>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-border rounded-lg shadow-lg z-20 py-1">
              <button
                onClick={() => { setMenuOpen(false); onDelete() }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-danger hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete client
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
