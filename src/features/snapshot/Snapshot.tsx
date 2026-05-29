import { useMemo, useState } from 'react'
import { useCountUp } from '@/hooks/useCountUp'
import { Card, CardHeader, CardTitle, CardBody, Field, Modal } from '@/components/ui'
import { StrategyPanel, hasPanel } from './StrategyPanel'
import { TaxProjectionCard } from './TaxProjectionCard'
import { GapAnalysis } from './GapAnalysis'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { inputCls } from '@/components/ui/Field'
import { calcSavings, calcSavingsRows } from '@/lib/calculations'
import { SKS, STRATEGY_LABELS, FILING_STATUSES, ETYPES, STATES, CUR_YEAR, SAVS_TO_SKS } from '@/lib/constants'
import { fmt, ageInYear, cn } from '@/lib/utils'
import { useFirmProfiles } from '@/hooks/useFirmProfiles'
import type { ClientData, Entity, EntityType, StrategyKey, StrategyStatus } from '@/lib/types'

const STATUS_LABELS: Record<StrategyStatus, string> = {
  considering:  'Considering',
  committed:    'Committed',
  implementing: 'Implementing',
  complete:     'Complete ✓',
}
const STATUS_STYLES: Record<StrategyStatus, string> = {
  considering:  'text-text-xs',
  committed:    'text-accent-dk',
  implementing: 'text-navy',
  complete:     'text-success',
}
const STATUS_DOTS: Record<StrategyStatus, string> = {
  considering:  'bg-border-dk',
  committed:    'bg-accent',
  implementing: 'bg-navy',
  complete:     'bg-success',
}
const STATUS_CYCLE: StrategyStatus[] = ['considering', 'committed', 'implementing', 'complete']

const BLANK_ENTITY = (): Entity => ({
  name: '', type: 'S-Corporation', state: 'CA',
  payData: { xQ1: '', xQ1a: false, xQ1v: false, xQ2: '', xQ2a: false, xQ2v: false, xQ3: '', xQ3a: false, xQ3v: false, xQ4: '', xQ4a: false, xQ4v: false, pJ: '', pJa: false, pJv: false, pD: '', pDa: false, pDv: false },
})

interface SnapshotProps {
  client: ClientData
  onChange: (data: ClientData) => void
}

export function Snapshot({ client: c, onChange }: SnapshotProps) {
  const set = (updates: Partial<ClientData>) => onChange({ ...c, ...updates })
  const [entityModal, setEntityModal] = useState(false)
  const [draftEntity, setDraftEntity] = useState<Entity>(BLANK_ENTITY())
  const profiles = useFirmProfiles()

  const tot = useMemo(() => calcSavings(c), [c])
  const stratCount = useMemo(() => SKS.filter(k => c.strat[k]?.y).length, [c])
  const age = ageInYear(c.dob, CUR_YEAR)

  const entNames = (c.entities ?? []).map(e => e.name).filter(Boolean)

  const combinedRate = (() => {
    const f = parseFloat(c.fr) || 0
    const s = parseFloat(c.sr) || 0
    if (!f && !s) return '—'
    return (f + s).toFixed(1) + '%'
  })()

  const rateDetail = [c.fr ? c.fr + '% Fed' : null, c.sr ? c.sr + '% State' : null]
    .filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-4 animate-enter">
      {/* Hero + KPI — unified dark section */}
      <div className="rounded-xl overflow-hidden shadow-md">
        {/* Hero band */}
        <div
          className="relative px-8 pt-8 pb-6"
          style={{ background: 'linear-gradient(135deg, #1a3f28 0%, #204d31 55%, #265c3a 100%)' }}
        >
          {/* Noise texture */}
          <div className="absolute inset-0 pointer-events-none rounded-t-xl overflow-hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: '180px 180px',
              opacity: 0.035,
            }}
          />
          {/* Gold ambient glow — top right */}
          <div className="absolute top-0 right-0 w-96 h-64 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top right, rgba(200,169,110,0.10), transparent 68%)' }}
          />
          {/* Decorative gold line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px]"
            style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.55) 35%, rgba(200,169,110,0.55) 65%, transparent 100%)' }}
          />
          <div className="relative">
            <h2 className="font-serif text-[32px] text-white tracking-tight leading-tight mb-3.5">
              {c.name || 'New Client'}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {entNames.map(n => <HeroTag key={n}>{n}</HeroTag>)}
              {c.filing && <HeroTag>{c.filing}</HeroTag>}
              {age !== null && <HeroTag>Age {age}</HeroTag>}
            </div>
          </div>
        </div>

        {/* KPI tray — attached below hero */}
        <div
          className="grid gap-2 px-3 pb-3 pt-2"
          style={{
            gridTemplateColumns: '5fr 2fr 2fr 2fr',
            background: 'linear-gradient(180deg, #1e4830 0%, #142c1d 100%)',
          }}
        >
          <KpiCard label={`Est. Tax Savings — ${CUR_YEAR}`} value={tot ? fmt(tot) : '—'} rawValue={tot || 0} accent large />
          <KpiCard label="Strategies Active" value={String(stratCount)} sub={`/ ${SKS.length} total`} dark />
          <KpiCard label="Combined Rate" value={combinedRate} sub={rateDetail} dark />
          <KpiCard
            label="Advisor"
            value={c.adv || '—'}
            sub={c.mgr ? `Mgr: ${c.mgr}` : undefined}
            valueClass="font-sans font-semibold text-[18px] tracking-tight text-white"
            dark
          />
        </div>
      </div>

      {/* Tax projection */}
      <TaxProjectionCard client={c} />

      {/* Gap analysis */}
      <GapAnalysis
        client={c}
        onActivate={k => onChange({ ...c, strat: { ...c.strat, [k]: { ...c.strat[k], y: true, n: false } } })}
      />

      {/* Strategies */}
      <StrategiesCard client={c} onChange={onChange} />

      {/* Client information */}
      <Card accent>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            <Field label="Primary taxpayer" className="col-span-2">
              <input
                className={inputCls}
                value={c.name}
                onChange={e => set({ name: e.target.value })}
                placeholder="—"
              />
            </Field>
            <Field label="Date of birth">
              <input
                className={inputCls}
                value={c.dob ?? ''}
                onChange={e => set({ dob: e.target.value })}
                placeholder="MM/DD/YYYY"
              />
            </Field>

            <Field label="Spouse name" className="col-span-2">
              <input
                className={inputCls}
                value={c.spouse ?? ''}
                onChange={e => set({ spouse: e.target.value })}
                placeholder="—"
              />
            </Field>
            <Field label="Spouse date of birth">
              <input
                className={inputCls}
                value={c.spouseDob ?? ''}
                onChange={e => set({ spouseDob: e.target.value })}
                placeholder="MM/DD/YYYY"
              />
            </Field>

            <Field label="Filing status">
              <select
                className={inputCls}
                value={c.filing}
                onChange={e => set({ filing: e.target.value })}
              >
                {FILING_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Federal rate (%)">
              <input
                className={inputCls}
                value={c.fr}
                onChange={e => set({ fr: e.target.value })}
                placeholder="—"
              />
            </Field>
            <Field label="State rate (%)">
              <input
                className={inputCls}
                value={c.sr}
                onChange={e => set({ sr: e.target.value })}
                placeholder="—"
              />
            </Field>

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
        </CardBody>
      </Card>

      {/* Entities */}
      <Card>
        <CardHeader>
          <CardTitle>Entities</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {(c.entities ?? []).map((ent, i) => (
            <div
              key={i}
              className={i > 0 ? 'pt-3 border-t border-border' : ''}
            >
              <div className="grid grid-cols-[1fr_160px_80px_32px] gap-2 items-end">
                {i === 0 && (
                  <>
                    <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">Entity name</label>
                    <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">Type</label>
                    <label className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt">State</label>
                    <div />
                  </>
                )}
                <input
                  className={inputCls}
                  value={ent.name}
                  onChange={e => {
                    const entities = [...c.entities]
                    entities[i] = { ...ent, name: e.target.value }
                    set({ entities })
                  }}
                  placeholder="Entity name"
                />
                <select
                  className={inputCls}
                  value={ent.type}
                  onChange={e => {
                    const entities = [...c.entities]
                    entities[i] = { ...ent, type: e.target.value as typeof ent.type }
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
                {i > 0 ? (
                  <button
                    onClick={() => {
                      const entities = c.entities.filter((_, idx) => idx !== i)
                      set({ entities })
                    }}
                    className="text-text-lt hover:text-danger text-lg leading-none"
                    aria-label="Remove entity"
                  >
                    ×
                  </button>
                ) : <div />}
              </div>
            </div>
          ))}

          <button
            onClick={() => { setDraftEntity(BLANK_ENTITY()); setEntityModal(true) }}
            className="text-[12px] font-semibold text-accent hover:text-accent-lt transition-colors"
          >
            + Add entity
          </button>
        </CardBody>
      </Card>

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
              <select
                className={inputCls}
                value={draftEntity.type}
                onChange={e => setDraftEntity(d => ({ ...d, type: e.target.value as EntityType }))}
              >
                {ETYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="State">
              <select
                className={inputCls}
                value={draftEntity.state}
                onChange={e => setDraftEntity(d => ({ ...d, state: e.target.value }))}
              >
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StrategiesCard({ client: c, onChange }: { client: ClientData; onChange: (d: ClientData) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [openPanel, setOpenPanel] = useState<StrategyKey | null>(null)
  const active = SKS.filter(k => c.strat[k]?.y)
  const inactive = SKS.filter(k => !c.strat[k]?.y)
  const savRows = useMemo(() => calcSavingsRows(c), [c])
  const total = useMemo(() => savRows.reduce((s, r) => s + r.amount, 0), [savRows])

  const stratAmounts = useMemo(() => {
    const map: Partial<Record<string, number>> = {}
    for (const row of savRows) {
      const sk = SAVS_TO_SKS[row.key as keyof typeof SAVS_TO_SKS]
      if (sk) map[sk] = (map[sk] ?? 0) + row.amount
    }
    return map
  }, [savRows])

  function activate(k: typeof SKS[number]) {
    onChange({ ...c, strat: { ...c.strat, [k]: { ...c.strat[k], y: true, n: false } } })
    setPickerOpen(false)
  }
  function deactivate(k: typeof SKS[number]) {
    onChange({ ...c, strat: { ...c.strat, [k]: { ...c.strat[k], y: false, n: true } } })
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Tax Savings by Strategy</CardTitle>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-border rounded-md text-xs font-semibold text-text-lt hover:border-accent hover:text-accent transition-colors cursor-pointer">
              <span className="text-sm leading-none">+</span> Add strategy
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-1.5 min-w-[190px]">
            {inactive.length > 0 ? inactive.map(k => (
              <button
                key={k}
                onClick={() => activate(k)}
                className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface rounded-lg transition-colors cursor-pointer"
              >
                {STRATEGY_LABELS[k]}
              </button>
            )) : (
              <p className="px-3 py-2.5 text-xs text-text-lt">All strategies active</p>
            )}
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardBody className="p-0">
        {active.length === 0 ? (
          <p className="px-5 py-4 text-[13px] text-text-lt italic">No strategies active — use + Add strategy to get started.</p>
        ) : (
          <>
            {active.map((k, i) => {
              const amount = stratAmounts[k] ?? null
              const clickable = hasPanel(k)
              return (
                <div
                  key={k}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 transition-all duration-150 relative',
                    i < active.length - 1 && 'border-b border-border',
                    clickable
                      ? 'cursor-pointer group hover:-translate-y-0.5 hover:shadow-md hover:z-10 hover:bg-white select-none'
                      : 'cursor-default hover:bg-surface/60',
                  )}
                  onClick={clickable ? () => setOpenPanel(k) : undefined}
                >
                  <span className="flex-1 text-[13px] font-medium text-text">{STRATEGY_LABELS[k]}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      const cur = c.strat[k]?.status ?? 'considering'
                      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length]
                      onChange({ ...c, strat: { ...c.strat, [k]: { ...c.strat[k], status: next } } })
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0',
                      STATUS_STYLES[c.strat[k]?.status ?? 'considering'],
                    )}
                  >
                    <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOTS[c.strat[k]?.status ?? 'considering'])} />
                    {STATUS_LABELS[c.strat[k]?.status ?? 'considering']}
                  </button>
                  {clickable && (
                    <span className="text-[11px] text-text-lt opacity-0 group-hover:opacity-100 transition-opacity mr-1">Open →</span>
                  )}
                  <span className="font-serif text-[16px] text-navy tracking-tight whitespace-nowrap">
                    {amount != null && amount > 0 ? fmt(amount) : '—'}
                  </span>
                  {total > 0 && amount != null && amount > 0 && (
                    <>
                      <div className="w-24 h-1 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${Math.round((amount / total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-text-lt w-8 text-right">
                        {Math.round((amount / total) * 100)}%
                      </span>
                    </>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); deactivate(k) }}
                    className="w-5 h-5 flex items-center justify-center rounded-full text-text-lt hover:bg-red-50 hover:text-danger transition-colors text-[14px] leading-none ml-1"
                    aria-label={`Remove ${STRATEGY_LABELS[k]}`}
                  >×</button>
                </div>
              )
            })}
            <div className="flex items-center px-5 py-4 rounded-b-xl" style={{ background: 'linear-gradient(90deg, #1a3f28 0%, #204d31 100%)' }}>
              <span className="flex-1 text-xs font-bold uppercase tracking-[.07em] text-white/40">Total Est. Tax Savings</span>
              <span className="font-serif text-xl text-accent tracking-tight">{fmt(total)}</span>
            </div>
          </>
        )}
      </CardBody>
    </Card>

    <StrategyPanel
      stratKey={openPanel}
      client={c}
      onChange={onChange}
      onClose={() => setOpenPanel(null)}
    />
    </>
  )
}

function HeroTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium text-white/55 bg-white/[0.08] border border-white/[0.08] px-2.5 py-[5px] rounded-full tracking-wide">
      {children}
    </span>
  )
}

function KpiCard({
  label, value, rawValue, sub, valueClass, accent, large, dark,
}: {
  label: string; value: string; rawValue?: number; sub?: string; valueClass?: string; accent?: boolean; large?: boolean; dark?: boolean
}) {
  const counted = useCountUp(rawValue ?? 0)
  const displayValue = rawValue != null ? fmt(counted) : value

  return (
    <div className={cn(
      'rounded-lg flex flex-col justify-center',
      large ? 'px-6 py-5 gap-2' : 'px-4 py-3 gap-1',
      accent
        ? 'bg-white/[0.10] border border-accent/35 shadow-[0_0_24px_rgba(200,169,110,0.12)]'
        : dark
        ? 'bg-white/[0.10]'
        : 'bg-white border border-border shadow-sm',
    )}>
      <span className={cn(
        'text-[10px] font-bold uppercase tracking-[.07em]',
        accent ? 'text-accent/75' : dark ? 'text-white/45' : 'text-text-lt',
      )}>
        {label}
      </span>
      <span className={valueClass ?? cn(
        'font-serif tracking-tight leading-none',
        large ? 'text-[46px]' : 'text-[22px]',
        accent ? 'text-accent' : dark ? 'text-white' : 'text-navy',
      )}>
        {displayValue}
      </span>
      {sub && <span className={cn('text-[11px]', accent ? 'text-accent/45' : dark ? 'text-white/40' : 'text-text-lt')}>{sub}</span>}
    </div>
  )
}
