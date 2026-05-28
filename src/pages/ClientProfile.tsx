import { useCallback, lazy, Suspense, useState, useEffect } from 'react'
import { useClientStore, selectActiveClient } from '@/store/clientStore'
import { useUiStore } from '@/store/uiStore'
import { usePersist } from '@/hooks/useClients'
import { useAuth } from '@/hooks/useAuth'
import { usePresence } from '@/hooks/usePresence'
import { supabase } from '@/lib/supabase'
import { TopBar } from '@/components/layout/TopBar'
import { Modal } from '@/components/ui/Modal'
import { Snapshot } from '@/features/snapshot/Snapshot'
import { TaxSavings } from '@/features/savings/TaxSavings'
import { exportClientSummary } from '@/lib/pdfExport'
import { exportEngagementReport } from '@/lib/engagementReport'
import type { ClientData } from '@/lib/types'

const SalarySchedule     = lazy(() => import('@/features/salary/SalarySchedule').then(m => ({ default: m.SalarySchedule })))
const IndividualPayments = lazy(() => import('@/features/payments/IndividualPayments').then(m => ({ default: m.IndividualPayments })))
const EntityPayments     = lazy(() => import('@/features/entity/EntityPayments').then(m => ({ default: m.EntityPayments })))
const Payroll            = lazy(() => import('@/features/payroll/Payroll').then(m => ({ default: m.Payroll })))
const Retirement         = lazy(() => import('@/features/retirement/Retirement').then(m => ({ default: m.Retirement })))
const AugustaRule        = lazy(() => import('@/features/augusta/AugustaRule').then(m => ({ default: m.AugustaRule })))
const BackdoorRoth       = lazy(() => import('@/features/roth/BackdoorRoth').then(m => ({ default: m.BackdoorRoth })))
const HealthSavings      = lazy(() => import('@/features/hsa/HealthSavings').then(m => ({ default: m.HealthSavings })))

interface ClientProfileProps { firmId: string }

export default function ClientProfile({ firmId }: ClientProfileProps) {
  const { activeTab, updateClientData } = useClientStore()
  const dbClient = useClientStore(selectActiveClient)
  const { showToast } = useUiStore()
  const { firm, user, profile } = useAuth()
  const presence = usePresence(dbClient?.client_key ?? null, user?.id ?? null, profile?.display_name ?? null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)

  const persist = usePersist(dbClient?.client_key ?? '', firmId, () => setSavedAt(new Date()))
  const client = dbClient?.data ?? null

  const handleChange = useCallback((data: ClientData) => {
    if (!dbClient) return
    updateClientData(dbClient.client_key, data)
    persist(data)
  }, [dbClient, updateClientData, persist])

  // Cmd+S / Ctrl+S — immediate save
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (!client || !dbClient || !firmId) return
        supabase
          .from('clients')
          .update({ data: client, updated_at: new Date().toISOString() })
          .eq('client_key', dbClient.client_key)
          .eq('firm_id', firmId)
          .then(() => setSavedAt(new Date()))
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [client, dbClient, firmId])

  const handleDelete = useCallback(async () => {
    if (!dbClient) return
    await supabase.from('clients').delete().eq('id', dbClient.id)
    useClientStore.setState(s => ({
      clients: s.clients.filter(c => c.id !== dbClient.id),
      activeKey: null,
    }))
    setDeleteModal(false)
    showToast('Client deleted')
  }, [dbClient, showToast])

  const handleDownloadSummary = useCallback(() => {
    if (!client) return
    exportClientSummary(client, firm?.name ?? '')
  }, [client, firm?.name])

  const handleDownloadReport = useCallback(() => {
    if (!client) return
    exportEngagementReport(client, firm?.name ?? '')
  }, [client, firm?.name])

  // Listen for command-palette download events
  useEffect(() => {
    const onSummary = () => handleDownloadSummary()
    const onReport  = () => handleDownloadReport()
    window.addEventListener('folio:download-summary', onSummary)
    window.addEventListener('folio:download-report',  onReport)
    return () => {
      window.removeEventListener('folio:download-summary', onSummary)
      window.removeEventListener('folio:download-report',  onReport)
    }
  }, [handleDownloadSummary, handleDownloadReport])

  if (!client || !dbClient) return null

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
        savedAt={savedAt}
        onDelete={() => setDeleteModal(true)}
        onDownloadSummary={handleDownloadSummary}
        onDownloadReport={handleDownloadReport}
        presence={presence}
      />
      <div className="flex-1 overflow-y-auto px-[22px] py-[18px]">
        <Suspense fallback={<TabSkeleton />}>
          {renderTab()}
        </Suspense>
      </div>

      <Modal
        open={deleteModal}
        title={`Delete ${client.name || 'this client'}?`}
        description="All client data will be permanently removed. This cannot be undone."
        confirmLabel="Delete Client"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
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
