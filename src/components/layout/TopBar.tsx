import { useState, useRef, useEffect } from 'react'
import { FileDown, StickyNote, MoreHorizontal, Trash2, BookOpen } from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { Button } from '@/components/ui'
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

  // Refresh the "X min ago" label every 30s
  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 30000)
    return () => clearInterval(id)
  }, [])

  // Close menu on outside click
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
    <div className="flex flex-col border-b border-border/60 bg-white flex-shrink-0">
      {/* Action row */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-text tracking-tight truncate">{clientName}</h1>
          {savedAt && (
            <span className="text-xs text-text-xs">{savedLabel(savedAt)}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Presence avatars */}
          {presence.length > 0 && (
            <div className="flex items-center gap-1 mr-1">
              {presence.map(u => (
                <div
                  key={u.userId}
                  title={`${u.displayName} is viewing`}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ backgroundColor: u.color }}
                >
                  {initials(u.displayName)}
                </div>
              ))}
              <span className="text-[11px] text-text-lt ml-0.5">
                {presence.length === 1 ? `${presence[0].displayName} is here` : `${presence.length} others here`}
              </span>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={openNotes} className="gap-1.5">
                <StickyNote className="w-3.5 h-3.5" />Notes
              </Button>
            </TooltipTrigger>
            <TooltipContent>View client notes</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onDownloadReport} className="gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />Report
              </Button>
            </TooltipTrigger>
            <TooltipContent>Annual engagement report PDF</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onDownloadSummary} className="gap-1.5">
                <FileDown className="w-3.5 h-3.5" />Summary
              </Button>
            </TooltipTrigger>
            <TooltipContent>One-page client summary PDF</TooltipContent>
          </Tooltip>
          <div className="relative" ref={menuRef}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setMenuOpen(o => !o)} className="px-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>More options</TooltipContent>
            </Tooltip>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-border rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => { setMenuOpen(false); onDelete() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-danger hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete client
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-none px-5 bg-white gap-0">
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
                'relative flex-shrink-0 px-3.5 py-3 text-sm whitespace-nowrap',
                'transition-colors duration-150',
                active
                  ? 'font-semibold text-navy'
                  : 'font-medium text-text-lt hover:text-text',
              )}
            >
              {TAB_LABELS[tab as TabId]}
              {/* Sliding active underline */}
              <span className={cn(
                'absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full transition-all duration-200',
                active ? 'bg-accent opacity-100' : 'opacity-0',
              )} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
