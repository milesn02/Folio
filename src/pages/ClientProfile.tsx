import { useCallback, lazy, Suspense } from 'react'
import { useClientStore, selectActiveClient } from '@/store/clientStore'
import { useUiStore } from '@/store/uiStore'
import { usePersist } from '@/hooks/useClients'
import { supabase } from '@/lib/supabase'
import { TopBar } from '@/components/layout/TopBar'
import { Snapshot } from '@/features/snapshot/Snapshot'
import { TaxSavings } from '@/features/savings/TaxSavings'
import { exportClientSummary } from '@/lib/pdfExport'
import type { ClientData } from '@/lib/types'

// Lazy-load heavier tabs
const SalarySchedule    = lazy(() => import('@/features/salary/SalarySchedule').then(m => ({ default: m.SalarySchedule })))
const IndividualPayments = lazy(() => import('@/features/payments/IndividualPayments').then(m => ({ default: m.IndividualPayments })))
const EntityPayments    = lazy(() => import('@/features/entity/EntityPayments').then(m => ({ default: m.EntityPayments })))
const Payroll           = lazy(() => import('@/features/payroll/Payroll').then(m => ({ default: m.Payroll })))
const Retirement        = lazy(() => import('@/features/retirement/Retirement').then(m => ({ default: m.Retirement })))
const AugustaRule       = lazy(() => import('@/features/augusta/AugustaRule').then(m => ({ default: m.AugustaRule })))
const BackdoorRoth      = lazy(() => import('@/features/roth/BackdoorRoth').then(m => ({ default: m.BackdoorRoth })))
const HealthSavings     = lazy(() => import('@/features/hsa/HealthSavings').then(m => ({ default: m.HealthSavings })))

interface ClientProfileProps {
  firmId: string
}

export default function ClientProfile({ firmId }: ClientProfileProps) {
  const { activeTab, updateClientData } = useClientStore()
  const dbClient = useClientStore(selectActiveClient)
  const { showToast } = useUiStore()
  const persist = usePersist(dbClient?.client_key ?? '', firmId)

  const client = dbClient?.data ?? null

  const handleChange = useCallback((data: ClientData) => {
    if (!dbClient) return
    updateClientData(dbClient.client_key, data)
    persist(data)
  }, [dbClient, updateClientData, persist])

  const handleSave = useCallback(() => {
    if (!client || !dbClient) return
    persist(client)
    showToast('Saved successfully')
  }, [client, dbClient, persist, showToast])

  const handleDelete = useCallback(async () => {
    if (!dbClient) return
    if (!window.confirm(`Delete ${client?.name || 'this client'}? This cannot be undone.`)) return
    await supabase.from('clients').delete().eq('id', dbClient.id)
    useClientStore.setState(s => ({
      clients: s.clients.filter(c => c.id !== dbClient.id),
      activeKey: null,
    }))
    showToast('Client deleted')
  }, [dbClient, client, showToast])

  const handleDownloadSummary = useCallback(() => {
    if (!client) return
    exportClientSummary(client, '')
  }, [client])

  if (!client || !dbClient) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[15px] font-semibold text-text mb-1">Select a client</p>
          <p className="text-[13px] text-text-lt">or create a new one to get started</p>
        </div>
      </div>
    )
  }

  function renderTab() {
    if (!client) return null
    const props = { client, onChange: handleChange }
    switch (activeTab) {
      case 'snapshot':    return <Snapshot {...props} />
      case 'salary':      return <SalarySchedule {...props} />
      case 'payments':    return <IndividualPayments {...props} />
      case 'entity':      return <EntityPayments {...props} />
      case 'payroll':     return <Payroll {...props} />
      case 'retirement':  return <Retirement {...props} />
      case 'augusta':     return <AugustaRule {...props} />
      case 'roth':        return <BackdoorRoth {...props} />
      case 'hsa':         return <HealthSavings {...props} />
      case 'savings':     return <TaxSavings {...props} />
      default:            return null
    }
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <TopBar
        clientName={client.name || 'New Client'}
        onSave={handleSave}
        onDelete={handleDelete}
        onDownloadSummary={handleDownloadSummary}
      />
      <div className="flex-1 overflow-y-auto px-[22px] py-[18px]">
        <Suspense fallback={<TabSkeleton />}>
          {renderTab()}
        </Suspense>
      </div>
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-32 bg-white rounded-[10px] border border-border" />
      <div className="h-20 bg-white rounded-[10px] border border-border" />
      <div className="h-48 bg-white rounded-[10px] border border-border" />
    </div>
  )
}
