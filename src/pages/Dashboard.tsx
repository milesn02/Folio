import { useEffect, useState, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useClients } from '@/hooks/useClients'
import { useClientStore, selectAdvisors } from '@/store/clientStore'
import { AppShell } from '@/components/layout/AppShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { NotesDrawer } from '@/components/layout/NotesDrawer'
import { DeadlineDashboard } from '@/components/layout/DeadlineDashboard'
import { CommandPalette } from '@/components/ui/CommandPalette'
import ClientProfile from './ClientProfile'
import { supabase } from '@/lib/supabase'
import { mkClientData } from '@/lib/factory'

export default function Dashboard() {
  const { user, firm, profile, loading } = useAuth()
  const { setActiveKey, setAdvisorFilter } = useClientStore()
  const advisors = useClientStore(selectAdvisors)
  useClients(firm?.id)
  const { activeKey } = useClientStore()
  const [cmdOpen, setCmdOpen] = useState(false)

  // Auto-filter to the logged-in user if they appear as an advisor on any client
  useEffect(() => {
    if (!profile?.display_name) return
    if (useClientStore.getState().advisorFilter !== '') return
    if (advisors.includes(profile.display_name)) {
      setAdvisorFilter(profile.display_name)
    }
  }, [profile?.display_name, advisors.length])

  // Cmd+K / Ctrl+K opens command palette
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleDownloadSummary = useCallback(() => {
    // ClientProfile handles this — emit a custom event it can catch
    window.dispatchEvent(new CustomEvent('folio:download-summary'))
  }, [])

  const handleDownloadReport = useCallback(() => {
    window.dispatchEvent(new CustomEvent('folio:download-report'))
  }, [])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  async function handleNewClient() {
    if (!firm?.id) return
    const key = 'CLIENT_' + Date.now()
    const data = mkClientData(key)
    const { data: inserted, error } = await supabase
      .from('clients')
      .insert({ firm_id: firm.id, client_key: key, data })
      .select()
      .single()
    if (error) { console.error('Add client error:', error); return }
    useClientStore.setState(s => {
      if (s.clients.find(c => c.id === inserted.id)) return {}
      return { clients: [...s.clients, inserted] }
    })
    setActiveKey(key)
  }

  return (
    <AppShell>
      <Sidebar onNewClient={handleNewClient} />
      {activeKey ? (
        <ClientProfile firmId={firm?.id ?? ''} />
      ) : (
        <DeadlineDashboard
          onSelectClient={key => {
            setActiveKey(key)
            useClientStore.getState().setActiveTab('payments')
          }}
        />
      )}
      <NotesDrawer
        firmId={firm?.id ?? ''}
        user={user}
        displayName={profile?.display_name || user.email?.split('@')[0] || 'You'}
      />
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onNewClient={handleNewClient}
        onDownloadSummary={handleDownloadSummary}
        onDownloadReport={handleDownloadReport}
      />
    </AppShell>
  )
}

