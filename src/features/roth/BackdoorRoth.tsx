import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, Field, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { iraLimit } from '@/lib/calculations'
import { DISPLAY_YEARS, CUR_YEAR } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { mkRothYear } from '@/lib/factory'
import type { ClientData, RothYear } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

function StepRow({ label, done, onToggle }: { label: string; done: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0">
      <button onClick={onToggle}
        className={cn('w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
          done ? 'bg-success border-success text-white' : 'border-border bg-white hover:border-success/50')}>
        {done && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        )}
      </button>
      <span className={cn('flex-1 text-[13px]', done ? 'line-through text-text-lt' : 'text-text-md')}>
        {label}
      </span>
    </div>
  )
}

export function BackdoorRoth({ client: c, onChange }: Props) {
  const [year, setYear] = useState(CUR_YEAR)

  const r: RothYear = c.rothByYear?.[year] ?? mkRothYear()
  const isMFJ = c.filing === 'Married Filing Jointly'
  const lim = iraLimit(c.dob, year)

  function setField(key: keyof RothYear, value: string | boolean) {
    const rothByYear = { ...(c.rothByYear ?? {}) }
    rothByYear[year] = { ...r, [key]: value }
    onChange({ ...c, rothByYear })
  }

  const limRows = DISPLAY_YEARS.map(y => ({ y, lim: iraLimit(c.dob, y) }))

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />

      {/* IRA Limits table */}
      <Card>
        <CardHeader><CardTitle>IRA Contribution Limits by Year</CardTitle></CardHeader>
        <CardBody className="p-0">
          {!c.dob && (
            <div className="mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[7px] text-[12px] text-danger font-medium">
              ⚠ Add client date of birth on the Snapshot tab to see age-based limits.
            </div>
          )}
          <table className="w-full text-[13px] mt-2">
            <thead>
              <tr className="border-b border-border">
                {['Tax year', 'Age at year-end', 'Base limit', 'Catch-up', 'Total limit'].map((h, i) => (
                  <th key={h} className={cn('px-4 pb-2.5 text-[10.5px] font-semibold uppercase tracking-[.05em] text-text-lt', i === 0 ? 'text-left' : 'text-right', i === 1 && 'text-center')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limRows.map(({ y, lim: l }) => (
                <tr key={y} className={cn('border-t border-surface', y === year && 'bg-blue-50')}>
                  <td className={cn('px-4 py-2', y === year ? 'font-bold text-blue-700' : 'text-text-md')}>{y}</td>
                  <td className={cn('px-4 py-2 text-center font-mono', y === year ? 'text-blue-700' : 'text-text-lt')}>{l.age ?? '—'}</td>
                  <td className="px-4 py-2 text-right font-mono text-text-md">${l.base.toLocaleString()}</td>
                  <td className={cn('px-4 py-2 text-right font-mono', l.catchup > 0 ? 'text-success' : 'text-text-lt')}>
                    {l.catchup > 0 ? `+$${l.catchup.toLocaleString()}` : '—'}
                  </td>
                  <td className={cn('px-4 py-2 text-right font-mono font-bold', y === year ? 'text-blue-700' : 'text-text')}>
                    ${l.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-[11px] text-text-lt border-t border-border">
            Highlighted row = currently selected year &nbsp;·&nbsp; Catch-up available at age 50+ &nbsp;·&nbsp; SECURE 2.0 enhanced catch-up applies age 60–63
          </p>
        </CardBody>
      </Card>

      {/* Owner */}
      <Card accent>
        <CardHeader>
          <CardTitle>Owner — {year} Backdoor Roth IRA</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="mb-4 p-3.5 bg-surface border border-border rounded-[8px] flex items-start justify-between">
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[.05em] text-text-lt mb-1">{year} Contribution limit</p>
              <p className="font-serif text-[20px] text-navy tracking-tight">
                ${lim.total.toLocaleString()}
                {lim.catchup > 0 && (
                  <span className="text-[12px] font-sans text-success font-semibold ml-2">
                    (incl. ${lim.catchup.toLocaleString()} catch-up)
                  </span>
                )}
              </p>
              {lim.age !== null && <p className="text-[11px] text-text-lt mt-1">Client age in {year}: {lim.age}</p>}
            </div>
          </div>

          <div className="mb-4">
            <StepRow label="Non-deductible traditional IRA contribution made" done={r.contribDone} onToggle={() => setField('contribDone', !r.contribDone)} />
            <StepRow label="Roth conversion completed" done={r.convDone} onToggle={() => setField('convDone', !r.convDone)} />
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Contribution amount">
              <DollarInput value={r.contribAmt} onChange={e => setField('contribAmt', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Contribution date">
              <input className={inputCls} value={r.contribDate} onChange={e => setField('contribDate', e.target.value)} placeholder="MM/DD/YYYY" />
            </Field>
            <div />
            <Field label="Conversion amount">
              <DollarInput value={r.convAmt} onChange={e => setField('convAmt', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Conversion date">
              <input className={inputCls} value={r.convDate} onChange={e => setField('convDate', e.target.value)} placeholder="MM/DD/YYYY" />
            </Field>
            <div />
            <Field label="Institution">
              <input className={inputCls} value={r.institution} onChange={e => setField('institution', e.target.value)} placeholder="—" />
            </Field>
            <Field label="Account # (last 4)">
              <input className={inputCls} value={r.acct} onChange={e => setField('acct', e.target.value)} placeholder="****" />
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* Spouse (MFJ only) */}
      {isMFJ && (
        <Card>
          <CardHeader>
            <CardTitle>Spouse — {year} Backdoor Roth IRA</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <StepRow label="Non-deductible traditional IRA contribution made" done={r.spouseContribDone} onToggle={() => setField('spouseContribDone', !r.spouseContribDone)} />
              <StepRow label="Roth conversion completed" done={r.spouseConvDone} onToggle={() => setField('spouseConvDone', !r.spouseConvDone)} />
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-4">
              <Field label="Contribution amount">
                <DollarInput value={r.spouseContribAmt} onChange={e => setField('spouseContribAmt', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Contribution date">
                <input className={inputCls} value={r.spouseContribDate} onChange={e => setField('spouseContribDate', e.target.value)} placeholder="MM/DD/YYYY" />
              </Field>
              <div />
              <Field label="Conversion amount">
                <DollarInput value={r.spouseConvAmt} onChange={e => setField('spouseConvAmt', e.target.value)} placeholder="0" />
              </Field>
              <Field label="Conversion date">
                <input className={inputCls} value={r.spouseConvDate} onChange={e => setField('spouseConvDate', e.target.value)} placeholder="MM/DD/YYYY" />
              </Field>
              <div />
              <Field label="Institution">
                <input className={inputCls} value={r.spouseInstitution} onChange={e => setField('spouseInstitution', e.target.value)} placeholder="—" />
              </Field>
              <Field label="Account # (last 4)">
                <input className={inputCls} value={r.spouseAcct} onChange={e => setField('spouseAcct', e.target.value)} placeholder="****" />
              </Field>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
