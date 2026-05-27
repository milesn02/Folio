import { createClient } from '@supabase/supabase-js'
import type { ClientData } from './types'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Typed helpers ─────────────────────────────────────────────

export interface DbClient {
  id: string
  firm_id: string
  client_key: string
  data: ClientData
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface DbProfile {
  id: string
  firm_id: string
  display_name: string
  role: string
  avatar_color: string
  created_at: string
}

export interface DbFirm {
  id: string
  name: string
  slug: string
  plan: string
  created_at: string
}

export interface DbNote {
  id: string
  client_id: string
  firm_id: string
  author_id: string
  category: string
  body: string
  pinned: boolean
  created_at: string
}
