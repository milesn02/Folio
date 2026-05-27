import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientStore } from '@/store/clientStore'
import type { ClientData } from '@/lib/types'

const PERSIST_DELAY = 500

export function useClients(firmId: string | undefined) {
  const { setClients } = useClientStore()

  useEffect(() => {
    if (!firmId) return

    supabase
      .from('clients')
      .select('*')
      .eq('firm_id', firmId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setClients(data)
      })

    // Realtime subscription
    const channel = supabase
      .channel(`clients:firm:${firmId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `firm_id=eq.${firmId}`,
      }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          useClientStore.setState(state => {
            const exists = state.clients.findIndex(c => c.id === (payload.new as { id: string }).id)
            if (exists >= 0) {
              const clients = [...state.clients]
              clients[exists] = payload.new as typeof clients[0]
              return { clients }
            }
            return { clients: [...state.clients, payload.new as typeof state.clients[0]] }
          })
        }
        if (payload.eventType === 'DELETE') {
          useClientStore.setState(state => ({
            clients: state.clients.filter(c => c.id !== (payload.old as { id: string }).id),
          }))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [firmId, setClients])
}

/** Returns a debounced persist function for a specific client */
export function usePersist(clientKey: string, firmId: string | undefined) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const persist = useCallback((data: ClientData) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (!firmId) return
      await supabase
        .from('clients')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('client_key', clientKey)
        .eq('firm_id', firmId)
    }, PERSIST_DELAY)
  }, [clientKey, firmId])

  return persist
}
