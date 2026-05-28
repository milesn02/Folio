import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, Users, FileDown, BookOpen, Plus, LayoutDashboard, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClientStore } from '@/store/clientStore'
import type { TabId } from '@/lib/constants'
import { TAB_LABELS } from '@/lib/constants'

interface Action {
  id: string
  label: string
  sub?: string
  icon: React.ReactNode
  onSelect: () => void
  group: 'client' | 'action' | 'tab'
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNewClient: () => void
  onDownloadSummary: () => void
  onDownloadReport: () => void
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/20 text-navy rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export function CommandPalette({ open, onClose, onNewClient, onDownloadSummary, onDownloadReport }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { clients, setActiveKey, setActiveTab, activeKey } = useClientStore()

  const getActions = useCallback((): Action[] => {
    const q = query.toLowerCase().trim()

    // Client actions
    const clientActions: Action[] = clients
      .filter(c => !q || c.data.name?.toLowerCase().includes(q) || c.data.entities?.[0]?.name?.toLowerCase().includes(q))
      .slice(0, 6)
      .map(c => ({
        id: `client:${c.client_key}`,
        label: c.data.name || 'New Client',
        sub: c.data.entities?.[0]?.name || c.data.adv || '',
        icon: <Users className="w-4 h-4 text-text-lt" />,
        onSelect: () => { setActiveKey(c.client_key); onClose() },
        group: 'client' as const,
      }))

    // Tab navigation (only when a client is open)
    const tabActions: Action[] = activeKey
      ? (Object.entries(TAB_LABELS) as [TabId, string][])
          .filter(([, label]) => !q || label.toLowerCase().includes(q) || ('tab ' + label.toLowerCase()).includes(q))
          .map(([id, label]) => ({
            id: `tab:${id}`,
            label: `Go to ${label}`,
            sub: 'Current client',
            icon: <ArrowRight className="w-4 h-4 text-text-lt" />,
            onSelect: () => { setActiveTab(id); onClose() },
            group: 'tab' as const,
          }))
      : []

    // Static actions
    const staticActions: Action[] = [
      {
        id: 'action:dashboard',
        label: 'Go to Dashboard',
        sub: 'Upcoming deadlines',
        icon: <LayoutDashboard className="w-4 h-4 text-text-lt" />,
        onSelect: () => { setActiveKey(null); onClose() },
        group: 'action' as const,
      },
      {
        id: 'action:new',
        label: 'Add new client',
        icon: <Plus className="w-4 h-4 text-text-lt" />,
        onSelect: () => { onNewClient(); onClose() },
        group: 'action' as const,
      },
      ...(activeKey ? [
        {
          id: 'action:summary',
          label: 'Download client summary',
          icon: <FileDown className="w-4 h-4 text-text-lt" />,
          onSelect: () => { onDownloadSummary(); onClose() },
          group: 'action' as const,
        },
        {
          id: 'action:report',
          label: 'Download engagement report',
          icon: <BookOpen className="w-4 h-4 text-text-lt" />,
          onSelect: () => { onDownloadReport(); onClose() },
          group: 'action' as const,
        },
      ] : []),
    ].filter(a => !q || a.label.toLowerCase().includes(q))

    return [...clientActions, ...tabActions, ...staticActions]
  }, [query, clients, activeKey, setActiveKey, setActiveTab, onClose, onNewClient, onDownloadSummary, onDownloadReport])

  const actions = getActions()

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  // Clamp selected
  useEffect(() => {
    setSelected(s => Math.min(s, Math.max(0, actions.length - 1)))
  }, [actions.length])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, actions.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && actions[selected]) { actions[selected].onSelect() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, actions, selected, onClose])

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selected] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  const groups: { label: string; ids: string[] }[] = [
    { label: 'Clients', ids: actions.filter(a => a.group === 'client').map(a => a.id) },
    { label: 'Navigation', ids: actions.filter(a => a.group === 'tab').map(a => a.id) },
    { label: 'Actions', ids: actions.filter(a => a.group === 'action').map(a => a.id) },
  ].filter(g => g.ids.length > 0)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-[2px]"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in border border-border">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-text-lt flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0) }}
            placeholder="Search clients, navigate, or run an action…"
            className="flex-1 text-[14px] text-text outline-none placeholder:text-text-lt bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-text-lt bg-surface border border-border rounded">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1.5">
          {actions.length === 0 && (
            <p className="px-4 py-8 text-center text-[13px] text-text-lt">No results for "{query}"</p>
          )}
          {groups.map(group => {
            const groupActions = actions.filter(a => group.ids.includes(a.id))
            return (
              <div key={group.label}>
                <p className="px-4 pt-2 pb-1 text-[10.5px] font-semibold uppercase tracking-[.07em] text-text-lt/70">
                  {group.label}
                </p>
                {groupActions.map(action => {
                  const idx = actions.indexOf(action)
                  return (
                    <button
                      key={action.id}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        idx === selected ? 'bg-surface' : 'hover:bg-surface/60',
                      )}
                      onMouseEnter={() => setSelected(idx)}
                      onClick={action.onSelect}
                    >
                      <span className="flex-shrink-0 w-5 flex justify-center">{action.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium text-text block">
                          {action.group === 'client' ? highlight(action.label, query) : action.label}
                        </span>
                        {action.sub && (
                          <span className="text-[11px] text-text-lt block truncate">{action.sub}</span>
                        )}
                      </span>
                      {idx === selected && (
                        <kbd className="flex-shrink-0 text-[10px] font-mono text-text-lt bg-border px-1.5 py-0.5 rounded">
                          ↵
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-4">
          <span className="text-[10.5px] text-text-lt flex items-center gap-1">
            <kbd className="font-mono bg-surface border border-border rounded px-1">↑↓</kbd> navigate
          </span>
          <span className="text-[10.5px] text-text-lt flex items-center gap-1">
            <kbd className="font-mono bg-surface border border-border rounded px-1">↵</kbd> select
          </span>
          <span className="text-[10.5px] text-text-lt flex items-center gap-1">
            <kbd className="font-mono bg-surface border border-border rounded px-1">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  )
}
