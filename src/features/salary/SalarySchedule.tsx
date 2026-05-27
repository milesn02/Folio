import { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, Field, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { calcSal } from '@/lib/calculations'
import { SAL_LIMITS, STATES, STATE_RATES, DISPLAY_YEARS, CUR_YEAR, FREQ_PERIODS } from '@/lib/constants'
import { fmt, cn } from '@/lib/utils'
import type { ClientData, SalaryScheduleEntry } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

function downloadSalarySummary(
  clientName: string,
  personLabel: string,
  year: string,
  entry: SalaryScheduleEntry,
  calc: import('@/lib/types').SalCalcResult,
  tableRows: [string, number, number, boolean][],
  perLbl: string,
) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const fmtN = (n: number) => n < 0
    ? `(${Math.abs(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })})`
    : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  const kpiCards = [
    ['Gross Salary', fmtN(calc.gross)],
    ['Net Take-Home', fmtN(calc.net)],
    ['Pay Frequency', entry.freq ?? 'Monthly'],
    ['State', entry.state ?? 'CA'],
  ].map(([label, value]) => `
    <div style="background:#f7f6f3;border-radius:9px;padding:14px 16px;border:1px solid #e4e1da">
      <div style="font-size:10px;color:#9ca3af;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px">${label}</div>
      <div style="font-size:16px;font-family:'DM Serif Display',serif;color:#0f1e35">${value}</div>
    </div>
  `).join('')

  const rows = tableRows.map(([label, per, ann, sub]) => `
    <tr>
      <td style="padding:10px 14px;border-top:1px solid #f0f0f0;font-size:13px;${sub ? 'color:#6b7280;padding-left:28px' : 'color:#374151;font-weight:500'}">${label}</td>
      <td style="padding:10px 14px;border-top:1px solid #f0f0f0;text-align:right;font-family:'DM Serif Display',serif;font-size:15px;${sub ? 'color:#dc2626' : 'color:#0f1e35'}">${per !== 0 ? fmtN(per) : '—'}</td>
      <td style="padding:10px 14px;border-top:1px solid #f0f0f0;text-align:right;font-family:'DM Serif Display',serif;font-size:15px;${sub ? 'color:#dc2626' : 'color:#0f1e35'}">${ann !== 0 ? fmtN(ann) : '—'}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Salary Summary — ${clientName} (${year})</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;color:#1a1a2e;background:#fff;padding:48px;max-width:900px;margin:0 auto}
  @media print{body{padding:28px}@page{margin:1.5cm}}
</style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #0f1e35">
    <div>
      <div style="font-family:'DM Serif Display',serif;font-size:32px;color:#0f1e35;letter-spacing:-.5px;margin-bottom:4px">${clientName}</div>
      <div style="font-size:13px;color:#6b7280">${personLabel} · ${year}</div>
    </div>
    <div style="text-align:right">
      <div style="font-family:'DM Serif Display',serif;font-size:26px;color:#0f1e35;letter-spacing:-.5px">Folio</div>
      <div style="font-size:11px;color:#c8a96e;font-weight:600;margin-top:4px">${today}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
    ${kpiCards}
  </div>

  <div style="margin-bottom:28px">
    <div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px">Paycheck Breakdown</div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e4e1da;border-radius:10px;overflow:hidden">
      <thead><tr style="background:#0f1e35">
        <th style="padding:10px 14px;text-align:left;font-size:10.5px;color:rgba(200,169,110,.8);font-weight:600;letter-spacing:.04em">Item</th>
        <th style="padding:10px 14px;text-align:right;font-size:10.5px;color:rgba(200,169,110,.8);font-weight:600;letter-spacing:.04em">Per ${perLbl}</th>
        <th style="padding:10px 14px;text-align:right;font-size:10.5px;color:rgba(200,169,110,.8);font-weight:600;letter-spacing:.04em">Annual</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tbody><tr style="background:#f7f6f3">
        <td style="padding:12px 14px;font-size:13px;font-weight:700;color:#0f1e35">Net take-home pay</td>
        <td style="padding:12px 14px;text-align:right;font-family:'DM Serif Display',serif;font-size:18px;color:#0f1e35">${fmtN(calc.netPer)}</td>
        <td style="padding:12px 14px;text-align:right;font-family:'DM Serif Display',serif;font-size:18px;color:#0f1e35">${fmtN(calc.net)}</td>
      </tr></tbody>
    </table>
  </div>

  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e4e1da;display:flex;justify-content:space-between;align-items:center">
    <div style="font-size:11px;color:#9ca3af">Generated by Folio · ${today}</div>
    <div style="font-size:11px;color:#c8a96e;font-weight:600;letter-spacing:.03em">CONFIDENTIAL — For client use only</div>
  </div>

  <script>window.onload=function(){window.print();}<\/script>
</body>
</html>`

  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}

const EMPTY_ENTRY: SalaryScheduleEntry = {
  freq: 'Monthly', gross: '', fedWHPer: '', stateWHPer: '', localWHPer: '',
  deferral: '', deferralType: 'Traditional', catchup: false, catchupAlt: false,
  state: 'CA', city: '',
}

function getPersons(c: ClientData) {
  const persons: { id: string; label: string }[] = [{ id: '__owner__', label: c.name || 'Owner' }]
  const seen = new Set<string>()
  Object.values(c.payrollByYear ?? {}).forEach(yr => {
    ;(yr.family ?? []).forEach(f => {
      if (f.name && !seen.has(f.name)) { seen.add(f.name); persons.push({ id: f.name, label: f.name }) }
    })
  })
  return persons
}

export function SalarySchedule({ client: c, onChange }: Props) {
  const persons = getPersons(c)
  const [personId, setPersonId] = useState('__owner__')
  const [year, setYear] = useState(CUR_YEAR)

  const activePerson = persons.find(p => p.id === personId) ? personId : '__owner__'
  const entry: SalaryScheduleEntry = c.salSched?.[activePerson]?.[year] ?? { ...EMPTY_ENTRY }

  function setEntry(updates: Partial<SalaryScheduleEntry>) {
    const salSched = { ...(c.salSched ?? {}) }
    salSched[activePerson] = { ...(salSched[activePerson] ?? {}) }
    salSched[activePerson][year] = { ...entry, ...updates }
    onChange({ ...c, salSched })
  }

  const calc = useMemo(() => calcSal(entry, year), [entry, year])
  const lim = SAL_LIMITS[year] ?? SAL_LIMITS['2025']
  const stateRate = STATE_RATES[entry.state ?? 'CA']
  const showCity = (entry.state ?? 'CA') === 'NY'
  const over = calc.deferRaw > calc.deferLim

  const perLbl: Record<string, string> = {
    Monthly: 'Month', 'Semi-Monthly': 'Period', 'Bi-Weekly': 'Check', Weekly: 'Check',
  }

  const tableRows: [string, number, number, boolean][] = [
    ['Gross pay', calc.grossPer, calc.gross, false],
    ...(calc.tradDefer ? [
      ['401(k) Traditional deferral', -calc.tradDeferPer, -calc.tradDefer, true] as [string, number, number, boolean],
      ['Federal taxable wages', calc.fedTaxablePer, calc.fedTaxable, false] as [string, number, number, boolean],
    ] : []),
    ['Federal income tax', -calc.fedWHPer, -calc.fedWHTot, true],
    [calc.ssStopMonth ? `Social Security — stops month ${calc.ssStopMonth}` : 'Social Security (6.2%)', -calc.ssTaxPer, -calc.ssTax, true],
    [calc.gross > 200000 ? 'Medicare (1.45% + 0.9%)' : 'Medicare (1.45%)', -calc.medTaxPer, -calc.medTax, true],
    ...(calc.stateWHTot ? [['State income tax', -calc.stateWHPer, -calc.stateWHTot, true] as [string, number, number, boolean]] : []),
    ...(calc.localWHTot ? [['NYC local tax', -calc.localWHPer, -calc.localWHTot, true] as [string, number, number, boolean]] : []),
    ...(calc.rothDefer ? [['401(k) Roth (after-tax)', -calc.rothDeferPer, -calc.rothDefer, true] as [string, number, number, boolean]] : []),
  ]

  return (
    <div className="flex flex-col gap-3.5">
      {persons.length > 1 && (
        <SubTabs
          tabs={persons.map(p => p.label)}
          active={persons.find(p => p.id === activePerson)?.label ?? ''}
          onChange={label => { const p = persons.find(x => x.label === label); if (p) setPersonId(p.id) }}
        />
      )}
      <div className="flex items-center justify-between">
        <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />
        <button
          onClick={() => downloadSalarySummary(
            c.name || 'Client',
            persons.find(p => p.id === activePerson)?.label ?? 'Owner',
            year,
            entry,
            calc,
            tableRows,
            perLbl[entry.freq ?? 'Monthly'] ?? 'Period',
          )}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold bg-navy text-white hover:bg-navy/80 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v8M5 7l3 3 3-3M3 13h10"/>
          </svg>
          Download Summary
        </button>
      </div>

      <Card>
        <CardHeader><CardTitle>Compensation &amp; Withholding</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Gross annual salary">
              <DollarInput value={entry.gross} onChange={e => setEntry({ gross: e.target.value })} placeholder="0" />
            </Field>
            <Field label="State of residence">
              <select className={inputCls} value={entry.state ?? 'CA'} onChange={e => setEntry({ state: e.target.value })}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Pay frequency">
              <select className={inputCls} value={entry.freq ?? 'Monthly'} onChange={e => setEntry({ freq: e.target.value })}>
                {Object.keys(FREQ_PERIODS).map(f => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Federal withholding — annual">
              <DollarInput value={entry.fedWHPer} onChange={e => setEntry({ fedWHPer: e.target.value })} placeholder="0" />
              {calc.fedWHTot > 0 && calc.gross > 0 && (
                <p className="text-[11px] text-text-lt mt-1">{((calc.fedWHTot / calc.gross) * 100).toFixed(1)}% of gross</p>
              )}
            </Field>
            <Field label="State withholding — annual">
              <DollarInput value={entry.stateWHPer} onChange={e => setEntry({ stateWHPer: e.target.value })} placeholder="0" />
              {calc.stateWHTot > 0 && calc.gross > 0 && (
                <p className="text-[11px] text-text-lt mt-1">{((calc.stateWHTot / calc.gross) * 100).toFixed(1)}% of gross</p>
              )}
            </Field>
            {showCity ? (
              <Field label="NYC local withholding — annual (3.88% est.)">
                <DollarInput value={entry.localWHPer} onChange={e => setEntry({ localWHPer: e.target.value })} placeholder="0" />
              </Field>
            ) : <div />}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>401(k) Deferral</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-4 gap-x-4 gap-y-4 items-end">
            <Field label="Annual deferral">
              <DollarInput value={entry.deferral} onChange={e => setEntry({ deferral: e.target.value })} placeholder="0" />
            </Field>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-1.5">Type</p>
              <div className="flex gap-1.5">
                {(['Traditional', 'Roth'] as const).map(t => (
                  <button key={t} onClick={() => setEntry({ deferralType: t })}
                    className={cn('px-3 py-1.5 rounded-md text-[12px] font-semibold border transition-colors',
                      entry.deferralType === t ? 'bg-navy text-white border-navy' : 'bg-white text-text-lt border-border hover:border-navy/30')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-1.5">Catch-up</p>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEntry({ catchup: !entry.catchup, catchupAlt: false })}
                  className={cn('px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors text-left',
                    entry.catchup ? 'bg-navy text-white border-navy' : 'bg-white text-text-lt border-border')}>
                  Age 50+ (+{fmt(lim.catchup)})
                </button>
                <button onClick={() => setEntry({ catchupAlt: !entry.catchupAlt, catchup: false })}
                  className={cn('px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors text-left',
                    entry.catchupAlt ? 'bg-navy text-white border-navy' : 'bg-white text-text-lt border-border')}>
                  Age 60–63 (+{fmt(lim.catchupAlt)})
                </button>
              </div>
            </div>
            <div className="pb-1.5">
              <p className="text-[11px] font-semibold text-text-lt uppercase tracking-[.03em] mb-1.5">Contribution limit</p>
              <div className={cn('text-[12px] font-semibold px-3 py-1.5 rounded-md border',
                over ? 'bg-red-50 text-danger border-red-200' : 'bg-success-bg text-success border-success-bd')}>
                {fmt(calc.deferLim)} — {over ? `Over by ${fmt(calc.deferRaw - calc.deferLim)}` : `${fmt(calc.deferLim - calc.deferRaw)} remaining`}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Paycheck Breakdown</CardTitle></CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-navy">
                <th className="text-left px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[.04em] text-accent/80">Item</th>
                <th className="text-right px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[.04em] text-accent/80">Per {perLbl[entry.freq ?? 'Monthly'] ?? 'Period'}</th>
                <th className="text-right px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[.04em] text-accent/80">Annual</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(([label, per, ann, sub], i) => (
                <tr key={i} className="border-t border-border">
                  <td className={cn('px-4 py-2', sub ? 'pl-8 text-text-lt' : 'font-medium text-text')}>{label}</td>
                  <td className={cn('px-4 py-2 text-right font-serif', sub ? 'text-danger' : 'text-navy')}>
                    {per !== 0 ? (per < 0 ? `(${fmt(-per)})` : fmt(per)) : '—'}
                  </td>
                  <td className={cn('px-4 py-2 text-right font-serif', sub ? 'text-danger' : 'text-navy')}>
                    {ann !== 0 ? (ann < 0 ? `(${fmt(-ann)})` : fmt(ann)) : '—'}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-border bg-surface">
                <td className="px-4 py-3 font-bold text-[14px] text-navy">Net take-home pay</td>
                <td className="px-4 py-3 text-right font-serif text-[16px] text-navy">{fmt(calc.netPer)}</td>
                <td className="px-4 py-3 text-right font-serif text-[16px] text-navy">{fmt(calc.net)}</td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
