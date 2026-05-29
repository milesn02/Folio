import { useMemo } from 'react'
import { useClientStore } from '@/store/clientStore'
import { calcSavings } from '@/lib/calculations'
import { fmt, parseDollar } from '@/lib/utils'
import { SAVS } from '@/lib/constants'

export function PortfolioSummary() {
  const clients = useClientStore(s => s.clients)

  const { totalSavings, totalActual, accuracyPct } = useMemo(() => {
    let totalSavings = 0
    let totalEst = 0
    let totalActual = 0

    for (const c of clients) {
      totalSavings += calcSavings(c.data)

      // Aggregate actual vs estimated for accuracy
      for (const r of SAVS) {
        const entry = c.data.sav[r.k]
        if (entry?.n || !entry?.actual) continue
        const actual = parseDollar(entry.actual)
        if (!actual) continue
        totalActual += actual
        totalEst += parseDollar(entry.a) || 0
      }
    }

    const accuracyPct = totalEst > 0 && totalActual > 0
      ? Math.round((totalActual / totalEst) * 100)
      : null

    return { totalSavings, totalActual, accuracyPct }
  }, [clients])

  if (clients.length === 0) return null

  return (
    <div className="px-3 pb-3">
      <div
        className="rounded-xl px-4 py-3 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(200,169,110,0.12) 0%, rgba(200,169,110,0.06) 100%)', border: '1px solid rgba(200,169,110,0.18)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-[.1em] text-accent/65 mb-1.5">Firm savings delivered</p>
        <p className="font-serif text-[22px] text-accent tracking-tight leading-none">{fmt(totalSavings)}</p>
        {accuracyPct !== null && totalActual > 0 && (
          <p className="text-[10px] text-white/25 mt-1">{accuracyPct}% accuracy · {fmt(totalActual)} confirmed</p>
        )}
      </div>
    </div>
  )
}
