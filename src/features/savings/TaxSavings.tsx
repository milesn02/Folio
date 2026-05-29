import { useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, Toggle, DollarInput } from '@/components/ui'

import { SAVS, CUR_YEAR } from '@/lib/constants'
import { calcSavings, autoSavingsAmount } from '@/lib/calculations'
import { fmt, parseDollar, cn } from '@/lib/utils'
import type { ClientData } from '@/lib/types'

interface TaxSavingsProps {
  client: ClientData
  onChange: (data: ClientData) => void
}

const thisYear = parseInt(CUR_YEAR)
const isPastYear = (y: string) => parseInt(y) < thisYear

export function TaxSavings({ client: c, onChange }: TaxSavingsProps) {
  const [year, setYear] = useState(CUR_YEAR)
  const isPast = isPastYear(year)
  const total = useMemo(() => calcSavings(c, year), [c, year])

  // Accuracy: sum of actual amounts vs. estimated for past years
  const { totalActual, accuracyPct } = useMemo(() => {
    if (!isPast) return { totalActual: 0, accuracyPct: null }
    const totalActual = SAVS.reduce((sum, r) => {
      if (c.sav[r.k]?.n) return sum
      return sum + parseDollar(c.sav[r.k]?.actual)
    }, 0)
    const est = calcSavings(c, year)
    const pct = est > 0 && totalActual > 0 ? Math.round((totalActual / est) * 100) : null
    return { totalActual, accuracyPct: pct }
  }, [c, year, isPast])

  function setAmount(key: string, a: string) {
    onChange({ ...c, sav: { ...c.sav, [key]: { ...c.sav[key as keyof typeof c.sav], a } } })
  }
  function setActive(key: string, y: boolean) {
    onChange({ ...c, sav: { ...c.sav, [key]: { ...c.sav[key as keyof typeof c.sav], y, n: !y } } })
  }
  function setActual(key: string, actual: string) {
    onChange({ ...c, sav: { ...c.sav, [key]: { ...c.sav[key as keyof typeof c.sav], actual } } })
  }

  const gridCols = isPast ? '1fr 130px 130px 80px' : '1fr 140px 80px'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Savings Summary</CardTitle>
        <div className="flex items-center gap-3">
          <select
            className="text-[12px] border border-border rounded-md px-2 py-1 text-text bg-white"
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            {Array.from({ length: 6 }, (_, i) => String(thisYear - i)).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="font-serif text-[20px] text-navy tracking-tight">
            {fmt(total)}
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {/* Empty state */}
        {SAVS.every(r => c.sav[r.k]?.n) && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-text-lt">All strategies are marked inactive.</p>
            <p className="text-xs text-text-xs mt-1">Toggle strategies on in the Snapshot tab to calculate savings.</p>
          </div>
        )}

        {/* Table header */}
        <div
          className="grid px-5 py-2 bg-surface border-b border-border text-xs font-semibold uppercase tracking-[.05em] text-text-lt"
          style={{ gridTemplateColumns: gridCols }}
        >
          <span>Strategy</span>
          <span className="text-right">Est. Savings</span>
          {isPast && <span className="text-right">Actual</span>}
          <span className="text-center">Active</span>
        </div>

        {SAVS.map((r, i) => {
          const entry = c.sav[r.k]
          const autoVal = autoSavingsAmount(r.k, c, year)
          const displayVal = autoVal !== null ? String(autoVal) : (entry?.a ?? '')
          const isAuto = autoVal !== null
          const isInactive = entry?.n === true
          const estAmt = autoVal !== null ? autoVal : parseDollar(entry?.a)
          const actualAmt = parseDollar(entry?.actual)
          const variance = isPast && estAmt > 0 && actualAmt > 0
            ? Math.round(((actualAmt - estAmt) / estAmt) * 100)
            : null

          return (
            <div
              key={r.k}
              className={cn(
                'grid items-center px-5 py-3 transition-opacity',
                i < SAVS.length - 1 && 'border-b border-border',
                isInactive && 'opacity-40',
              )}
              style={{ gridTemplateColumns: gridCols }}
            >
              <div>
                <p className="text-[13px] font-medium text-text">{r.n}</p>
                <p className="text-[11px] text-text-lt mt-0.5">{r.d}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                {isInactive && !displayVal ? (
                  <span className="w-32 text-right text-[14px] text-text-lt/40 font-mono pr-3">—</span>
                ) : (
                  <DollarInput
                    className={cn('w-32 text-right font-mono', isInactive && 'opacity-40 line-through decoration-text-lt')}
                    value={displayVal}
                    onChange={e => !isAuto && setAmount(r.k, e.target.value)}
                    readOnly={isAuto}
                    placeholder="—"
                  />
                )}
              </div>
              {isPast && (
                <div className="flex flex-col items-end gap-0.5">
                  <DollarInput
                    className="w-32 text-right font-mono"
                    value={entry?.actual ?? ''}
                    onChange={e => setActual(r.k, e.target.value)}
                    placeholder="0"
                  />
                  {variance !== null && (
                    <span className={cn(
                      'text-[10px] font-semibold',
                      variance >= 0 ? 'text-green-600' : 'text-danger',
                    )}>
                      {variance >= 0 ? '+' : ''}{variance}%
                    </span>
                  )}
                </div>
              )}
              <div className="flex justify-center">
                <Toggle
                  checked={entry?.y ?? false}
                  onChange={v => setActive(r.k, v)}
                />
              </div>
            </div>
          )
        })}

        {/* Total row */}
        <div
          className="grid items-center px-5 py-4 bg-navy rounded-b-xl"
          style={{ gridTemplateColumns: gridCols }}
        >
          <span className="text-[12px] font-bold uppercase tracking-[.05em] text-white/60">
            Total Est. Tax Savings
          </span>
          <span className="text-right font-serif text-[20px] text-accent tracking-tight">
            {fmt(total)}
          </span>
          {isPast && (
            <div className="flex flex-col items-end">
              {totalActual > 0 && (
                <span className="font-serif text-[20px] text-white tracking-tight">{fmt(totalActual)}</span>
              )}
              {accuracyPct !== null && (
                <span className="text-[10px] font-semibold text-white/50">{accuracyPct}% accuracy</span>
              )}
            </div>
          )}
          <div />
        </div>
      </CardBody>
    </Card>
  )
}
