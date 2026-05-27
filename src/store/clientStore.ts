import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { ClientData } from '@/lib/types'
import type { DbClient } from '@/lib/supabase'

interface ClientStore {
  // List
  clients: DbClient[]
  loading: boolean
  error: string | null

  // Active client
  activeKey: string | null
  activeTab: string
  advisorFilter: string
  searchQuery: string

  // Actions
  setClients: (clients: DbClient[]) => void
  setActiveKey: (key: string | null) => void
  setActiveTab: (tab: string) => void
  setAdvisorFilter: (adv: string) => void
  setSearchQuery: (q: string) => void

  updateClientData: (key: string, data: ClientData) => void
  persistClient: (key: string, firmId: string) => void
}

export const useClientStore = create<ClientStore>((set, get) => ({
  clients: [],
  loading: false,
  error: null,
  activeKey: null,
  activeTab: 'snapshot',
  advisorFilter: '',
  searchQuery: '',

  setClients: (clients) => set({ clients }),
  setActiveKey: (key) => set({ activeKey: key, activeTab: 'snapshot' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAdvisorFilter: (adv) => set({ advisorFilter: adv }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  updateClientData: (key, data) => {
    set(state => ({
      clients: state.clients.map(c =>
        c.client_key === key ? { ...c, data, updated_at: new Date().toISOString() } : c,
      ),
    }))
  },

  persistClient: async (key, firmId) => {
    const { clients } = get()
    const client = clients.find(c => c.client_key === key)
    if (!client) return

    await supabase
      .from('clients')
      .update({ data: client.data, updated_at: new Date().toISOString() })
      .eq('client_key', key)
      .eq('firm_id', firmId)
  },
}))

// Derived selectors
export const selectActiveClient = (state: ClientStore) =>
  state.clients.find(c => c.client_key === state.activeKey) ?? null

export const selectFilteredClients = (state: ClientStore) => {
  const q = state.searchQuery.toLowerCase()
  return state.clients.filter(c => {
    if (state.advisorFilter && c.data.adv !== state.advisorFilter) return false
    if (!q) return true
    const d = c.data
    return (d.name + c.client_key + (d.entities ?? []).map(e => e.name).join('')).toLowerCase().includes(q)
  })
}

export const selectAdvisors = (state: ClientStore): string[] =>
  [...new Set(state.clients.map(c => c.data.adv).filter(Boolean))].sort() as string[]
