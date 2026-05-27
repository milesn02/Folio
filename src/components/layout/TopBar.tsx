import { FileDown, Trash2, Save, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { TABS, TAB_LABELS, type TabId } from '@/lib/constants'
import { useClientStore, selectActiveClient } from '@/store/clientStore'
import { useUiStore } from '@/store/uiStore'

interface TopBarProps {
  onSave: () => void
  onDelete: () => void
  onDownloadSummary: () => void
  saving?: boolean
  clientName: string
}

export function TopBar({ onSave, onDelete, onDownloadSummary, saving, clientName }: TopBarProps) {
  const { activeTab, setActiveTab } = useClientStore()
  const { openNotes } = useUiStore()
  const activeClient = useClientStore(selectActiveClient)
  const strat = activeClient?.data?.strat

  function isHidden(tab: string) {
    if (tab === 'augusta') return !strat?.augusta?.y
    if (tab === 'roth')    return !strat?.backdoor?.y
    if (tab === 'hsa')     return !strat?.health?.y
    return false
  }

  return (
    <div className="flex flex-col border-b border-border bg-white flex-shrink-0">
      {/* Action row */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-border/60">
        <h1 className="text-[15px] font-semibold text-text truncate">{clientName}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openNotes} className="gap-1.5">
            <StickyNote className="w-3.5 h-3.5" />
            Notes
          </Button>
          <Button variant="ghost" size="sm" onClick={onDownloadSummary} className="gap-1.5">
            <FileDown className="w-3.5 h-3.5" />
            Download Summary
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={saving} className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto scrollbar-none px-[22px] bg-surface border-b border-border gap-0.5">
        {TABS.map(tab => {
          const hidden = isHidden(tab)
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
                border: hidden ? 'none' : undefined,
                transition: 'max-width 0.2s ease, opacity 0.15s ease, padding 0.2s ease',
              }}
              className={cn(
                'flex-shrink-0 px-4 py-[10px] text-[12.5px] font-medium whitespace-nowrap rounded-t-md',
                'border-b-[2.5px] -mb-px',
                activeTab === tab
                  ? 'border-b-accent text-navy bg-white font-semibold'
                  : 'border-b-transparent text-text-lt hover:text-text-md hover:bg-black/4',
              )}
            >
              {TAB_LABELS[tab as TabId]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
