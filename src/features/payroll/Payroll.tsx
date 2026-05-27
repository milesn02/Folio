import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardBody, SubTabs, Field, Modal, DollarInput } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { k401Limit } from '@/lib/calculations'
import { DISPLAY_YEARS, CUR_YEAR } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { mkPayrollYear } from '@/lib/factory'
import type { ClientData, PayrollYear, FamilyMember } from '@/lib/types'

const BLANK_MEMBER: FamilyMember = { name: '', sal: '', fWH: '', cWH: '' }

interface Props { client: ClientData; onChange: (data: ClientData) => void }

export function Payroll({ client: c, onChange }: Props) {
  const [year, setYear] = useState(CUR_YEAR)
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<FamilyMember>(BLANK_MEMBER)

  const pr: PayrollYear = c.payrollByYear[year] ?? mkPayrollYear()

  function setField(key: keyof PayrollYear, value: string) {
    onChange({ ...c, payrollByYear: { ...c.payrollByYear, [year]: { ...pr, [key]: value } } })
  }

  function setFamilyMember(i: number, updates: Partial<FamilyMember>) {
    const family = [...(pr.family ?? [])]
    family[i] = { ...family[i], ...updates }
    onChange({ ...c, payrollByYear: { ...c.payrollByYear, [year]: { ...pr, family } } })
  }

  function openAddModal() {
    setDraft(BLANK_MEMBER)
    setModalOpen(true)
  }

  function confirmAdd() {
    if (!draft.name.trim()) return
    const family = [...(pr.family ?? []), { ...draft }]
    onChange({ ...c, payrollByYear: { ...c.payrollByYear, [year]: { ...pr, family } } })
    setModalOpen(false)
  }

  function removeFamilyMember(i: number) {
    const family = (pr.family ?? []).filter((_, idx) => idx !== i)
    onChange({ ...c, payrollByYear: { ...c.payrollByYear, [year]: { ...pr, family } } })
  }

  const k401lim = k401Limit(c.dob, year)

  return (
    <div className="flex flex-col gap-3.5">
      <SubTabs tabs={DISPLAY_YEARS} active={year} onChange={setYear} />

      <Card accent>
        <CardHeader><CardTitle>Payroll — {year}</CardTitle></CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Owner salary">
              <DollarInput value={pr.oSal} onChange={e => setField('oSal', e.target.value)} placeholder="0" />
            </Field>
            <Field label="Prior year corp net income">
              <DollarInput value={c.corpNet ?? ''} onChange={e => onChange({ ...c, corpNet: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Adjustment to current year">
              <DollarInput value={c.corpAdj ?? ''} onChange={e => onChange({ ...c, corpAdj: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Federal withholding">
              <DollarInput value={pr.fWH} onChange={e => setField('fWH', e.target.value)} placeholder="0" />
            </Field>
            <Field label="CA withholding">
              <DollarInput value={pr.cWH} onChange={e => setField('cWH', e.target.value)} placeholder="0" />
            </Field>
            <Field label="401(k) deferral">
              <DollarInput value={pr.k401} onChange={e => setField('k401', e.target.value)} placeholder="0" />
              <p className="mt-1.5 text-[11px] text-text-lt leading-relaxed">
                {year} limit:{' '}
                <span className="font-mono font-semibold text-navy">${k401lim.total.toLocaleString()}</span>
                {k401lim.age !== null && ` · Age ${k401lim.age}`}
                {k401lim.catchup > 0 && (
                  <span className="text-success font-semibold"> · +${k401lim.catchup.toLocaleString()} catch-up</span>
                )}
                {k401lim.note && <><br /><span>{k401lim.note}</span></>}
              </p>
            </Field>
            <Field label="401(k) type">
              <select className={inputCls} value={pr.k401t} onChange={e => setField('k401t', e.target.value)}>
                <option>Traditional</option>
                <option>Roth</option>
              </select>
            </Field>
          </div>
        </CardBody>
      </Card>

      <Modal
        open={modalOpen}
        title="Add family member"
        confirmLabel="Add"
        onConfirm={confirmAdd}
        onCancel={() => setModalOpen(false)}
      >
        <div className="flex flex-col gap-4">
          <Field label="Name">
            <input
              className={inputCls}
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Jane Smith"
              autoFocus
            />
          </Field>
          <Field label="Salary">
            <DollarInput
              value={draft.sal}
              onChange={e => setDraft(d => ({ ...d, sal: e.target.value }))}
              placeholder="0"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Federal withholding">
              <DollarInput
                value={draft.fWH}
                onChange={e => setDraft(d => ({ ...d, fWH: e.target.value }))}
                placeholder="0"
              />
            </Field>
            <Field label="CA withholding">
              <DollarInput
                value={draft.cWH}
                onChange={e => setDraft(d => ({ ...d, cWH: e.target.value }))}
                placeholder="0"
              />
            </Field>
          </div>
        </div>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Family Payroll — {year}</CardTitle>
          <button onClick={openAddModal} className="text-[12px] font-semibold text-accent hover:text-accent-lt transition-colors">
            + Add family member
          </button>
        </CardHeader>
        <CardBody className={pr.family?.length ? 'p-0' : undefined}>
          {!pr.family?.length ? (
            <p className="text-[13px] text-text-lt italic">No family members added yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr_32px] gap-2 px-4 pt-3 pb-2 border-b border-border">
                {['Name', 'Salary', 'Fed WH', 'CA WH', ''].map((h, i) => (
                  <span key={i} className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">{h}</span>
                ))}
              </div>
              {(pr.family ?? []).map((f, i) => (
                <div key={i} className={cn('grid grid-cols-[1fr_1fr_1fr_1fr_32px] gap-2 px-4 py-3', i < (pr.family?.length ?? 0) - 1 && 'border-b border-border')}>
                  <input className={inputCls} value={f.name} onChange={e => setFamilyMember(i, { name: e.target.value })} placeholder="Name" />
                  <DollarInput value={f.sal} onChange={e => setFamilyMember(i, { sal: e.target.value })} placeholder="0" />
                  <DollarInput value={f.fWH} onChange={e => setFamilyMember(i, { fWH: e.target.value })} placeholder="0" />
                  <DollarInput value={f.cWH} onChange={e => setFamilyMember(i, { cWH: e.target.value })} placeholder="0" />
                  <button onClick={() => removeFamilyMember(i)} className="text-text-lt hover:text-danger text-lg leading-none">×</button>
                </div>
              ))}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
