import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { DISPLAY_YEARS, CUR_YEAR } from '@/lib/constants'
import { cn, quarterDate, formatDate } from '@/lib/utils'
import { mkPayData } from '@/lib/factory'
import type { ClientData, PayData, PayStatus } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

const NO_INCOME_TAX_STATES = new Set(['TX', 'FL', 'WA', 'NV', 'WY', 'SD', 'AK', 'TN', 'NH'])

const STATE_PAY_URLS: Partial<Record<string, string>> = {
  CA: 'https://www.ftb.ca.gov/pay/index.html',
  NY: 'https://www.tax.ny.gov/pay/ind/pay_income_tax_online.htm',
  OR: 'https://revenueonline.dor.oregon.gov',
  AZ: 'https://www.aztaxes.gov',
  CO: 'https://www.colorado.gov/revenue/payments',
  IL: 'https://mytax.illinois.gov',
}

function getClientState(c: ClientData): string {
  return c.entities?.[0]?.state || 'CA'
}

const STATUS_CYCLE: PayStatus[] = ['unpaid', 'scheduled', 'paid']

const STATUS_TEXT: Record<PayStatus, string> = {
  unpaid:    'text-danger',
  scheduled: 'text-accent-dk',
  paid:      'text-success',
}
const STATUS_DOTS: Record<PayStatus, string> = {
  unpaid:    'bg-danger',
  scheduled: 'bg-accent',
  paid:      'bg-success',
}
const STATUS_LABELS: Record<PayStatus, string> = {
  unpaid:    'Unpaid',
  scheduled: 'Scheduled',
  paid:      'Paid',
}

// Derive status from legacy booleans for old records that predate the status field
function deriveStatus(s: PayStatus | undefined, a?: boolean, v?: boolean): PayStatus {
  if (s !== undefined) return s
  if (v) return 'paid'
  if (a) return 'scheduled'
  return 'unpaid'
}

function StatusPill({ status, onClick }: { status: PayStatus; onClick: () => void }) {
  if (status === 'unpaid') {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors whitespace-nowrap px-2 py-0.5 rounded bg-red-50 text-danger border border-red-200 hover:bg-red-100"
      >
        {STATUS_LABELS[status]}
      </button>
    )
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap',
        STATUS_TEXT[status],
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOTS[status])} />
      {STATUS_LABELS[status]}
    </button>
  )
}

function DaysBadge({ date }: { date: Date }) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const days = Math.round((d.getTime() - today.getTime()) / 86400000)
  if (days < 0) return (
    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-danger border border-red-200">
      {Math.abs(days)}d overdue
    </span>
  )
  if (days === 0) return (
    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-accent/10 text-accent-dk border border-accent/30">
      Due today
    </span>
  )
  if (days <= 14) return (
    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-accent/10 text-accent-dk border border-accent/30">
      {days}d away
    </span>
  )
  return null
}

function AVBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn('h-7 px-2.5 rounded text-[11px] font-semibold border transition-colors',
        active ? 'bg-navy text-white border-navy' : 'bg-surface text-text-lt border-border hover:border-navy/30')}>
      {label}
    </button>
  )
}

export function IndividualPayments({ client: c, onChange }: Props) {
  const [year, setYear] = useState(CUR_YEAR)

  const pd: PayData = c.payByYear[year] ?? mkPayData()
  const isLegacy = parseInt(year) <= 2025
  const yr = parseInt(year)
  const clientState = getClientState(c)
  const noStateTax = NO_INCOME_TAX_STATES.has(clientState)

  function setField(key: keyof PayData, value: string | boolean | PayStatus) {
    onChange({ ...c, payByYear: { ...c.payByYear, [year]: { ...pd, [key]: value } } })
  }

  function cycleStatus(key: keyof PayData, current: PayStatus) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
    setField(key, next)
  }

  // ── Legacy quarters (≤2025) ──────────────────────────────────
  type LegacyQ = { n: 1|2|3|4; date: Date; fk: keyof PayData; ak: keyof PayData; vk: keyof PayData; ck: keyof PayData; cak: keyof PayData; cvk: keyof PayData }
  const legacyQuarters: LegacyQ[] = [
    { n: 1, date: quarterDate(yr, 1), fk: 'q1f', ak: 'q1a', vk: 'q1v', ck: 'q1c', cak: 'q1ca', cvk: 'q1cv' },
    { n: 2, date: quarterDate(yr, 2), fk: 'q2f', ak: 'q2a', vk: 'q2v', ck: 'q2c', cak: 'q2ca', cvk: 'q2cv' },
    { n: 3, date: quarterDate(yr, 3), fk: 'q3f', ak: 'q3a', vk: 'q3v', ck: 'q3c', cak: 'q3ca', cvk: 'q3cv' },
    { n: 4, date: quarterDate(yr, 4), fk: 'q4f', ak: 'q4a', vk: 'q4v', ck: 'q4c', cak: 'q4ca', cvk: 'q4cv' },
  ]

  // ── 2026+ quarters ────────────────────────────────────────────
  type ModernQ = { n: 1|2|3|4; date: Date; fk: keyof PayData; fsk: keyof PayData; facct: keyof PayData; ck: keyof PayData; csk: keyof PayData; cacct: keyof PayData }
  const modernQuarters: ModernQ[] = [
    { n: 1, date: quarterDate(yr, 1), fk: 'q1f26', fsk: 'q1f26s', facct: 'q1f26acct', ck: 'q1c26', csk: 'q1c26s', cacct: 'q1c26acct' },
    { n: 2, date: quarterDate(yr, 2), fk: 'q2f26', fsk: 'q2f26s', facct: 'q2f26acct', ck: 'q2c26', csk: 'q2c26s', cacct: 'q2c26acct' },
    { n: 3, date: quarterDate(yr, 3), fk: 'q3f26', fsk: 'q3f26s', facct: 'q3f26acct', ck: 'q3c26', csk: 'q3c26s', cacct: 'q3c26acct' },
    { n: 4, date: quarterDate(yr, 4), fk: 'q4f26', fsk: 'q4f26s', facct: 'q4f26acct', ck: 'q4c26', csk: 'q4c26s', cacct: 'q4c26acct' },
  ]

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />
      <Card>
        <CardHeader>
          <CardTitle>Individual Payments — {year}</CardTitle>
        </CardHeader>
        <CardBody className="p-0">

          {/* ── Legacy table (≤2025) ── */}
          {isLegacy && (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th scope="col" className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt w-[28%]">Due date</th>
                  <th scope="col" className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt">Federal</th>
                  <th scope="col" className="text-center px-2 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt w-[14%]">Auth / Void</th>
                  {noStateTax ? (
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt/40" colSpan={2}>
                      No state income tax ({clientState})
                    </th>
                  ) : (
                    <>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt">{clientState}</th>
                      <th className="text-center px-2 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt w-[14%]">Auth / Void</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-surface/40">
                  <td className="px-4 py-2 text-[12px] text-text-lt italic">Prior year credit</td>
                  <td className="px-3 py-2"><DollarInput ghost className="w-24 font-mono text-right" value={pd.cFed} onChange={e => setField('cFed', e.target.value)} placeholder="—" /></td>
                  <td className="px-2 py-2 text-center text-text-lt/40 text-lg">—</td>
                  {!noStateTax && (
                    <>
                      <td className="px-3 py-2"><DollarInput ghost className="w-24 font-mono text-right" value={pd.cCA} onChange={e => setField('cCA', e.target.value)} placeholder="—" /></td>
                      <td className="px-2 py-2 text-center text-text-lt/40 text-lg">—</td>
                    </>
                  )}
                </tr>
                {legacyQuarters.map(q => (
                  <tr key={q.n} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-2 font-medium text-text">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {formatDate(q.date)} — Q{q.n}
                        <DaysBadge date={q.date} />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <DollarInput ghost className="w-24 font-mono text-right" value={pd[q.fk] as string} onChange={e => setField(q.fk, e.target.value)} placeholder="—" />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-1 justify-center">
                        <AVBtn active={pd[q.ak] as boolean} label="Auth" onClick={() => setField(q.ak, !pd[q.ak])} />
                        <AVBtn active={pd[q.vk] as boolean} label="Void" onClick={() => setField(q.vk, !pd[q.vk])} />
                      </div>
                    </td>
                    {!noStateTax && (
                      <>
                        <td className="px-3 py-2">
                          <DollarInput ghost className="w-24 font-mono text-right" value={pd[q.ck] as string} onChange={e => setField(q.ck, e.target.value)} placeholder="—" />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1 justify-center">
                            <AVBtn active={pd[q.cak] as boolean} label="Auth" onClick={() => setField(q.cak, !pd[q.cak])} />
                            <AVBtn active={pd[q.cvk] as boolean} label="Void" onClick={() => setField(q.cvk, !pd[q.cvk])} />
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── Modern table (2026+) ── */}
          {!isLegacy && (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th scope="col" className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt w-[28%]">Due date</th>
                  <th scope="col" className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt">Federal</th>
                  <th scope="col" className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt w-[18%]">Status / Acct</th>
                  {noStateTax ? (
                    <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt/40" colSpan={2}>
                      No state income tax ({clientState})
                    </th>
                  ) : (
                    <>
                      <th scope="col" className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt">{clientState}</th>
                      <th scope="col" className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-[.04em] text-text-lt w-[18%]">Status / Acct</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border bg-surface/40">
                  <td className="px-4 py-2 text-[12px] text-text-lt italic">Prior year credit</td>
                  <td className="px-3 py-2"><DollarInput ghost className="w-24 font-mono text-right" value={pd.cFed} onChange={e => setField('cFed', e.target.value)} placeholder="—" /></td>
                  <td className="px-3 py-2 text-text-lt/40">—</td>
                  {!noStateTax && (
                    <>
                      <td className="px-3 py-2"><DollarInput ghost className="w-24 font-mono text-right" value={pd.cCA} onChange={e => setField('cCA', e.target.value)} placeholder="—" /></td>
                      <td className="px-3 py-2 text-text-lt/40">—</td>
                    </>
                  )}
                </tr>
                {modernQuarters.map(q => {
                  const fStatus = deriveStatus(pd[q.fsk] as PayStatus | undefined, pd['q' + q.n + 'f26a' as keyof PayData] as boolean, pd['q' + q.n + 'f26v' as keyof PayData] as boolean)
                  const cStatus = deriveStatus(pd[q.csk] as PayStatus | undefined, pd['q' + q.n + 'c26a' as keyof PayData] as boolean, pd['q' + q.n + 'c26v' as keyof PayData] as boolean)
                  const fShowAcct = fStatus === 'scheduled' || fStatus === 'paid'
                  const cShowAcct = cStatus === 'scheduled' || cStatus === 'paid'
                  return (
                    <tr key={q.n} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-2 font-medium text-text">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {formatDate(q.date)} — Q{q.n}
                          <DaysBadge date={q.date} />
                        </div>
                        <div className="flex gap-2.5 mt-1">
                          <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer"
                            className="text-[11px] font-medium text-accent-dk hover:underline">IRS Direct Pay ↗</a>
                          {!noStateTax && STATE_PAY_URLS[clientState] && (
                            <a href={STATE_PAY_URLS[clientState]} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] font-medium text-accent-dk hover:underline">{clientState} Pay ↗</a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <DollarInput ghost className="w-24 font-mono text-right" value={pd[q.fk] as string} onChange={e => setField(q.fk, e.target.value)} placeholder="—" />
                      </td>
                      <td className="px-3 py-2">
                        <StatusPill status={fStatus} onClick={() => cycleStatus(q.fsk, fStatus)} />
                        {fShowAcct && (
                          <input
                            className={cn(inputCls, 'w-20 mt-1.5 text-center font-mono text-[12px]')}
                            value={pd[q.facct] as string}
                            onChange={e => setField(q.facct, e.target.value)}
                            placeholder="Acct ****"
                          />
                        )}
                      </td>
                      {!noStateTax && (
                        <>
                          <td className="px-3 py-2">
                            <DollarInput ghost className="w-24 font-mono text-right" value={pd[q.ck] as string} onChange={e => setField(q.ck, e.target.value)} placeholder="—" />
                          </td>
                          <td className="px-3 py-2">
                            <StatusPill status={cStatus} onClick={() => cycleStatus(q.csk, cStatus)} />
                            {cShowAcct && (
                              <input
                                className={cn(inputCls, 'w-20 mt-1.5 text-center font-mono text-[12px]')}
                                value={pd[q.cacct] as string}
                                onChange={e => setField(q.cacct, e.target.value)}
                                placeholder="Acct ****"
                              />
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

        </CardBody>
      </Card>
    </div>
  )
}
