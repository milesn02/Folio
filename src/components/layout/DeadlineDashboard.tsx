import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useClientStore, selectFilteredClients } from '@/store/clientStore'
import { quarterDate, fmt, parseDollar, cn } from '@/lib/utils'
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

function StatusBadge({ status }: { status: PayStatus }) {
  if (status === 'paid')
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-success-bg text-success border border-success-border whitespace-nowrap">Paid</span>
  if (status === 'scheduled')
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/10 text-accent-dk border border-accent/25 whitespace-nowrap">Scheduled</span>
  return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-danger-bg text-danger border border-danger-border whitespace-nowrap">Unpaid</span>
}

function UrgencyBadge({ daysAway }: { daysAway: number }) {
  if (daysAway < 0)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger-bg text-danger border border-danger-border">{Math.abs(daysAway)}d overdue</span>
  if (daysAway === 0)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger-bg text-danger border border-danger-border">Due today</span>
  if (daysAway <= 7)
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-info-bg text-info border border-info-border">{daysAway}d away</span>
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-dk text-text-md border border-border">{daysAway}d away</span>
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

      {/* Firm context — compact single line, not a hero metric strip */}
      <div className="flex items-center gap-3 text-[12px] text-text-lt mb-6 pb-5 border-b border-border">
        <span>{clients.length} {clients.length === 1 ? 'client' : 'clients'}</span>
        {totalSavings > 0 && (
          <>
            <span className="text-border-dk">·</span>
            <span><span className="text-accent-dk font-semibold">{fmt(totalSavings)}</span> in savings delivered</span>
          </>
        )}
        {overdueCount > 0 && (
          <>
            <span className="text-border-dk">·</span>
            <span className="text-danger font-semibold">{overdueCount} overdue</span>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold text-navy tracking-tight mb-5">Upcoming deadlines</h2>

      {Array.from(groups.entries()).map(([dateKey, groupItems]) => {
        const { daysAway, dueDate, quarter } = groupItems[0]
        const label = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        return (
          <div key={dateKey} className="mb-6 animate-enter">
            <div className="flex items-center gap-2.5 mb-2.5">
              <h3 className="text-[13px] font-semibold text-text-md">Q{quarter} — {label}</h3>
              <UrgencyBadge daysAway={daysAway} />
            </div>
            <div className="rounded-xl overflow-hidden border border-border bg-white shadow-[0_2px_12px_rgba(26,63,40,0.07)]">
              {groupItems.map((item, i) => (
                <button
                  key={item.clientKey}
                  onClick={() => onSelectClient(item.clientKey)}
                  className={cn(
                    'w-full flex items-center gap-6 px-5 py-4 text-left hover:bg-surface/70 active:bg-surface transition-colors duration-150',
                    i > 0 && 'border-t border-border/50',
                  )}
                >
                  <span className="flex-1 text-[14px] font-semibold text-text">{item.clientName}</span>
                  <div className="flex items-center gap-5">
                    {item.fedAmount > 0 && (
                      <div className="text-right">
                        <div className="flex items-baseline gap-1.5 justify-end mb-1">
                          <span className="font-serif text-[17px] text-navy leading-none">{fmt(item.fedAmount)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-xs">Fed</span>
                        </div>
                        <div className="flex justify-end">
                          <StatusBadge status={item.fedStatus} />
                        </div>
                      </div>
                    )}
                    {item.stateAmount > 0 && (
                      <div className="text-right">
                        <div className="flex items-baseline gap-1.5 justify-end mb-1">
                          <span className="font-serif text-[17px] text-navy leading-none">{fmt(item.stateAmount)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-text-xs">State</span>
                        </div>
                        <div className="flex justify-end">
                          <StatusBadge status={item.stateStatus} />
                        </div>
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-border-dk flex-shrink-0" />
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
