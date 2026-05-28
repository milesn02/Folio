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

  async function handleDeleteClient(key: string) {
    if (!firm?.id) return
    await supabase.from('clients').delete().eq('client_key', key).eq('firm_id', firm.id)
    useClientStore.setState(s => ({ clients: s.clients.filter(c => c.client_key !== key) }))
    if (useClientStore.getState().activeKey === key) setActiveKey(null)
  }

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
      <Sidebar onNewClient={handleNewClient} onDeleteClient={handleDeleteClient} />
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
        <div className="w-14 h-14 rounded-2xl bg-navy/6 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-navy/40">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <p className="text-[15px] font-semibold text-text mb-1.5">No client selected</p>
        <p className="text-[13px] text-text-lt">Select a client from the sidebar or add a new one</p>
      </div>
    </div>
  )
}
