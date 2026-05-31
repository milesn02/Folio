import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui'
import { cn } from '@/lib/utils'
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
    gaps.push({ key: 'retPlan', reason: 'Entity owner — a retirement plan is often the highest-leverage tax reduction available', priority: 'high' })
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
    gaps.push({ key: 'health', reason: 'HSA contributions are deductible, grow tax-free, and withdraw tax-free for medical costs', priority: 'medium' })
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
            className={cn(
              'flex items-start gap-3.5 px-5 py-4 transition-colors',
              i < gaps.length - 1 && 'border-b border-border',
              g.priority === 'high' ? 'bg-amber-50/60 hover:bg-amber-50' : 'hover:bg-surface/50',
            )}
          >
            <div className={cn(
              'mt-[3px] w-2 h-2 rounded-full flex-shrink-0',
              g.priority === 'high' ? 'bg-amber-500' : 'bg-border-dk',
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-text">{STRATEGY_LABELS[g.key]}</p>
              <p className="text-[11px] text-text-lt mt-0.5 leading-relaxed">{g.reason}</p>
            </div>
            <button
              onClick={() => onActivate(g.key)}
              className={cn(
                'flex-shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all whitespace-nowrap',
                g.priority === 'high'
                  ? 'text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                  : 'text-accent bg-accent/[0.07] hover:bg-accent/[0.13] border border-accent/30 hover:border-accent/50',
              )}
            >
              Activate
            </button>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
