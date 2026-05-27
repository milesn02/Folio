import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { DISPLAY_YEARS, CUR_YEAR } from '@/lib/constants'
import { fmt, cn } from '@/lib/utils'
import { mkPayData } from '@/lib/factory'
import type { ClientData, PayData } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

function AVBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn('w-7 h-7 rounded text-[11px] font-bold border transition-colors',
        active ? 'bg-navy text-white border-navy' : 'bg-white text-text-lt border-border hover:border-navy/30')}>
      {label}
    </button>
  )
}

export function IndividualPayments({ client: c, onChange }: Props) {
  const [year, setYear] = useState(CUR_YEAR)

  const pd: PayData = c.payByYear[year] ?? mkPayData()
  const isLegacy = parseInt(year) <= 2025

  function setField(key: keyof PayData, value: string | boolean) {
    onChange({ ...c, payByYear: { ...c.payByYear, [year]: { ...pd, [key]: value } } })
  }

  type QuarterDef = {
    n: number; date: string
    fk: keyof PayData; ak: keyof PayData; vk: keyof PayData; facct: keyof PayData | null
    ck: keyof PayData; cak: keyof PayData; cvk: keyof PayData; cacct: keyof PayData | null
  }

  const quarters: QuarterDef[] = isLegacy
    ? [
        { n: 1, date: '04/15', fk: 'q1f', ak: 'q1a', vk: 'q1v', facct: null, ck: 'q1c', cak: 'q1ca', cvk: 'q1cv', cacct: null },
        { n: 2, date: '06/16', fk: 'q2f', ak: 'q2a', vk: 'q2v', facct: null, ck: 'q2c', cak: 'q2ca', cvk: 'q2cv', cacct: null },
        { n: 3, date: '09/15', fk: 'q3f', ak: 'q3a', vk: 'q3v', facct: null, ck: 'q3c', cak: 'q3ca', cvk: 'q3cv', cacct: null },
        { n: 4, date: '01/15', fk: 'q4f', ak: 'q4a', vk: 'q4v', facct: null, ck: 'q4c', cak: 'q4ca', cvk: 'q4cv', cacct: null },
      ]
    : [
        { n: 1, date: '04/15', fk: 'q1f26', ak: 'q1f26a', vk: 'q1f26v', facct: 'q1f26acct', ck: 'q1c26', cak: 'q1c26a', cvk: 'q1c26v', cacct: 'q1c26acct' },
        { n: 2, date: '06/16', fk: 'q2f26', ak: 'q2f26a', vk: 'q2f26v', facct: 'q2f26acct', ck: 'q2c26', cak: 'q2c26a', cvk: 'q2c26v', cacct: 'q2c26acct' },
        { n: 3, date: '09/15', fk: 'q3f26', ak: 'q3f26a', vk: 'q3f26v', facct: 'q3f26acct', ck: 'q3c26', cak: 'q3c26a', cvk: 'q3c26v', cacct: 'q3c26acct' },
        { n: 4, date: '01/15', fk: 'q4f26', ak: 'q4f26a', vk: 'q4f26v', facct: 'q4f26acct', ck: 'q4c26', cak: 'q4c26a', cvk: 'q4c26v', cacct: 'q4c26acct' },
      ]

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />
      <Card>
        <CardHeader>
          <CardTitle>Individual Payments — {year}</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <p className="text-[11px] text-text-lt font-medium px-5 py-3 border-b border-border">
            A = Auto bank debit &nbsp;·&nbsp; V = Payment verified
            {!isLegacy && ' · Acct = Last 4 digits of bank account'}
            {isLegacy && (
              <span className="ml-2 px-2 py-0.5 bg-surface border border-border rounded text-[10px]">
                Account tracking available for 2026+
              </span>
            )}
          </p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[16%]">Due date</th>
                <th className="text-left px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[14%]">Federal</th>
                <th className="text-center px-2 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[8%]">A / V</th>
                {!isLegacy && <th className="text-center px-2 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[7%]">Acct</th>}
                <th className="text-left px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[14%]">California</th>
                <th className="text-center px-2 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[8%]">A / V</th>
                {!isLegacy && <th className="text-center px-2 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[7%]">Acct</th>}
              </tr>
            </thead>
            <tbody>
              {/* Prior year credit */}
              <tr className="border-b border-border bg-surface/50">
                <td className="px-4 py-2 text-[12px] text-text-lt italic">Prior year credit</td>
                <td className="px-3 py-2">
                  <DollarInput className="w-24" value={fmt(pd.cFed) || pd.cFed} onChange={e => setField('cFed', e.target.value)} placeholder="0" />
                </td>
                <td className="px-2 py-2 text-center text-text-lt/40 text-lg">—</td>
                {!isLegacy && <td className="px-2 py-2 text-center text-text-lt/40 text-lg">—</td>}
                <td className="px-3 py-2">
                  <DollarInput className="w-24" value={fmt(pd.cCA) || pd.cCA} onChange={e => setField('cCA', e.target.value)} placeholder="0" />
                </td>
                <td className="px-2 py-2 text-center text-text-lt/40 text-lg">—</td>
                {!isLegacy && <td className="px-2 py-2 text-center text-text-lt/40 text-lg">—</td>}
              </tr>
              {quarters.map(q => (
                <tr key={q.n} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 font-medium text-text">{q.date} — Q{q.n}</td>
                  <td className="px-3 py-2">
                    <DollarInput className="w-24" value={pd[q.fk] as string} onChange={e => setField(q.fk, e.target.value)} placeholder="0" />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1 justify-center">
                      <AVBtn active={pd[q.ak] as boolean} label="A" onClick={() => setField(q.ak, !pd[q.ak])} />
                      <AVBtn active={pd[q.vk] as boolean} label="V" onClick={() => setField(q.vk, !pd[q.vk])} />
                    </div>
                  </td>
                  {!isLegacy && q.facct && (
                    <td className="px-2 py-2">
                      <input className={cn(inputCls, 'w-14 text-center font-mono text-[12px]')} value={pd[q.facct] as string} onChange={e => setField(q.facct!, e.target.value)} placeholder="****" />
                    </td>
                  )}
                  <td className="px-3 py-2">
                    <DollarInput className="w-24" value={pd[q.ck] as string} onChange={e => setField(q.ck, e.target.value)} placeholder="0" />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1 justify-center">
                      <AVBtn active={pd[q.cak] as boolean} label="A" onClick={() => setField(q.cak, !pd[q.cak])} />
                      <AVBtn active={pd[q.cvk] as boolean} label="V" onClick={() => setField(q.cvk, !pd[q.cvk])} />
                    </div>
                  </td>
                  {!isLegacy && q.cacct && (
                    <td className="px-2 py-2">
                      <input className={cn(inputCls, 'w-14 text-center font-mono text-[12px]')} value={pd[q.cacct] as string} onChange={e => setField(q.cacct!, e.target.value)} placeholder="****" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
