import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useClients } from '@/hooks/useClients'
import { useClientStore } from '@/store/clientStore'
import { AppShell } from '@/components/layout/AppShell'
import { Sidebar } from '@/components/layout/Sidebar'
import { NotesDrawer } from '@/components/layout/NotesDrawer'
import ClientProfile from './ClientProfile'
import { supabase } from '@/lib/supabase'
import { mkClientData } from '@/lib/factory'

export default function Dashboard() {
  const { user, firm, profile, loading } = useAuth()
  const { setActiveKey } = useClientStore()
  useClients(firm?.id)
  const { activeKey } = useClientStore()

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
        <EmptyState />
      )}
      <NotesDrawer
        firmId={firm?.id ?? ''}
        user={user}
        displayName={profile?.display_name || user.email?.split('@')[0] || 'You'}
      />
    </AppShell>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="text-6xl mb-5">📋</div>
        <p className="text-[16px] font-semibold text-text mb-1.5">Select a client to view their profile</p>
        <p className="text-[13px] text-text-lt">or create a new one to get started</p>
      </div>
    </div>
  )
}
