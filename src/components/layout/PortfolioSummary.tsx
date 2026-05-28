import { useMemo } from 'react'
import { useClientStore } from '@/store/clientStore'
import { calcSavings } from '@/lib/calculations'
import { fmt } from '@/lib/utils'

export function PortfolioSummary() {
  const clients = useClientStore(s => s.clients)

  const totalSavings = useMemo(
    () => clients.reduce((sum, c) => sum + calcSavings(c.data), 0),
    [clients],
  )

  if (clients.length === 0) return null

  return (
    <div className="px-3 pb-3">
      <div className="rounded-[9px] bg-white/5 border border-white/8 px-3 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[.08em] text-white/30 mb-0.5">Firm savings delivered</p>
        <p className="font-serif text-[17px] text-accent tracking-tight">{fmt(totalSavings)}</p>
      </div>
    </div>
  )
}
