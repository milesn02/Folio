import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, Field, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { DISPLAY_YEARS, CUR_YEAR } from '@/lib/constants'
import { fmt, parseDollar } from '@/lib/utils'
import type { ClientData, AugustaYear } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

const EMPTY: AugustaYear = { rec: '', paid: '', date: '', instruction: '', savings: '' }

export function AugustaRule({ client: c, onChange }: Props) {
  const [year, setYear] = useState(CUR_YEAR)

  const a: AugustaYear = c.augustaByYear?.[year] ?? { ...EMPTY }

  function setField(key: keyof AugustaYear, value: string) {
    const augustaByYear = { ...(c.augustaByYear ?? {}) }
    augustaByYear[year] = { ...a, [key]: value }
    onChange({ ...c, augustaByYear })
  }

  const fr = (parseFloat(c.fr) || 0) / 100
  const sr = (parseFloat(c.sr) || 0) / 100
  const combinedRate = fr + sr

  const rec = parseDollar(a.rec)
  const paid = parseDollar(a.paid)
  const remaining = Math.max(0, rec - paid)
  const calcSav = combinedRate > 0 ? Math.round(rec * combinedRate) : null

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />

      <Card accent>
        <CardHeader><CardTitle>Augusta Rule — {year}</CardTitle></CardHeader>
        <CardBody>
          {combinedRate === 0 && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[7px] text-[12px] text-danger font-medium">
              ⚠ Set federal &amp; state tax rates on Snapshot to enable auto-calculated tax savings.
            </div>
          )}

          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Augusta rent recommended">
              <DollarInput value={a.rec} onChange={e => setField('rec', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Amount already paid">
              <DollarInput value={a.paid} onChange={e => setField('paid', e.target.value)} placeholder="0" />
            </Field>
            <Field label="As of date">
              <input className={inputCls} value={a.date} onChange={e => setField('date', e.target.value)} placeholder="MM/DD/YYYY" />
            </Field>
            <Field label={`Remaining to pay by 12/31/${year}`}>
              <DollarInput value={remaining > 0 ? String(remaining) : '0'} readOnly className="bg-surface text-text-lt" />
            </Field>
            <Field label="Instruction sent">
              <input className={inputCls} value={a.instruction} onChange={e => setField('instruction', e.target.value)} placeholder="—" />
            </Field>
            <Field label="Tax savings">
              <DollarInput value={a.savings || (calcSav ? String(calcSav) : '')} onChange={e => setField('savings', e.target.value)} placeholder="0" />
            </Field>
          </div>

          {combinedRate > 0 && (
            <div className="mt-4 px-4 py-3 bg-surface border border-border rounded-[7px] text-[12px] text-text-lt leading-relaxed">
              <span className="font-semibold text-text-md">Auto-calc:</span>{' '}
              Recommended rent × (Fed {c.fr || 0}% + State {c.sr || 0}%) ={' '}
              <span className="font-mono font-semibold text-navy">
                {calcSav ? fmt(calcSav) : 'enter rent above'}
              </span>
              . Edit the Tax savings field to override.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
