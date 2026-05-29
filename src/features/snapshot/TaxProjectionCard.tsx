import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui'
import { calcSavings } from '@/lib/calculations'
import { parseDollar, fmt } from '@/lib/utils'
import { CUR_YEAR } from '@/lib/constants'
import type { ClientData } from '@/lib/types'

interface Props {
  client: ClientData
}

function estimateGrossIncome(c: ClientData): number {
  // Best available income estimate: payroll oSal or retirement oSal for current year
  const payroll = parseDollar(c.payrollByYear?.[CUR_YEAR]?.oSal)
  const ret = parseDollar(c.retByYear?.[CUR_YEAR]?.oSal)
  const base = payroll || ret
  // Add corp net as pass-through income estimate
  const corp = parseDollar(c.corpNet)
  return base + corp
}

export function TaxProjectionCard({ client: c }: Props) {
  const fr = (parseFloat(c.fr) || 0) / 100
  const sr = (parseFloat(c.sr) || 0) / 100
  const rate = fr + sr

  const { gross, taxBefore, savings, taxAfter, reduction } = useMemo(() => {
    const gross = estimateGrossIncome(c)
    const taxBefore = Math.round(gross * rate)
    const savings = calcSavings(c)
    const taxAfter = Math.max(0, taxBefore - savings)
    const reduction = taxBefore > 0 ? Math.round((savings / taxBefore) * 100) : 0
    return { gross, taxBefore, savings, taxAfter, reduction }
  }, [c, rate])

  // Need at least a rate and some income to show meaningful numbers
  if (!rate || !gross) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Liability Projection</CardTitle>
        <span className="text-[11px] text-text-lt">{CUR_YEAR}</span>
      </CardHeader>
      <CardBody className="p-0">
        <div className="grid grid-cols-2 divide-x divide-border">
          <ProjectionSide
            label="Without strategies"
            income={gross}
            tax={taxBefore}
            rate={rate}
            accent={false}
          />
          <ProjectionSide
            label="With strategies"
            income={gross}
            tax={taxAfter}
            rate={rate}
            accent
          />
        </div>

        {/* Savings bar */}
        <div className="px-5 py-4 border-t border-border bg-surface/40 rounded-b-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-text-lt uppercase tracking-[.05em]">
              Est. savings from strategies
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-[18px] text-accent tracking-tight">{fmt(savings)}</span>
              {reduction > 0 && (
                <span className="text-[11px] font-semibold text-success bg-success-bg border border-success-border px-1.5 py-0.5 rounded-full">
                  −{reduction}% tax
                </span>
              )}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-700"
              style={{ width: `${Math.min(reduction, 100)}%` }}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function ProjectionSide({
  label, income, tax, rate, accent,
}: {
  label: string; income: number; tax: number; rate: number; accent: boolean
}) {
  const effectiveRate = income > 0 ? ((tax / income) * 100).toFixed(1) : '0.0'
  return (
    <div className="px-5 py-4 flex flex-col gap-1">
      <span className={`text-[10px] font-bold uppercase tracking-[.06em] mb-1 ${accent ? 'text-success' : 'text-text-lt'}`}>
        {label}
      </span>
      <span className={`font-serif text-[22px] tracking-tight leading-tight ${accent ? 'text-success' : 'text-navy'}`}>
        {fmt(tax)}
      </span>
      <span className="text-[11px] text-text-lt">
        on {fmt(income)} · {(rate * 100).toFixed(1)}% marginal
      </span>
      <span className="text-[11px] text-text-lt">
        Effective rate: {effectiveRate}%
      </span>
    </div>
  )
}
