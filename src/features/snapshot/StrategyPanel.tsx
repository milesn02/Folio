import { lazy, Suspense, useEffect, useState } from 'react'
import { STRATEGY_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ClientData, StrategyKey, StrategyStatus } from '@/lib/types'

const STATUS_LABELS: Record<StrategyStatus, string> = {
  considering:  'Considering',
  committed:    'Committed',
  implementing: 'Implementing',
  complete:     'Complete ✓',
}
const STATUS_STYLES: Record<StrategyStatus, string> = {
  considering:  'bg-surface text-text-lt border-border',
  committed:    'bg-amber-50 text-amber-700 border-amber-200',
  implementing: 'bg-blue-50 text-blue-700 border-blue-200',
  complete:     'bg-green-50 text-green-700 border-green-200',
}
const STATUS_CYCLE: StrategyStatus[] = ['considering', 'committed', 'implementing', 'complete']

const AugustaRule   = lazy(() => import('@/features/augusta/AugustaRule').then(m => ({ default: m.AugustaRule })))
const Payroll       = lazy(() => import('@/features/payroll/Payroll').then(m => ({ default: m.Payroll })))
const Retirement    = lazy(() => import('@/features/retirement/Retirement').then(m => ({ default: m.Retirement })))
const BackdoorRoth  = lazy(() => import('@/features/roth/BackdoorRoth').then(m => ({ default: m.BackdoorRoth })))
const HealthSavings = lazy(() => import('@/features/hsa/HealthSavings').then(m => ({ default: m.HealthSavings })))

const HAS_PANEL: Partial<Record<StrategyKey, true>> = {
  retPlan: true, augusta: true, family: true, backdoor: true, health: true,
}

interface Props {
  stratKey: StrategyKey | null
  client: ClientData
  onChange: (d: ClientData) => void
  onClose: () => void
}

export function hasPanel(k: StrategyKey) {
  return !!HAS_PANEL[k]
}

export function StrategyPanel({ stratKey, client, onChange, onClose }: Props) {
  const open = stratKey !== null
  const [draft, setDraft] = useState<ClientData>(client)

  // Reset draft each time the panel opens
  useEffect(() => {
    if (open) setDraft(client)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stratKey])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const props = { client: draft, onChange: setDraft }

  function renderContent() {
    switch (stratKey) {
      case 'augusta':  return <AugustaRule {...props} />
      case 'family':   return <Payroll {...props} />
      case 'retPlan':  return <Retirement {...props} />
      case 'backdoor': return <BackdoorRoth {...props} />
      case 'health':   return <HealthSavings {...props} />
      default:         return null
    }
  }

  function handleSave() {
    onChange(draft)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[92vh] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="font-serif text-[20px] text-navy tracking-tight">
              {stratKey ? STRATEGY_LABELS[stratKey] : ''}
            </h2>
            {stratKey && (
              <select
                value={draft.strat[stratKey]?.status ?? 'considering'}
                onChange={e => {
                  const status = e.target.value as StrategyStatus
                  setDraft(d => ({ ...d, strat: { ...d.strat, [stratKey]: { ...d.strat[stratKey], status } } }))
                }}
                className={cn(
                  'text-[11px] font-semibold border rounded-full px-2.5 py-1 cursor-pointer outline-none transition-colors',
                  STATUS_STYLES[draft.strat[stratKey]?.status ?? 'considering'],
                )}
              >
                {STATUS_CYCLE.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-text-lt hover:bg-surface hover:text-text transition-colors text-[18px]"
          >×</button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <Suspense fallback={<div className="py-12 text-center text-text-lt text-[13px]">Loading…</div>}>
            {renderContent()}
          </Suspense>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-border flex-shrink-0 bg-surface/50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-text-lt hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-navy text-white text-[13px] font-semibold rounded-md hover:bg-navy/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
