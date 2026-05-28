import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { initials, avatarColor } from '@/lib/utils'

export interface PresenceUser {
  userId: string
  displayName: string
  initials: string
  color: string
}

export function usePresence(clientKey: string | null, myUserId: string | null, myDisplayName: string | null) {
  const [others, setOthers] = useState<PresenceUser[]>([])

  useEffect(() => {
    if (!clientKey || !myUserId || !myDisplayName) {
      setOthers([])
      return
    }

    const channel = supabase.channel(`presence:${clientKey}`, {
      config: { presence: { key: myUserId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ displayName: string }>()
        const users: PresenceUser[] = []
        for (const [userId, presences] of Object.entries(state)) {
          if (userId === myUserId) continue
          const name = presences[0]?.displayName ?? userId
          users.push({
            userId,
            displayName: name,
            initials: initials(name),
            color: avatarColor(name),
          })
        }
        setOthers(users)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ displayName: myDisplayName })
        }
      })

    return () => {
      channel.untrack().then(() => supabase.removeChannel(channel))
    }
  }, [clientKey, myUserId, myDisplayName])

  return others
}
