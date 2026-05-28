import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { DbProfile, DbFirm } from '@/lib/supabase'
import { setActiveTaxSettings } from '@/lib/constants'

export interface AuthState {
  user: User | null
  session: Session | null
  profile: DbProfile | null
  firm: DbFirm | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null, session: null, profile: null, firm: null, loading: true,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id, session)
      } else {
        setState(s => ({ ...s, loading: false }))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id, session)
      } else {
        setState({ user: null, session: null, profile: null, firm: null, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfile(userId: string, session: Session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    let firm: DbFirm | null = null
    if (profile?.firm_id) {
      const { data } = await supabase
        .from('firms')
        .select('*')
        .eq('id', profile.firm_id)
        .single()
      firm = data
    }

    if (firm?.tax_settings) setActiveTaxSettings(firm.tax_settings)

    setState({
      user: session.user,
      session,
      profile: profile ?? null,
      firm: firm ?? null,
      loading: false,
    })
  }

  return state
}
