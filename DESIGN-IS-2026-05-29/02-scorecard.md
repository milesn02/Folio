# Scorecard — Folio Dieter Rams Audit
**Date:** 2026-05-29
**Total: 19/30**

---

**1. Good design is innovative — Score: 2/3**
Evidence: The "dual-mode" Snapshot tab (CPA working screen + client presentation surface in one) is a pattern absent from direct competitors (Canopy, TaxDome, Holistiplan). The count-up animation on savings, the dark hero band, and the domain-specific KPI hierarchy refreshes the financial dashboard pattern with a clear CPA-workflow improvement.
Justification: Scores 2 because the shell (sidebar + content + tab navigation) reuses the standard SaaS app scaffold; the innovation is in domain application and presentation-mode concept, not in the interaction model itself — which is the anchor for a 3.

---

**2. Good design makes a product useful — Score: 2/3**
Evidence: Primary task completes in 0–1 clicks (ClientProfile.tsx:128; Snapshot.tsx:112 KPI is first visible element). Overdue badges are immediately visible (IndividualPayments.tsx:71–73). Year selector pills require 1 click. However, the Snapshot tab contains Client Information and Entities editing sections (Snapshot.tsx:140–330) — when a CPA uses Snapshot as a client presentation surface, these editing fields (advisor, manager, rates, entity details) are visible below the fold and create a "accidentally scroll to internal notes" failure mode.
Justification: Scores 2 not 3 because the presentation surface has editing controls mixed in — adjacent surfaces add unwanted cognitive steps for the client-meeting use case.

---

**3. Good design is aesthetic — Score: 2/3**
Evidence: The forest green + gold + cream palette is distinctive and consistently applied via 30 named design tokens. DM Serif Display + DM Sans + JetBrains Mono is an intentional, well-executed type stack. The dark hero band with noise texture is premium. However: Snapshot.tsx uses 7 `style={{ }}` attributes with inline hex values (#1a3f28, #204d31, #1e4830, etc.) bypassing the token system; font sizes mix inline px literals (text-[46px], text-[32px], text-[22px]) alongside the config scale — these are real orphan styles.
Justification: Scores 2 not 3 because the inline hex gradient values and inline px font sizes are genuine inconsistencies with the token system, not ≤2 minor deviations.

---

**4. Good design makes a product understandable — Score: 2/3**
Evidence: 20 jargon terms flagged (PTE, SDI, WH, SS, Backdoor Roth, SALT, Deferral, Catch-up, Mgr, CA Corp estimate — 01-evidence.md §Jargon). Zero label/behavior mismatches. Zero dark patterns. However: strategy panel clickable rows use `<div onClick>` (Snapshot.tsx:404–413) with a hover-only "Open →" hint — discovery depends on hovering, not a visible affordance. "Sal. Schedule" and "Ind. Payments" are abbreviated tab labels that require existing domain knowledge.
Justification: Scores 2 not 3 because the strategy row "Open →" affordance is hover-discoverable only (not immediately self-evident), and the tab label abbreviations require prior knowledge — both are ≤ 2 controls needing discovery.

---

**5. Good design is unobtrusive — Score: 2/3**
Evidence: Sidebar collapses (Sidebar.tsx:84–98). TopBar is 52px, thin. Cards use `bg-white` on `bg-surface`, floating without heavy chrome. Data fills the viewport. The dark hero band establishes hierarchy without competing with content below it. The editing sections (Client Information, Entities) below the Snapshot KPI section introduce working-mode chrome into the presentation surface.
Justification: Scores 2 not 3 because the editing controls on Snapshot bleed into the presentation surface — chrome is visible and mostly quiet, but the editing zone below the fold is a real intrusion when a CPA is in client-meeting mode.

---

**6. Good design is honest — Score: 2/3**
Evidence: Zero dark patterns. Zero label/behavior mismatches. Two flagged claims: "typically reduces $20k–$60k+" (GapAnalysis.tsx:21) uses an open-ended "+" and asserts a specific range without citation; "triple tax-advantaged" (GapAnalysis.tsx:36) is standard industry terminology for HSAs (factually accurate: deductible, tax-free growth, tax-free withdrawals). Tie-breaker applied: the "$20k–$60k+" range includes an unbounded "+" suffix that implies upside beyond $60k without qualification.
Justification: Scores 2 not 3 — the unverified range estimate with open-ended "+" is a minor inflation even in advisor-facing copy; a 3 requires every claim to map 1:1 to actual behavior.

---

**7. Good design is long-lasting — Score: 2/3**
Evidence: Forest green + gold + cream is not a trend palette — it's rooted in premium financial services identity (private banking, AmEx). DM Serif Display is contemporary but not fad-dependent. The design avoids neon, heavy skeuomorphism, and excessive shadows. Two dated markers present: noise texture overlay (Snapshot.tsx:78–82, a 2021–2024 trend now beginning to feel self-conscious) and subtle glass morphism on KPI cards (`bg-white/[0.10]` on dark, a 2023–2025 trend).
Justification: Scores 2 not 3 — two moderate trend markers (noise texture, glass background on dark) prevent a long-lasting verdict; the rest of the visual language is durable.

---

**8. Good design is thorough down to the last detail — Score: 2/3**
Evidence: Empty states: 3/5 present (strategies, tax savings, entity payments). Loading: PRESENT via Suspense + TabSkeleton (ClientProfile.tsx:128). Error state for network failures: ABSENT — no error boundary or failure UI in Snapshot.tsx or ClientProfile content area. Focus rings: PRESENT (focus-visible:ring-2 on all inputs and toggles). Disabled: PRESENT. One state missing (network error).
Justification: Scores 2 not 3 — one state missing (error/network failure) is the exact threshold for a 2; the absence means a Supabase outage leaves the CPA staring at a stale/empty screen with no feedback.

---

**9. Good design is environmentally friendly — Score: 2/3**
Evidence: Bundle: estimated 350–500KB gzipped (24 production deps — Supabase ~150KB, Radix 12 packages ~100KB combined, React, TanStack, others). Idle animations: 0 continuous after 850ms count-up. prefers-reduced-motion: PRESENT, comprehensive (index.css:7–15). Dark mode: ABSENT (no prefers-color-scheme). Jargon/cognitive load: 20 unexplained abbreviations add mental overhead.
Justification: Scores 2 not 3 — estimated bundle is <500KB and motion is gated, which satisfies the 2-anchor; absence of dark mode and the cognitive load from unexplained jargon prevent a 3.

---

**10. Good design is as little design as possible — Score: 1/3**
Evidence: Three decorative elements in the hero band serve brand atmosphere but are functionally removable: noise texture (Snapshot.tsx:78–82), gold ambient glow (line 86), decorative gold line at top (line 90). The `profiles` variable fetched but unused (Snapshot.tsx:49) is dead code. Additionally: 6 conditionally-hidden tab buttons remain in the DOM (TopBar.tsx:73–104) adding invisible structure; the TaxSavings year selector manually reimplements pill buttons (TaxSavings.tsx:50–66) instead of reusing SubTabs.
Justification: Scores 1 not 2 — three decorative elements in the hero band are individually removable without breaking any task, and the duplicate year-pill implementation violates DRY at the design level; this meets the 3–5 removable elements threshold for a 1.

---

**TOTAL: 19/30**

| # | Principle | Score |
|---|-----------|-------|
| 1 | Innovative | 2 |
| 2 | Useful | 2 |
| 3 | Aesthetic | 2 |
| 4 | Understandable | 2 |
| 5 | Unobtrusive | 2 |
| 6 | Honest | 2 |
| 7 | Long-lasting | 2 |
| 8 | Thorough | 2 |
| 9 | Environmentally friendly | 2 |
| 10 | As little design as possible | 1 |
| | **TOTAL** | **19/30** |

No principle scored 0. Lowest score: #10 (As little design as possible) at 1.
Verdict trigger: total < 20 → **REDESIGN**
