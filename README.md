# Folio — CPA Client Portal

Production React + TypeScript application for tax strategy management. Built on Vite, Tailwind CSS, Supabase, Zustand, and TanStack Query.

## Prerequisites

- **Node.js 18+** — [download here](https://nodejs.org)
- **npm 9+** (included with Node.js)
- Existing Supabase project (credentials already in `.env`)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
# → http://localhost:5173

# 3. Run tests
npm test

# 4. Build for production
npm run build
```

## Environment Variables

Copy `.env.example` → `.env` and fill in your values:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/publishable key |
| `VITE_APP_URL` | App URL (for auth redirects) |

The `.env` file in this directory is already pre-populated with the existing project credentials.

## Database Migration

Run the migration SQL once in your Supabase project:

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click Run

This creates: `firms`, `profiles`, `clients`, `client_notes`, `client_activity` tables with full RLS policies.

After migration, create your first firm and update the `profiles` table:
```sql
-- Create your firm
INSERT INTO firms (name, slug, plan) VALUES ('Your Firm Name', 'your-firm', 'pro');

-- Link your user to the firm (replace UUIDs)
UPDATE profiles SET firm_id = '<firm_id>', role = 'owner' WHERE id = '<your_user_id>';
```

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy — `vercel.json` handles SPA routing automatically

## Project Structure

```
src/
  components/
    ui/           # Design system: Button, Card, Field, Badge, Toggle, Avatar, Toast, Modal
    layout/       # Sidebar, TopBar, AppShell
  pages/          # Login, Dashboard, ClientProfile
  features/       # One folder per tab: snapshot, strategies, salary, payments, …
  hooks/          # useAuth, useClients, usePersist
  lib/
    calculations/ # Pure TS financial functions (fully tested)
    types.ts      # All TypeScript types
    constants.ts  # TABS, SKS, SAVS, limits, states
    utils.ts      # fmt, parseDollar, ageInYear, avatarColor
    supabase.ts   # Typed Supabase client
    factory.ts    # mkClientData, mkPayData, etc.
  store/
    clientStore.ts   # Client list + active client (Zustand)
    uiStore.ts       # Sidebar, toasts, notes drawer
  test/
    calculations.test.ts  # Vitest tests for all calculation functions
supabase/
  migrations/
    001_initial_schema.sql
```

## Implementation Status

| Phase | Status |
|---|---|
| Phase 1 — Scaffolding & design system | ✅ Complete |
| Phase 2 — Database schema (SQL) | ✅ Complete |
| Phase 3 — Auth & multi-tenancy | ✅ Auth flow done; invite flow pending |
| Phase 4 — Feature migration | 🔄 Snapshot, Strategies, Tax Savings done; others stubbed |
| Phase 5 — Notes drawer | 🔄 Pending |
| Phase 6 — PDF export | 🔄 Pending |
| Phase 7 — Settings & firm management | 🔄 Pending |
| Phase 8 — Polish & hardening | 🔄 Pending |

## Design Tokens

All design tokens from the prototype are ported to `tailwind.config.ts`:

- Colors: `navy`, `accent`, `surface`, `border`, `text`, `success`, `danger`, `info`
- Typography: `font-serif` (DM Serif Display), `font-sans` (DM Sans), `font-mono` (JetBrains Mono)
- Shadows: `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`
- Animations: `animate-slide-up`, `animate-fade-in`, `animate-snap-in`
