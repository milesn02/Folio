import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, DollarInput } from '@/components/ui'

import { cn } from '@/lib/utils'
import { mkEntityPayData } from '@/lib/factory'
import { CUR_YEAR } from '@/lib/constants'
import type { ClientData, EntityPayData } from '@/lib/types'

interface Props { client: ClientData; onChange: (data: ClientData) => void }

function AVBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn('h-7 px-2.5 rounded text-[11px] font-semibold border transition-colors',
        active ? 'bg-navy text-white border-navy' : 'bg-surface text-text-lt border-border hover:border-navy/30')}>
      {label}
    </button>
  )
}

type Row = { date: string; type: string; fk: keyof EntityPayData; ak: keyof EntityPayData; vk: keyof EntityPayData }
const CORP_ROWS: Row[] = [
  { date: '04/15', type: 'CA Corp estimate', fk: 'xQ1', ak: 'xQ1a', vk: 'xQ1v' },
  { date: '06/15', type: 'CA Corp estimate', fk: 'xQ2', ak: 'xQ2a', vk: 'xQ2v' },
  { date: '09/15', type: 'CA Corp estimate', fk: 'xQ3', ak: 'xQ3a', vk: 'xQ3v' },
  { date: '12/15', type: 'CA Corp estimate', fk: 'xQ4', ak: 'xQ4a', vk: 'xQ4v' },
  { date: '06/15', type: 'PTE',              fk: 'pJ',  ak: 'pJa',  vk: 'pJv'  },
  { date: '12/31', type: 'PTE',              fk: 'pD',  ak: 'pDa',  vk: 'pDv'  },
]

export function EntityPayments({ client: c, onChange }: Props) {
  const [entityIdx, setEntityIdx] = useState(0)
  const entities = c.entities ?? []

  if (!entities.length) {
    return (
      <div className="bg-white border border-border/70 rounded-xl shadow-sm px-5 py-10 text-center">
        <p className="text-sm text-text-lt">No entities added yet.</p>
        <p className="text-xs text-text-xs mt-1">Add an entity on the Snapshot tab to track entity payments here.</p>
      </div>
    )
  }

  const ent = entities[entityIdx] ?? entities[0]
  const pd: EntityPayData = ent.payData ?? mkEntityPayData()

  function setField(key: keyof EntityPayData, value: string | boolean) {
    const entities = [...c.entities]
    entities[entityIdx] = { ...ent, payData: { ...pd, [key]: value } }
    onChange({ ...c, entities })
  }

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs
        tabs={entities.map((e, i) => e.name || `Entity ${i + 1}`)}
        active={ent.name || `Entity ${entityIdx + 1}`}
        onChange={label => {
          const idx = entities.findIndex((e, i) => (e.name || `Entity ${i + 1}`) === label)
          if (idx >= 0) setEntityIdx(idx)
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle>{ent.name || 'Entity'} — {CUR_YEAR} Tax Payments</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          <p className="px-5 py-2.5 border-b border-border text-[12px] text-text-lt font-medium">
            {ent.type} &nbsp;·&nbsp; {ent.state}
          </p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th scope="col" className="text-left px-4 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[12%]">Date</th>
                <th scope="col" className="text-left px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[28%]">Type</th>
                <th scope="col" className="text-left px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[24%]">Amount</th>
                <th scope="col" className="text-center px-2 py-2 text-[10.5px] font-semibold uppercase tracking-[.04em] text-text-lt w-[20%]">Auth / Void</th>
              </tr>
            </thead>
            <tbody>
              {CORP_ROWS.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-2 font-medium text-text">{row.date}</td>
                  <td className="px-3 py-2 text-text-lt">{row.type}</td>
                  <td className="px-3 py-2">
                    <DollarInput
                      ghost
                      className="w-28 font-mono text-right"
                      value={pd[row.fk] as string}
                      onChange={e => setField(row.fk, e.target.value)}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1 justify-center">
                      <AVBtn active={pd[row.ak] as boolean} label="Auth" onClick={() => setField(row.ak, !pd[row.ak])} />
                      <AVBtn active={pd[row.vk] as boolean} label="Void" onClick={() => setField(row.vk, !pd[row.vk])} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}
