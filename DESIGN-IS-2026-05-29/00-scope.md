# Scope — Folio CPA Advisory Platform

## What is being audited
- **Live URL:** https://folio-xi-topaz.vercel.app/
- **Repo:** c:/Users/miles/folio-app (React 18 + TypeScript + Tailwind 3 + Supabase)
- **Screens in scope:** Login page, Client Snapshot tab (primary), Salary Schedule, Individual Payments, Tax Savings
- **Screens out of scope:** Settings, Invite/Signup, Notes drawer, Command palette

## Primary User
CPA advisor at a small-to-mid advisory firm. Uses the app daily for 6–8 hours. Technically proficient but not a developer. Time-pressured, manages multiple clients.

## Primary Task (two-part)
1. **Working mode:** Review a client's tax savings status and payment deadlines before a client meeting (Snapshot → Tax Savings → Individual Payments)
2. **Presentation mode:** Open the Snapshot tab with the client in the room to walk through savings results and strategy opportunities

## Constraints
- Brand: forest green `#1a3f28` primary, gold `#c8a96e` accent — non-negotiable
- Stack: React + TypeScript + Tailwind 3 — no full rebuild
- Fonts: DM Serif Display, DM Sans, JetBrains Mono
- No external animation library (no framer-motion)

## Reference / Competitors
- Canopy, TaxDome (practice management — more workflow-heavy, less data-visual)
- Holistiplan (client-facing tax reports — PDF-first)
- Linear, Stripe (design quality benchmarks — not competitors)
