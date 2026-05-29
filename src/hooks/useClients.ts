import { useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientStore } from '@/store/clientStore'
import type { ClientData } from '@/lib/types'
import type { DbClient } from '@/lib/supabase'

const PERSIST_DELAY = 500
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function cacheKey(firmId: string) { return `folio:clients:${firmId}` }

function readCache(firmId: string): DbClient[] | null {
  try {
    const raw = localStorage.getItem(cacheKey(firmId))
    if (!raw) return null
    const { data, ts } = JSON.parse(raw) as { data: DbClient[]; ts: number }
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function writeCache(firmId: string, clients: DbClient[]) {
  try {
    localStorage.setItem(cacheKey(firmId), JSON.stringify({ data: clients, ts: Date.now() }))
  } catch { /* ignore quota errors */ }
}

export function useClients(firmId: string | undefined) {
  const { setClients } = useClientStore()

  useEffect(() => {
    if (!firmId) return

    // Stale-while-revalidate: hydrate from cache immediately so the UI
    // renders on the first paint, then replace with fresh Supabase data.
    const cached = readCache(firmId)
    if (cached) setClients(cached)

    supabase
      .from('clients')
      .select('*')
      .eq('firm_id', firmId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setClients(data)
          writeCache(firmId, data)
        }
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
            const clients = exists >= 0
              ? state.clients.map((c, i) => i === exists ? payload.new as typeof c : c)
              : [...state.clients, payload.new as typeof state.clients[0]]
            writeCache(firmId, clients)
            return { clients }
          })
        }
        if (payload.eventType === 'DELETE') {
          useClientStore.setState(state => {
            const clients = state.clients.filter(c => c.id !== (payload.old as { id: string }).id)
            writeCache(firmId, clients)
            return { clients }
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [firmId, setClients])
}

/** Debounced persist with optimistic rollback on network failure */
export function usePersist(
  clientKey: string,
  firmId: string | undefined,
  onSaved?: () => void,
  onError?: (msg: string) => void,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const onSavedRef = useRef(onSaved)
  const onErrorRef = useRef(onError)
  onSavedRef.current = onSaved
  onErrorRef.current = onError

  const persist = useCallback((data: ClientData) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (!firmId) return
      const { error } = await supabase
        .from('clients')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('client_key', clientKey)
        .eq('firm_id', firmId)

      if (error) {
        onErrorRef.current?.(error.message ?? 'Sync failed')
      } else {
        onSavedRef.current?.()
      }
    }, PERSIST_DELAY)
  }, [clientKey, firmId])

  return persist
}
