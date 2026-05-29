import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useClientStore, selectFilteredClients } from '@/store/clientStore'
import { quarterDate, fmt, parseDollar } from '@/lib/utils'
import { calcSavings } from '@/lib/calculations'
import type { DbClient } from '@/lib/supabase'
import type { PayStatus } from '@/lib/types'

function deriveStatus(s: PayStatus | undefined, a?: boolean, v?: boolean): PayStatus {
  if (s !== undefined) return s
  if (v) return 'paid'
  if (a) return 'scheduled'
  return 'unpaid'
}

interface DeadlineItem {
  clientKey: string
  clientName: string
  quarter: 1 | 2 | 3 | 4
  dueDate: Date
  daysAway: number
  fedAmount: number
  stateAmount: number
  fedStatus: PayStatus
  stateStatus: PayStatus
}

const Q_KEYS = [
  { n: 1 as const, fk: 'q1f26', fsk: 'q1f26s', fak: 'q1f26a', fvk: 'q1f26v', ck: 'q1c26', csk: 'q1c26s', cak: 'q1c26a', cvk: 'q1c26v' },
  { n: 2 as const, fk: 'q2f26', fsk: 'q2f26s', fak: 'q2f26a', fvk: 'q2f26v', ck: 'q2c26', csk: 'q2c26s', cak: 'q2c26a', cvk: 'q2c26v' },
  { n: 3 as const, fk: 'q3f26', fsk: 'q3f26s', fak: 'q3f26a', fvk: 'q3f26v', ck: 'q3c26', csk: 'q3c26s', cak: 'q3c26a', cvk: 'q3c26v' },
  { n: 4 as const, fk: 'q4f26', fsk: 'q4f26s', fak: 'q4f26a', fvk: 'q4f26v', ck: 'q4c26', csk: 'q4c26s', cak: 'q4c26a', cvk: 'q4c26v' },
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
      const fedStatus = deriveStatus(
        pd[q.fsk as keyof typeof pd] as PayStatus | undefined,
        pd[q.fak as keyof typeof pd] as boolean | undefined,
        pd[q.fvk as keyof typeof pd] as boolean | undefined,
      )
      const stateStatus = deriveStatus(
        pd[q.csk as keyof typeof pd] as PayStatus | undefined,
        pd[q.cak as keyof typeof pd] as boolean | undefined,
        pd[q.cvk as keyof typeof pd] as boolean | undefined,
      )
      results.push({
        clientKey: client.client_key,
        clientName: client.data.name || 'New Client',
        quarter: q.n,
        dueDate,
        daysAway,
        fedAmount,
        stateAmount,
        fedStatus,
        stateStatus,
      })
    }
  }

  return results.sort((a, b) => a.daysAway - b.daysAway)
}

export function DeadlineDashboard({ onSelectClient }: { onSelectClient: (key: string) => void }) {
  const clients = useClientStore(selectFilteredClients)
  const items = useMemo(() => getItems(clients), [clients])

  const totalSavings = useMemo(
    () => clients.reduce((sum, c) => sum + calcSavings(c.data), 0),
    [clients],
  )
  const overdueCount = items.filter(i => i.daysAway < 0).length

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
    <div className="flex-1 overflow-y-auto bg-surface px-8 py-7">

      {/* Firm stats strip */}
      <div className="flex items-center gap-8 mb-8 pb-7 border-b border-border">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-0.5">Clients</p>
          <p className="font-serif text-[26px] text-navy tracking-tight leading-none">{clients.length}</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-0.5">Savings Delivered</p>
          <p className="font-serif text-[26px] text-accent-dk tracking-tight leading-none">
            {totalSavings > 0 ? fmt(totalSavings) : '—'}
          </p>
        </div>
        {overdueCount > 0 && (
          <>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-0.5">Overdue</p>
              <p className="font-serif text-[26px] text-danger tracking-tight leading-none">{overdueCount}</p>
            </div>
          </>
        )}
      </div>

      <h2 className="font-serif text-3xl text-navy tracking-tight mb-6">Upcoming Deadlines</h2>
      {Array.from(groups.entries()).map(([dateKey, groupItems]) => {
        const { daysAway, dueDate, quarter } = groupItems[0]
        const label = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        return (
          <div key={dateKey} className="mb-7 animate-enter">
            <div className="flex items-center gap-2.5 mb-3">
              <h3 className="text-sm font-semibold text-text-md">Q{quarter} — {label}</h3>
              {daysAway < 0
                ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger-bg text-danger border border-danger-border">{Math.abs(daysAway)}d overdue</span>
                : daysAway === 0
                ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Due today</span>
                : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{daysAway}d away</span>
              }
            </div>
            <div className="bg-white rounded-xl border border-border shadow overflow-hidden">
              {groupItems.map((item, i) => (
                <button
                  key={item.clientKey}
                  onClick={() => onSelectClient(item.clientKey)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-surface/60 transition-colors duration-150 ${i > 0 ? 'border-t border-border/50' : ''}`}
                >
                  <span className="flex-1 text-sm font-semibold text-text">{item.clientName}</span>
                  <div className="flex items-center gap-6">
                    {item.fedAmount > 0 && (
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[.06em] text-text-xs mb-0.5">Federal</p>
                        <p className={`font-serif text-base font-medium ${item.fedStatus === 'paid' ? 'text-success' : 'text-navy'}`}>
                          {fmt(item.fedAmount)}{item.fedStatus === 'paid' ? ' ✓' : ''}
                        </p>
                      </div>
                    )}
                    {item.stateAmount > 0 && (
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-[.06em] text-text-xs mb-0.5">State</p>
                        <p className={`font-serif text-base font-medium ${item.stateStatus === 'paid' ? 'text-success' : 'text-navy'}`}>
                          {fmt(item.stateAmount)}{item.stateStatus === 'paid' ? ' ✓' : ''}
                        </p>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-text-xs" />
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
