import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useClientStore, selectFilteredClients } from '@/store/clientStore'
import { quarterDate, fmt, parseDollar } from '@/lib/utils'
import type { DbClient } from '@/lib/supabase'

interface DeadlineItem {
  clientKey: string
  clientName: string
  quarter: 1 | 2 | 3 | 4
  dueDate: Date
  daysAway: number
  fedAmount: number
  stateAmount: number
  fedVerified: boolean
  stateVerified: boolean
}

const Q_KEYS = [
  { n: 1 as const, fk: 'q1f26', vk: 'q1f26v', ck: 'q1c26', cvk: 'q1c26v' },
  { n: 2 as const, fk: 'q2f26', vk: 'q2f26v', ck: 'q2c26', cvk: 'q2c26v' },
  { n: 3 as const, fk: 'q3f26', vk: 'q3f26v', ck: 'q3c26', cvk: 'q3c26v' },
  { n: 4 as const, fk: 'q4f26', vk: 'q4f26v', ck: 'q4c26', cvk: 'q4c26v' },
]

function getItems(clients: DbClient[]): DeadlineItem[] {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yr = today.getFullYear()
  const results: DeadlineItem[] = []

  for (const client of clients) {
    const pd = client.data.payByYear?.[String(yr)]
    if (!pd) continue
    for (const q of Q_KEYS) {
      const dueDate = quarterDate(yr, q.n)
      dueDate.setHours(0, 0, 0, 0)
      const daysAway = Math.round((dueDate.getTime() - today.getTime()) / 86400000)
      if (daysAway > 60 || daysAway < -30) continue
      const fedAmount = parseDollar(pd[q.fk as keyof typeof pd] as string)
      const stateAmount = parseDollar(pd[q.ck as keyof typeof pd] as string)
      if (!fedAmount && !stateAmount) continue
      results.push({
        clientKey: client.client_key,
        clientName: client.data.name || 'New Client',
        quarter: q.n,
        dueDate,
        daysAway,
        fedAmount,
        stateAmount,
        fedVerified: pd[q.vk as keyof typeof pd] as boolean,
        stateVerified: pd[q.cvk as keyof typeof pd] as boolean,
      })
    }
  }

  return results.sort((a, b) => a.daysAway - b.daysAway)
}

export function DeadlineDashboard({ onSelectClient }: { onSelectClient: (key: string) => void }) {
  const clients = useClientStore(selectFilteredClients)
  const items = useMemo(() => getItems(clients), [clients])

  const groups = useMemo(() => {
    const map = new Map<string, DeadlineItem[]>()
    for (const item of items) {
      const key = item.dueDate.toISOString().split('T')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [items])

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy/6 flex items-center justify-center mx-auto mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-text mb-1">No upcoming deadlines</p>
          <p className="text-[13px] text-text-lt">All payments are current or no amounts have been entered.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-surface px-8 py-6">
      <h2 className="font-serif text-[22px] text-navy tracking-tight mb-5">Upcoming Deadlines</h2>
      {Array.from(groups.entries()).map(([dateKey, groupItems]) => {
        const { daysAway, dueDate, quarter } = groupItems[0]
        const label = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        return (
          <div key={dateKey} className="mb-6">
            <div className="flex items-center gap-2.5 mb-2.5">
              <h3 className="text-[13px] font-semibold text-text">Q{quarter} — {label}</h3>
              {daysAway < 0
                ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-danger border border-red-200">{Math.abs(daysAway)}d overdue</span>
                : daysAway === 0
                ? <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Due today</span>
                : <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">{daysAway}d away</span>
              }
            </div>
            <div className="bg-white rounded-[10px] border border-border overflow-hidden">
              {groupItems.map((item, i) => (
                <button
                  key={item.clientKey}
                  onClick={() => onSelectClient(item.clientKey)}
                  className={`w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-surface transition-colors ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <span className="flex-1 text-[13px] font-semibold text-text">{item.clientName}</span>
                  <div className="flex items-center gap-5">
                    {item.fedAmount > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-[.05em] text-text-lt">Federal</p>
                        <p className={`font-serif text-[14px] ${item.fedVerified ? 'text-success' : 'text-navy'}`}>
                          {fmt(item.fedAmount)}{item.fedVerified ? ' ✓' : ''}
                        </p>
                      </div>
                    )}
                    {item.stateAmount > 0 && (
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-[.05em] text-text-lt">State</p>
                        <p className={`font-serif text-[14px] ${item.stateVerified ? 'text-success' : 'text-navy'}`}>
                          {fmt(item.stateAmount)}{item.stateVerified ? ' ✓' : ''}
                        </p>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-text-lt" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
