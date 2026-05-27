-- ─────────────────────────────────────────────────────────────
-- Folio — Initial multi-tenant schema
-- Run this in the Supabase SQL editor or via supabase db push
-- ─────────────────────────────────────────────────────────────

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Firms (top-level tenant) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.firms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'starter'
                CHECK (plan IN ('starter', 'pro', 'enterprise')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.firms ENABLE ROW LEVEL SECURITY;

-- Firm members can read their own firm
CREATE POLICY "firm_members_read_own"
  ON public.firms FOR SELECT
  USING (
    id IN (
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Only owners can update firm settings
CREATE POLICY "firm_owners_update"
  ON public.firms FOR UPDATE
  USING (
    id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ── Profiles (extend auth.users) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  firm_id       UUID REFERENCES public.firms ON DELETE SET NULL,
  display_name  TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'advisor'
                CHECK (role IN ('owner', 'admin', 'advisor', 'readonly')),
  avatar_color  TEXT NOT NULL DEFAULT '#4f46e5',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles in their firm
CREATE POLICY "profiles_read_own_firm"
  ON public.profiles FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ── Clients ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id     UUID REFERENCES public.firms NOT NULL,
  client_key  TEXT UNIQUE NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}',
  created_by  UUID REFERENCES public.profiles ON DELETE SET NULL,
  updated_by  UUID REFERENCES public.profiles ON DELETE SET NULL,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clients_firm_id_idx ON public.clients (firm_id);
CREATE INDEX IF NOT EXISTS clients_deleted_at_idx ON public.clients (deleted_at)
  WHERE deleted_at IS NULL;

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Firm members can read non-deleted clients in their firm
CREATE POLICY "clients_read_own_firm"
  ON public.clients FOR SELECT
  USING (
    deleted_at IS NULL
    AND firm_id IN (
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Advisors can insert/update clients in their firm
CREATE POLICY "clients_write_own_firm"
  ON public.clients FOR INSERT
  WITH CHECK (
    firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'advisor')
    )
  );

CREATE POLICY "clients_update_own_firm"
  ON public.clients FOR UPDATE
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'advisor')
    )
  );

-- Soft delete (admins/owners only)
CREATE POLICY "clients_soft_delete"
  ON public.clients FOR UPDATE
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ── Client Notes ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES public.clients ON DELETE CASCADE,
  firm_id     UUID REFERENCES public.firms NOT NULL,
  author_id   UUID REFERENCES public.profiles ON DELETE SET NULL,
  category    TEXT NOT NULL DEFAULT 'general'
              CHECK (category IN ('general','strategies','payroll','retirement','augusta','roth','hsa')),
  body        TEXT NOT NULL,
  pinned      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notes_client_id_idx ON public.client_notes (client_id);
CREATE INDEX IF NOT EXISTS notes_firm_id_idx   ON public.client_notes (firm_id);

ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_read_own_firm"
  ON public.client_notes FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "notes_insert_own_firm"
  ON public.client_notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND firm_id IN (
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Authors can update/delete their own notes; admins can delete any
CREATE POLICY "notes_update_author"
  ON public.client_notes FOR UPDATE
  USING (author_id = auth.uid());

CREATE POLICY "notes_delete_author_or_admin"
  ON public.client_notes FOR DELETE
  USING (
    author_id = auth.uid()
    OR firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ── Client Activity ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_activity (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES public.clients ON DELETE CASCADE,
  firm_id     UUID REFERENCES public.firms NOT NULL,
  actor_id    UUID REFERENCES public.profiles ON DELETE SET NULL,
  tab         TEXT NOT NULL DEFAULT '',
  action      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_client_id_idx ON public.client_activity (client_id);

ALTER TABLE public.client_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_read_own_firm"
  ON public.client_activity FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "activity_insert_own_firm"
  ON public.client_activity FOR INSERT
  WITH CHECK (
    firm_id IN (
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- ── Auto-create profile on signup ────────────────────────────
-- Run this as a Supabase Database Function + Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_color)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '#4f46e5'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Realtime ─────────────────────────────────────────────────
-- Enable realtime for clients and notes
-- (Run in Supabase Dashboard > Database > Replication, or via CLI)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.client_notes;
