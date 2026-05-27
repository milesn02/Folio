import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, Field, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { hsaLimit } from '@/lib/calculations'
import { DISPLAY_YEARS, CUR_YEAR } from '@/lib/constants'
import { cn, parseDollar } from '@/lib/utils'
import type { ClientData, HsaYear } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

const EMPTY: HsaYear = {
  coverage: 'self', contribAmt: '', contribDate: '', custodian: '', acct: '',
  employerContrib: '', investedAmt: '', investDate: '', qualExpenses: '', notes: '',
}

export function HealthSavings({ client: c, onChange }: Props) {
  const [year, setYear] = useState(CUR_YEAR)

  const h: HsaYear = c.hsaByYear?.[year] ?? { ...EMPTY }
  const coverage = h.coverage ?? 'self'
  const lim = hsaLimit(c.dob, year, coverage)

  function setField(key: keyof HsaYear, value: string) {
    const hsaByYear = { ...(c.hsaByYear ?? {}) }
    hsaByYear[year] = { ...h, [key]: value }
    onChange({ ...c, hsaByYear })
  }

  function setCoverage(type: 'self' | 'family') {
    const hsaByYear = { ...(c.hsaByYear ?? {}) }
    hsaByYear[year] = { ...h, coverage: type }
    onChange({ ...c, hsaByYear })
  }

  const myContrib = parseDollar(h.contribAmt)
  const empContrib = parseDollar(h.employerContrib)
  const total = myContrib + empContrib
  const remaining = Math.max(0, lim.total - total)
  const pct = lim.total > 0 ? Math.min(100, Math.round((total / lim.total) * 100)) : 0
  const limRows = DISPLAY_YEARS.map(y => ({
    y,
    self: hsaLimit(c.dob, y, 'self'),
    fam: hsaLimit(c.dob, y, 'family'),
  }))

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />

      {/* Limits table */}
      <Card>
        <CardHeader><CardTitle>HSA Contribution Limits by Year</CardTitle></CardHeader>
        <CardBody className="p-0">
          {!c.dob && (
            <div className="mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[7px] text-[12px] text-danger font-medium">
              ⚠ Add client date of birth on the Snapshot tab to see age-based limits.
            </div>
          )}
          <table className="w-full text-[13px] mt-2">
            <thead>
              <tr className="border-b border-border">
                {['Tax year', 'Age', 'Self-only', 'Family', 'Catch-up (55+)'].map((h, i) => (
                  <th key={h} className={cn('px-4 pb-2.5 text-[10.5px] font-semibold uppercase tracking-[.05em] text-text-lt', i === 0 ? 'text-left' : 'text-right', i === 1 && 'text-center')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {limRows.map(({ y, self: ls, fam: lf }) => (
                <tr key={y} className={cn('border-t border-surface', y === year && 'bg-blue-50')}>
                  <td className={cn('px-4 py-2', y === year ? 'font-bold text-blue-700' : 'text-text-md')}>{y}</td>
                  <td className={cn('px-4 py-2 text-center font-mono', y === year ? 'text-blue-700' : 'text-text-lt')}>{ls.age ?? '—'}</td>
                  <td className="px-4 py-2 text-right font-mono text-text-md">${ls.self.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-mono text-text-md">${lf.family.toLocaleString()}</td>
                  <td className={cn('px-4 py-2 text-right font-mono', ls.catchup > 0 ? 'text-success' : 'text-text-lt')}>
                    {ls.catchup > 0 ? `+$${ls.catchup.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-4 py-3 text-[11px] text-text-lt border-t border-border">
            Highlighted row = currently selected year &nbsp;·&nbsp; Catch-up available at age 55+ &nbsp;·&nbsp; Must be enrolled in an HDHP to contribute
          </p>
        </CardBody>
      </Card>

      {/* Detail */}
      <Card accent>
        <CardHeader><CardTitle>Health Savings Account — {year}</CardTitle></CardHeader>
        <CardBody>
          {/* Coverage selector */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[12px] font-bold uppercase tracking-[.05em] text-text-lt">Coverage type:</span>
            {(['self', 'family'] as const).map(t => (
              <button key={t} onClick={() => setCoverage(t)}
                className={cn('px-4 py-1.5 rounded-md text-[12px] font-semibold border transition-colors',
                  coverage === t ? 'bg-navy text-white border-navy' : 'bg-white text-text-lt border-border hover:border-navy/30')}>
                {t === 'self' ? 'Self-only' : 'Family'}
              </button>
            ))}
          </div>

          {/* Limit display */}
          <div className="mb-5 p-4 bg-surface border border-border rounded-[9px]">
            <p className="text-[10.5px] font-bold uppercase tracking-[.05em] text-text-lt mb-1.5">
              {year} Contribution limit ({coverage})
            </p>
            <p className="font-serif text-[22px] text-navy tracking-tight">
              ${lim.total.toLocaleString()}
              {lim.catchup > 0 && (
                <span className="text-[13px] font-sans text-success font-semibold ml-2">
                  (incl. ${lim.catchup.toLocaleString()} catch-up)
                </span>
              )}
            </p>
            {lim.age !== null && <p className="text-[11px] text-text-lt mt-1">Client age in {year}: {lim.age}</p>}
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[12px] font-semibold text-text-md">{year} Contribution progress</span>
              <span className="text-[12px] font-mono font-bold text-navy">${total.toLocaleString()} / ${lim.total.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-success' : 'bg-navy')}
                style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-text-lt">{pct}% of annual limit</span>
              <span className={cn('text-[11px] font-semibold', remaining > 0 ? 'text-accent' : 'text-success')}>
                {remaining > 0 ? `$${remaining.toLocaleString()} remaining` : 'Limit reached ✓'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Client contribution">
              <DollarInput value={h.contribAmt} onChange={e => setField('contribAmt', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Contribution date">
              <input className={inputCls} value={h.contribDate} onChange={e => setField('contribDate', e.target.value)} placeholder="MM/DD/YYYY" />
            </Field>
            <Field label="Employer contribution">
              <DollarInput value={h.employerContrib} onChange={e => setField('employerContrib', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Custodian / bank">
              <input className={inputCls} value={h.custodian} onChange={e => setField('custodian', e.target.value)} placeholder="—" />
            </Field>
            <Field label="Account # (last 4)">
              <input className={inputCls} value={h.acct} onChange={e => setField('acct', e.target.value)} placeholder="****" />
            </Field>
            <Field label="Amount invested">
              <DollarInput value={h.investedAmt} onChange={e => setField('investedAmt', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Date invested">
              <input className={inputCls} value={h.investDate} onChange={e => setField('investDate', e.target.value)} placeholder="MM/DD/YYYY" />
            </Field>
            <Field label="Qualified expenses YTD">
              <DollarInput value={h.qualExpenses} onChange={e => setField('qualExpenses', e.target.value)} placeholder="0" />
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle>Notes &amp; Reminders</CardTitle></CardHeader>
        <CardBody>
          <Field label="Notes">
            <textarea
              className={cn(inputCls, 'w-full resize-y min-h-[72px]')}
              value={h.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="e.g. HDHP plan details, rollover notes, investment elections…"
            />
          </Field>
          <div className="mt-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-[8px] text-[12px] text-blue-800 leading-relaxed">
            <strong>Key reminders:</strong> Client must be enrolled in a High Deductible Health Plan (HDHP) to contribute.
            Funds roll over year to year — no "use it or lose it." After age 65, funds can be withdrawn for any purpose
            (taxed as ordinary income if non-medical). Consider investing HSA funds for long-term tax-free growth.
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
