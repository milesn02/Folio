import { useState } from 'react'
import { X } from 'lucide-react'
import { Field } from '@/components/ui'
import { Modal } from '@/components/ui/Modal'
import { inputCls } from '@/components/ui/Field'
import { FILING_STATUSES, ETYPES, STATES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useFirmProfiles } from '@/hooks/useFirmProfiles'
import type { ClientData, Entity, EntityType } from '@/lib/types'

const BLANK_ENTITY = (): Entity => ({
  name: '', type: 'S-Corporation', state: 'CA',
  payData: { xQ1: '', xQ1a: false, xQ1v: false, xQ2: '', xQ2a: false, xQ2v: false, xQ3: '', xQ3a: false, xQ3v: false, xQ4: '', xQ4a: false, xQ4v: false, pJ: '', pJa: false, pJv: false, pD: '', pDa: false, pDv: false },
})

interface Props {
  open: boolean
  onClose: () => void
  client: ClientData
  onChange: (data: ClientData) => void
}

export function ClientSettingsModal({ open, onClose, client: c, onChange }: Props) {
  const profiles = useFirmProfiles()
  const [entityModal, setEntityModal] = useState(false)
  const [draftEntity, setDraftEntity] = useState<Entity>(BLANK_ENTITY())

  const set = (updates: Partial<ClientData>) => onChange({ ...c, ...updates })

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel — slides in from right */}
      <div className="fixed inset-y-0 right-0 w-[480px] max-w-full bg-surface z-50 flex flex-col shadow-xl animate-slide-up"
        style={{ animation: 'slide-in-right 0.22s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-text tracking-tight">Client Settings</h2>
            <p className="text-[12px] text-text-lt mt-0.5">{c.name || 'New Client'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-lt hover:text-text hover:bg-surface transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {/* Personal */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[.07em] text-text-lt mb-3">Taxpayer</h3>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Primary taxpayer" className="col-span-2">
                  <input className={inputCls} value={c.name} onChange={e => set({ name: e.target.value })} placeholder="—" />
                </Field>
                <Field label="Date of birth">
                  <input className={inputCls} value={c.dob ?? ''} onChange={e => set({ dob: e.target.value })} placeholder="MM/DD/YYYY" />
                </Field>
                <Field label="Filing status">
                  <select className={inputCls} value={c.filing} onChange={e => set({ filing: e.target.value })}>
                    {FILING_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Spouse name">
                  <input className={inputCls} value={c.spouse ?? ''} onChange={e => set({ spouse: e.target.value })} placeholder="—" />
                </Field>
                <Field label="Spouse date of birth">
                  <input className={inputCls} value={c.spouseDob ?? ''} onChange={e => set({ spouseDob: e.target.value })} placeholder="MM/DD/YYYY" />
                </Field>
              </div>
            </div>
          </section>

          {/* Tax rates */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[.07em] text-text-lt mb-3">Tax Rates</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Federal rate (%)">
                <input className={inputCls} value={c.fr} onChange={e => set({ fr: e.target.value })} placeholder="—" />
              </Field>
              <Field label="State rate (%)">
                <input className={inputCls} value={c.sr} onChange={e => set({ sr: e.target.value })} placeholder="—" />
              </Field>
            </div>
          </section>

          {/* Advisor */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[.07em] text-text-lt mb-3">Advisory Team</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Advisor">
                <select className={inputCls} value={c.adv} onChange={e => set({ adv: e.target.value })}>
                  <option value="">—</option>
                  {profiles.map(p => <option key={p.id} value={p.display_name}>{p.display_name}</option>)}
                </select>
              </Field>
              <Field label="Manager">
                <select className={inputCls} value={c.mgr} onChange={e => set({ mgr: e.target.value })}>
                  <option value="">—</option>
                  {profiles.map(p => <option key={p.id} value={p.display_name}>{p.display_name}</option>)}
                </select>
              </Field>
            </div>
          </section>

          {/* Entities */}
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[.07em] text-text-lt mb-3">Entities</h3>
            <div className="flex flex-col gap-2">
              {(c.entities ?? []).map((ent, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <input
                      className={cn(inputCls, 'mb-2')}
                      value={ent.name}
                      onChange={e => {
                        const entities = [...c.entities]
                        entities[i] = { ...ent, name: e.target.value }
                        set({ entities })
                      }}
                      placeholder="Entity name"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className={inputCls}
                        value={ent.type}
                        onChange={e => {
                          const entities = [...c.entities]
                          entities[i] = { ...ent, type: e.target.value as EntityType }
                          set({ entities })
                        }}
                      >
                        {ETYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <select
                        className={inputCls}
                        value={ent.state}
                        onChange={e => {
                          const entities = [...c.entities]
                          entities[i] = { ...ent, state: e.target.value }
                          set({ entities })
                        }}
                      >
                        {STATES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  {i > 0 && (
                    <button
                      onClick={() => set({ entities: c.entities.filter((_, idx) => idx !== i) })}
                      className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded text-text-lt hover:text-danger hover:bg-red-50 transition-colors text-lg leading-none"
                    >×</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => { setDraftEntity(BLANK_ENTITY()); setEntityModal(true) }}
                className="text-[12px] font-semibold text-accent hover:text-accent-lt transition-colors text-left py-1"
              >
                + Add entity
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-white flex-shrink-0">
          <p className="text-[11px] text-text-xs">Changes save automatically.</p>
        </div>
      </div>

      {/* Add entity modal */}
      <Modal
        open={entityModal}
        title="Add entity"
        confirmLabel="Add entity"
        onConfirm={() => {
          if (!draftEntity.name.trim()) return
          set({ entities: [...c.entities, { ...draftEntity }] })
          setEntityModal(false)
        }}
        onCancel={() => setEntityModal(false)}
      >
        <div className="flex flex-col gap-4">
          <Field label="Entity name">
            <input
              className={inputCls}
              value={draftEntity.name}
              onChange={e => setDraftEntity(d => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Smith Dental, Inc."
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className={inputCls} value={draftEntity.type} onChange={e => setDraftEntity(d => ({ ...d, type: e.target.value as EntityType }))}>
                {ETYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="State">
              <select className={inputCls} value={draftEntity.state} onChange={e => setDraftEntity(d => ({ ...d, state: e.target.value }))}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Modal>
    </>
  )
}
