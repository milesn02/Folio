import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardBody, Toggle, DollarInput } from '@/components/ui'

import { SAVS } from '@/lib/constants'
import { calcSavings, autoSavingsAmount } from '@/lib/calculations'
import { fmt, cn } from '@/lib/utils'
import type { ClientData } from '@/lib/types'

interface TaxSavingsProps {
  client: ClientData
  onChange: (data: ClientData) => void
}

export function TaxSavings({ client: c, onChange }: TaxSavingsProps) {
  const total = useMemo(() => calcSavings(c), [c])

  function setAmount(key: string, a: string) {
    onChange({ ...c, sav: { ...c.sav, [key]: { ...c.sav[key as keyof typeof c.sav], a } } })
  }
  function setActive(key: string, y: boolean) {
    onChange({ ...c, sav: { ...c.sav, [key]: { ...c.sav[key as keyof typeof c.sav], y, n: !y } } })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Savings Summary</CardTitle>
        <div className="font-serif text-[20px] text-navy tracking-tight">
          {fmt(total)}
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {/* Table header */}
        <div className="grid px-5 py-2 bg-surface border-b border-border text-[10.5px] font-semibold uppercase tracking-[.05em] text-text-lt"
          style={{ gridTemplateColumns: '1fr 140px 80px' }}>
          <span>Strategy</span>
          <span className="text-right">Tax Savings</span>
          <span className="text-center">Active</span>
        </div>

        {SAVS.map((r, i) => {
          const entry = c.sav[r.k]
          const autoVal = autoSavingsAmount(r.k, c)
          // Auto value always wins when available — no stale manual override
          const displayVal = autoVal !== null ? String(autoVal) : (entry?.a ?? '')
          const isAuto = autoVal !== null
          const isInactive = entry?.n === true
          return (
            <div
              key={r.k}
              className={cn(
                'grid items-center px-5 py-3 transition-opacity',
                i < SAVS.length - 1 && 'border-b border-border',
                isInactive && 'opacity-40',
              )}
              style={{ gridTemplateColumns: '1fr 140px 80px' }}
            >
              <div>
                <p className="text-[13px] font-medium text-text">{r.n}</p>
                <p className="text-[11px] text-text-lt mt-0.5">{r.d}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <DollarInput
                  className={cn('w-32 text-right font-mono', isInactive && 'line-through decoration-text-lt')}
                  value={displayVal}
                  onChange={e => !isAuto && setAmount(r.k, e.target.value)}
                  readOnly={isAuto}
                  placeholder="0"
                />
              </div>
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
          className="grid items-center px-5 py-4 bg-navy rounded-b-[10px]"
          style={{ gridTemplateColumns: '1fr 140px 80px' }}
        >
          <span className="text-[12px] font-bold uppercase tracking-[.05em] text-white/60">
            Total Est. Tax Savings
          </span>
          <span className="text-right font-serif text-[20px] text-accent tracking-tight">
            {fmt(total)}
          </span>
          <div />
        </div>
      </CardBody>
    </Card>
  )
}
