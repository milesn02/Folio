import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui'
import { STRATEGY_LABELS } from '@/lib/constants'
import type { ClientData, StrategyKey } from '@/lib/types'

interface Gap {
  key: StrategyKey
  reason: string
  priority: 'high' | 'medium'
}

function findGaps(c: ClientData): Gap[] {
  const gaps: Gap[] = []
  const active = (k: StrategyKey) => !!c.strat[k]?.y
  const hasEntities = (c.entities ?? []).some(e => e.name)
  const hasSCorp = (c.entities ?? []).some(e => e.type === 'S-Corporation')
  const hasIncome = !!(c.payrollByYear || c.retByYear)

  if (hasEntities && !active('retPlan')) {
    gaps.push({ key: 'retPlan', reason: 'Entity owner — retirement plan typically reduces $20k–$60k+ in taxes', priority: 'high' })
  }
  if (hasSCorp && !active('pte')) {
    gaps.push({ key: 'pte', reason: 'S-Corp in CA/NY/IL — PTE election bypasses the $10k SALT cap', priority: 'high' })
  }
  if (hasEntities && !active('augusta')) {
    gaps.push({ key: 'augusta', reason: 'Business owner with a home — Augusta rule allows 14 tax-free rental days/year', priority: 'medium' })
  }
  if (hasEntities && !active('family')) {
    gaps.push({ key: 'family', reason: 'Business owner — shifting income to family members reduces overall tax burden', priority: 'medium' })
  }
  if (active('retPlan') && !active('backdoor')) {
    gaps.push({ key: 'backdoor', reason: 'High-income earner with a retirement plan — backdoor Roth adds tax-free growth', priority: 'medium' })
  }
  if (hasIncome && !active('health')) {
    gaps.push({ key: 'health', reason: 'HSA is triple tax-advantaged — deductible, grows tax-free, tax-free withdrawals', priority: 'medium' })
  }

  return gaps.slice(0, 4) // cap at 4 recommendations
}

interface Props {
  client: ClientData
  onActivate: (key: StrategyKey) => void
}

export function GapAnalysis({ client: c, onActivate }: Props) {
  const gaps = useMemo(() => findGaps(c), [c])

  if (gaps.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Opportunities</CardTitle>
        <span className="text-[11px] text-text-lt">{gaps.length} identified</span>
      </CardHeader>
      <CardBody className="p-0">
        {gaps.map((g, i) => (
          <div
            key={g.key}
            className={`flex items-start gap-3 px-5 py-3.5 ${i < gaps.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${g.priority === 'high' ? 'bg-amber-400' : 'bg-blue-300'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text">{STRATEGY_LABELS[g.key]}</p>
              <p className="text-[11px] text-text-lt mt-0.5 leading-relaxed">{g.reason}</p>
            </div>
            <button
              onClick={() => onActivate(g.key)}
              className="flex-shrink-0 text-[11px] font-semibold text-accent hover:text-accent/80 border border-accent/30 hover:border-accent/60 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
            >
              Activate
            </button>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
