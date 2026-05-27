import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, Field, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { DISPLAY_YEARS, CUR_YEAR } from '@/lib/constants'
import { fmt, parseDollar } from '@/lib/utils'
import { mkRetYear } from '@/lib/factory'
import type { ClientData, RetirementYear } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

export function Retirement({ client: c, onChange }: Props) {
  const [year, setYear] = useState(CUR_YEAR)

  const rd: RetirementYear = c.retByYear[year] ?? mkRetYear()

  function setField(key: keyof RetirementYear, value: string) {
    onChange({ ...c, retByYear: { ...c.retByYear, [year]: { ...rd, [key]: value } } })
  }

  const psO = parseDollar(rd.psO)
  const dbO = parseDollar(rd.dbO)
  const psE = parseDollar(rd.psE)
  const dbE = parseDollar(rd.dbE)
  const pre = parseDollar(rd.pre)
  const totalRetirement = psO + dbO + psE + dbE
  const remaining = Math.max(0, totalRetirement - pre)

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />

      <Card accent>
        <CardHeader><CardTitle>Retirement — {year}</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Profit sharing — owner">
              <DollarInput value={rd.psO} onChange={e => setField('psO', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Defined benefit — owner">
              <DollarInput value={rd.dbO} onChange={e => setField('dbO', e.target.value)} placeholder="0" />
            </Field>
            <div />
            <Field label="Profit sharing — employee">
              <DollarInput value={rd.psE} onChange={e => setField('psE', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Defined benefit — employee">
              <DollarInput value={rd.dbE} onChange={e => setField('dbE', e.target.value)} placeholder="0" />
            </Field>
            <div />
            <Field label="Total pre-funded">
              <DollarInput value={rd.pre} onChange={e => setField('pre', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Pre-funded as of date">
              <input className={inputCls} value={rd.preD} onChange={e => setField('preD', e.target.value)} placeholder="MM/DD/YYYY" />
            </Field>
            <Field label="Extension to fund?">
              <select className={inputCls} value={rd.ext} onChange={e => setField('ext', e.target.value)}>
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </Field>
          </div>

          {/* Summary */}
          <div className="mt-5 grid grid-cols-2 gap-4 p-4 bg-surface border border-border rounded-[9px]">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[.05em] text-text-lt mb-1.5">Total to fund (PS + DB)</p>
              <p className="font-serif text-[22px] text-navy tracking-tight">
                {totalRetirement > 0 ? fmt(totalRetirement) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[.05em] text-text-lt mb-1.5">Remaining to fund</p>
              <p className={`font-serif text-[22px] tracking-tight ${remaining > 0 ? 'text-amber-700' : 'text-success'}`}>
                {fmt(remaining)}
              </p>
              <p className="text-[11px] text-text-lt mt-1">= (PS + DB) − Pre-funded</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
