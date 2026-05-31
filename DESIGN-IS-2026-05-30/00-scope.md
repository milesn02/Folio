---
audit: Folio — Snapshot Tab (hero screen)
date: 2026-05-30
---

## What is being audited
- **Repo:** c:/Users/miles/folio-app (React 18 + TypeScript + Tailwind 3 + Supabase)
- **Primary surface:** Snapshot tab — Snapshot.tsx, GapAnalysis.tsx, TaxProjectionCard.tsx, plus shared UI: Card.tsx, SubTabs.tsx, Toggle.tsx, TopBar.tsx
- **Secondary surfaces (in scope):** SalarySchedule.tsx, TaxSavings.tsx, IndividualPayments.tsx
- **Out of scope:** Settings page, Login page, Notes drawer, Command palette

## Primary User
CPA advisor at a small-to-mid advisory firm. Uses Folio daily for 6–8 hours. Technically proficient, time-pressured, manages 20–100+ clients.

## Primary Task (two modes)
1. **Working mode** — Review a client's tax savings and payment deadlines before a meeting (Snapshot → Tax Savings → Individual Payments)
2. **Presentation mode** — Open Snapshot with the client in the room to walk through savings, active strategies, and opportunities (GapAnalysis)

## Brand Constraints
- Forest green `#1a3f28` primary, gold `#c8a96e` accent — non-negotiable
- Fonts: DM Serif Display, DM Sans, JetBrains Mono
- Stack: React + TypeScript + Tailwind 3 — no full rebuild

## Reference / Competitors
- Canopy, TaxDome (workflow-heavy practice management)
- Holistiplan (PDF-first client reports)
- Linear, Stripe (design quality benchmarks)
