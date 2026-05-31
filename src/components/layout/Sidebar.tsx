import { Search, SlidersHorizontal, ChevronDown, Plus, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn, relativeTime, quarterDate } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import {
  useClientStore,
  selectFilteredClients,
  selectAdvisors,
} from '@/store/clientStore'
import { useUiStore } from '@/store/uiStore'
import type { DbClient } from '@/lib/supabase'
import { CUR_YEAR } from '@/lib/constants'
import { parseDollar } from '@/lib/utils'

type ClientStatus = 'overdue' | 'upcoming' | 'ok' | 'none'

function getClientStatus(c: DbClient): ClientStatus {
  const year = parseInt(CUR_YEAR)
  const pay = c.data.payByYear?.[CUR_YEAR]
  if (!pay) return 'none'
  const now = new Date()
  let hasOverdue = false
  let hasUpcoming = false
  for (const q of [1, 2, 3, 4] as const) {
    const amtKey = `q${q}f26` as keyof typeof pay
    const statusKey = `q${q}f26s` as keyof typeof pay
    const amt = parseDollar(pay[amtKey] as string)
    if (!amt) continue
    const status = (pay[statusKey] ?? 'unpaid') as string
    if (status === 'paid') continue
    const due = quarterDate(year, q)
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 0) hasOverdue = true
    else if (diff <= 14) hasUpcoming = true
  }
  if (hasOverdue) return 'overdue'
  if (hasUpcoming) return 'upcoming'
  return 'ok'
}

function StatusDot({ status }: { status: ClientStatus }) {
  if (status === 'none') return null
  return (
    <span className={cn(
      'w-2 h-2 rounded-full flex-shrink-0',
      status === 'overdue'  && 'bg-danger',
      status === 'upcoming' && 'bg-accent',
      status === 'ok'       && 'bg-success',
    )} title={
      status === 'overdue'  ? 'Payment overdue' :
      status === 'upcoming' ? 'Payment due soon' : 'All payments on track'
    } />
  )
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-accent">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  )
}

interface SidebarProps {
  onNewClient: () => void
}

export function Sidebar({ onNewClient }: SidebarProps) {
  const { clients, activeKey, searchQuery, advisorFilter, setActiveKey, setSearchQuery, setAdvisorFilter } =
    useClientStore()
  const filtered = useClientStore(selectFilteredClients)
  const advisors = useClientStore(selectAdvisors)
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'flex flex-col bg-navy flex-shrink-0 transition-all duration-200 overflow-hidden',
        sidebarCollapsed ? 'w-11' : 'w-[268px]',
      )}
    >
      {/* Toggle button */}
      <div className={cn('flex', sidebarCollapsed ? 'justify-center pt-3' : 'justify-end pt-2.5 px-2.5')}>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-white/35 hover:text-white/85 hover:bg-white/8 transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Body — hidden when collapsed */}
      <div className={cn('flex flex-col flex-1 overflow-hidden transition-opacity duration-150', sidebarCollapsed && 'opacity-0 pointer-events-none')}>
        {/* Logo */}
        <button className="px-5 pb-5 pt-1 text-left group" onClick={() => setActiveKey(null)}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-serif text-[26px] text-white tracking-tight leading-none group-hover:text-accent/90 transition-colors duration-200">Folio</span>
            <div className="w-[5px] h-[5px] rounded-full bg-accent flex-shrink-0" />
          </div>
          <p className="text-[10px] text-white/25 uppercase tracking-[.12em] font-semibold">
            Tax Advisory Platform
          </p>
        </button>

        {/* Search */}
        <div className="px-3 mb-2 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clients…"
            className={cn(
              'w-full pl-8 pr-12 py-2 rounded-lg text-sm',
              'bg-white/[0.10] border border-white/[0.16] text-white placeholder:text-white/30',
              'outline-none focus:bg-white/[0.13] focus:border-white/[0.28] transition-all duration-150',
            )}
          />
          <kbd className="absolute right-6 top-1/2 -translate-y-1/2 text-2xs font-mono text-white/20 border border-white/10 rounded px-1 py-px pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Advisor filter */}
        {advisors.length > 0 && (
          <div className="px-3 mb-2 relative">
            <SlidersHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
            <select
              value={advisorFilter}
              onChange={e => setAdvisorFilter(e.target.value)}
              className={cn(
                'w-full appearance-none pl-8 pr-7 py-1.5 rounded-lg text-xs',
                'bg-white/[0.07] border border-white/10 text-white/80 outline-none',
                'focus:border-white/20 cursor-pointer transition-all duration-150',
              )}
            >
              <option value="">All Advisors</option>
              {advisors.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        {/* Clients header */}
        <div className="px-4 pt-1.5 pb-1 flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[.12em]">Clients</p>
          <p className="text-[10px] font-semibold text-white/20 tabular-nums">
            {(searchQuery || advisorFilter) && filtered.length !== clients.length
              ? `${filtered.length} of ${clients.length}`
              : clients.length}
          </p>
        </div>

        {/* Client list */}
        <div className="flex-1 overflow-y-auto px-2 scrollbar-none">
          {filtered.map(c => {
            const status = getClientStatus(c)
            const updatedAt = c.updated_at
            return (
              <button
                key={c.client_key}
                onClick={() => setActiveKey(c.client_key)}
                className={cn(
                  'relative group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-px text-left',
                  'transition-all duration-150',
                  activeKey === c.client_key
                    ? 'bg-white/[0.10] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'hover:bg-white/[0.05]',
                )}
              >
                {/* Active indicator */}
                <div className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200',
                  activeKey === c.client_key ? 'h-5 bg-accent opacity-100' : 'h-0 opacity-0',
                )} />
                <Avatar name={c.data.name || '?'} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className={cn(
                      'text-sm truncate leading-tight transition-colors',
                      activeKey === c.client_key ? 'font-semibold text-white' : 'font-medium text-white/75 group-hover:text-white/90',
                    )}>
                      <HighlightText text={c.data.name || 'New Client'} query={searchQuery} />
                    </p>
                    <StatusDot status={status} />
                  </div>
                  <p className="text-xs text-white/30 truncate leading-tight mt-0.5">
                    {c.data.entities?.[0]?.name
                      ? <HighlightText text={c.data.entities[0].name} query={searchQuery} />
                      : updatedAt
                      ? relativeTime(updatedAt)
                      : null}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom actions */}
        <div className="p-3 border-t border-white/8 flex flex-col gap-1.5">
          <button
            onClick={onNewClient}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[12.5px] font-semibold text-white/50 hover:text-white hover:bg-white/7 transition-all border border-white/10 hover:border-white/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add new client
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[12px] text-white/30 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>
    </aside>
  )
}
