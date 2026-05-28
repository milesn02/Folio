import { Search, SlidersHorizontal, ChevronDown, Plus, ChevronLeft, ChevronRight, Settings, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui'
import {
  useClientStore,
  selectFilteredClients,
  selectAdvisors,
} from '@/store/clientStore'
import { useUiStore } from '@/store/uiStore'

interface SidebarProps {
  onNewClient: () => void
  onDeleteClient: (key: string) => void
}

export function Sidebar({ onNewClient, onDeleteClient }: SidebarProps) {
  const { activeKey, searchQuery, advisorFilter, setActiveKey, setSearchQuery, setAdvisorFilter } =
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
        <div className="px-4 pb-4">
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="font-serif text-2xl text-white tracking-tight">Folio</span>
            <div className="w-1.5 h-1.5 rounded-full bg-accent mb-0.5 flex-shrink-0" />
          </div>
          <p className="text-[10px] text-white/35 uppercase tracking-[.08em] font-medium">
            Tax Advisory Platform
          </p>
        </div>

        {/* Search */}
        <div className="px-4 mb-2.5 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-lt pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className={cn(
              'w-full pl-8 pr-3 py-2 rounded-lg text-[12.5px]',
              'bg-white border border-white/20 text-navy placeholder:text-text-lt',
              'outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all',
            )}
          />
        </div>

        {/* Advisor filter */}
        {advisors.length > 0 && (
          <div className="px-4 mb-2.5 relative">
            <SlidersHorizontal className="absolute left-7 top-1/2 -translate-y-1/2 w-3 h-3 text-text-lt pointer-events-none" />
            <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 w-3 h-3 text-text-lt pointer-events-none" />
            <select
              value={advisorFilter}
              onChange={e => setAdvisorFilter(e.target.value)}
              className={cn(
                'w-full appearance-none pl-8 pr-7 py-1.5 rounded-lg text-[11.5px]',
                'bg-white border border-white/20 text-navy outline-none',
                'focus:border-accent cursor-pointer transition-all',
              )}
            >
              <option value="">All Advisors</option>
              {advisors.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        )}

        {/* Clients header */}
        <p className="px-4 pt-2 pb-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-[.1em]">
          Clients
        </p>

        {/* Client list */}
        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-white/10">
          {filtered.map(c => (
            <div
              key={c.client_key}
              className={cn(
                'group flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg mb-0.5',
                'border-l-[3px] transition-all duration-100',
                activeKey === c.client_key
                  ? 'bg-accent/12 border-l-accent'
                  : 'border-l-transparent hover:bg-white/7',
              )}
            >
              <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left" onClick={() => setActiveKey(c.client_key)}>
                <Avatar name={c.data.name || '?'} size="sm" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate leading-tight">
                    {c.data.name || 'New Client'}
                  </p>
                  {c.data.entities?.[0]?.name && (
                    <p className="text-[11px] text-white/40 truncate leading-tight mt-0.5">
                      {c.data.entities[0].name}
                    </p>
                  )}
                </div>
              </button>
              <button
                onClick={() => onDeleteClient(c.client_key)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-white/30 hover:text-danger hover:bg-white/10 transition-all flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
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
