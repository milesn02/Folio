import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { DbProfile } from '@/lib/supabase'

export function useFirmProfiles(): DbProfile[] {
  const { firm } = useAuth()
  const [profiles, setProfiles] = useState<DbProfile[]>([])

  useEffect(() => {
    if (!firm?.id) return
    supabase
      .from('profiles')
      .select('*')
      .eq('firm_id', firm.id)
      .then(({ data }) => { if (data) setProfiles(data) })
  }, [firm?.id])

  return profiles
}
