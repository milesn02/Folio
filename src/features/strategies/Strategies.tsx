import { Card, CardHeader, CardTitle, CardBody, Toggle } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { SKS, STRATEGY_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useClientStore } from '@/store/clientStore'
import type { ClientData } from '@/lib/types'

const STRATEGY_TAB_MAP: Partial<Record<typeof SKS[number], string>> = {
  augusta: 'augusta',
  backdoor: 'roth',
  health: 'hsa',
}

interface StrategiesProps {
  client: ClientData
  onChange: (data: ClientData) => void
}

export function Strategies({ client: c, onChange }: StrategiesProps) {
  const { activeTab, setActiveTab } = useClientStore()

  function toggle(key: typeof SKS[number], checked: boolean) {
    const strat = { ...c.strat, [key]: { ...c.strat[key], y: checked, n: !checked } }
    onChange({ ...c, strat })
    // If turning off a strategy whose tab is currently active, redirect to snapshot
    if (!checked) {
      const linkedTab = STRATEGY_TAB_MAP[key]
      if (linkedTab && activeTab === linkedTab) setActiveTab('snapshot')
    }
  }

  function setDate(key: typeof SKS[number], d: string) {
    const strat = { ...c.strat, [key]: { ...c.strat[key], d } }
    onChange({ ...c, strat })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategies &amp; Commitment Dates</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        {SKS.map((k, i) => {
          const s = c.strat[k]
          return (
            <div
              key={k}
              className={cn(
                'flex items-center gap-4 px-5 py-3.5',
                i < SKS.length - 1 && 'border-b border-border',
                s.y && 'bg-success-bg/30',
              )}
            >
              <Toggle
                checked={s.y}
                onChange={checked => toggle(k, checked)}
              />
              <span className={cn(
                'flex-1 text-[13px] font-medium',
                s.y ? 'text-text' : 'text-text-lt',
              )}>
                {STRATEGY_LABELS[k]}
              </span>
              <input
                type="text"
                value={s.d ?? ''}
                onChange={e => setDate(k, e.target.value)}
                placeholder="Commitment date"
                className={cn(inputCls, 'w-40 text-[12px]')}
                disabled={!s.y}
              />
            </div>
          )
        })}
      </CardBody>
    </Card>
  )
}
