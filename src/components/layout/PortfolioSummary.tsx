import { useMemo } from 'react'
import { useClientStore } from '@/store/clientStore'
import { calcSavings } from '@/lib/calculations'
import { SKS, STRATEGY_LABELS } from '@/lib/constants'
import { fmt } from '@/lib/utils'

export function PortfolioSummary() {
  const clients = useClientStore(s => s.clients)

  const stats = useMemo(() => {
    if (clients.length === 0) return null
    const totalSavings = clients.reduce((sum, c) => sum + calcSavings(c.data), 0)
    const topStrats = SKS
      .map(k => ({ k, count: clients.filter(c => c.data.strat[k]?.y).length }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
    return { totalSavings, topStrats }
  }, [clients])

  if (!stats) return null

  return (
    <div className="px-3 pb-3">
      <div className="rounded-[9px] bg-white/5 border border-white/8 px-3 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[.08em] text-white/30 mb-0.5">Firm savings delivered</p>
        <p className="font-serif text-[17px] text-accent tracking-tight mb-2.5">{fmt(stats.totalSavings)}</p>
        <div className="flex flex-col gap-1">
          {stats.topStrats.map(s => (
            <div key={s.k} className="flex items-center justify-between">
              <p className="text-[11px] text-white/45 truncate">{STRATEGY_LABELS[s.k]}</p>
              <p className="text-[11px] font-semibold text-white/30 tabular-nums ml-2 flex-shrink-0">
                {s.count}/{clients.length}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
