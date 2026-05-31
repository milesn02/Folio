# Evidence — Folio Dieter Rams Audit

## Structural Evidence

**INTERACTIVE_ELEMENT_COUNT:** ~49–55 on Snapshot tab including TopBar.
- TopBar: 15 buttons (9 tab buttons, Notes, Report, Summary, More menu, Delete)
- Snapshot KPI tray: 0 (display only)
- GapAnalysis: up to 4 Activate buttons
- Strategies card: 1 Add + 3 buttons per active strategy (status, Open, Remove)
- Client Information: 13 inputs/selects
- Entities: 7 inputs per entity + 1 Add entity button
- Source: Snapshot.tsx:104–468, TopBar.tsx:73–192

**MAX_NESTING_DEPTH:** 12 levels — ClientProfile → div#client-scroll → Suspense → div[key] → Snapshot → outer div → rounded-xl → hero div → relative content div → h2.
Source: ClientProfile.tsx:117–130, Snapshot.tsx:68–95

**REPEATED_PATTERNS:**
- Year selector pills: SalarySchedule.tsx:192 (SubTabs), IndividualPayments.tsx:137 (SubTabs), TaxSavings.tsx:50–66 (manual pills) — same affordance, 3 different implementations
- Status cycle buttons: Snapshot.tsx:416–430 (strategy status), IndividualPayments.tsx:52–65 (payment status)
- Auth/Void toggle pair: IndividualPayments.tsx:89–97, EntityPayments.tsx:10–18 — identical component defined twice
- Empty state messaging: Snapshot.tsx:396–397, TaxSavings.tsx:73–79, EntityPayments.tsx:34–41

**DEAD_PROPS/UNUSED:**
- `profiles` variable fetched via `useFirmProfiles()` but never rendered — Snapshot.tsx:49
- `useState`, `useEffect`, `useRef` imported but Field component is pure — Field.tsx:1

**TAB_COUNT:** 9 total. Always visible: snapshot, salary, payments, entity, payroll, retirement (6). Conditionally hidden via CSS collapse: augusta (if strat.augusta.y false), roth (backdoor.y false), hsa (health.y false). Source: TopBar.tsx:49–105

**PRIMARY_ACTION_DEPTH:** 0–1 clicks. Snapshot is the default active tab; Est. Tax Savings KPI is the first visible element. If user is on another tab: 1 click. Source: ClientProfile.tsx:103, Snapshot.tsx:112

**EMPTY_STATE_COVERAGE:**
- Snapshot strategies: YES — Snapshot.tsx:396–397 ("No strategies active")
- GapAnalysis: PARTIAL — silent `return null` at GapAnalysis.tsx:50, no designed empty state
- TaxSavings: YES — TaxSavings.tsx:73–79 ("All strategies marked inactive")
- IndividualPayments: NO — no empty state defined
- EntityPayments: YES — EntityPayments.tsx:34–41 ("No entities added yet")

---

## Visual & Weight Evidence

**SPACING_SCALE:** 12 distinct values observed: 2, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 32px. Source: Snapshot.tsx passim, Card.tsx

**TYPE_SCALE:** tailwind.config.ts defines 10 sizes (10–32px). Snapshot.tsx uses: text-[10px], text-[11px], text-[13px], text-[16px], text-[22px], text-[32px], text-[46px] — all inline px bypassing the token scale except text-xs and text-sm. Source: tailwind.config.ts:55–66, Snapshot.tsx passim

**COLOR_COUNT:** 30 named design tokens (tailwind.config.ts:7–48). Inline hex values bypassing the token system in Snapshot.tsx and Login.tsx: #1a3f28, #204d31, #265c3a, #0f2318, #1e4830, #142c1d plus rgba variants for gradients — 10+ inline hex values. Source: Snapshot.tsx:74–110, Login.tsx:32–113

**ANIMATION_COUNT:** 7 keyframe animations defined in tailwind.config.ts (slide-up, fade-in, snap-in, enter, enter-fast, scale-in, shimmer). 2 ambient drift animations in index.css (Login only). 4 CSS transitions in Snapshot.tsx (strategy row, progress bar, hover states). Source: tailwind.config.ts:89–127, index.css:81–89

**STATES CHECKLIST (Snapshot tab):**
- Empty: PRESENT — Snapshot.tsx:396–397
- Loading: PRESENT via Suspense — ClientProfile.tsx:128 (TabSkeleton fallback)
- Error (network): ABSENT — no error boundary or failure state in Snapshot.tsx or ClientProfile.tsx
- Success: PRESENT — Snapshot.tsx:399–462
- Focus rings: PRESENT — index.css:97–99 (focus-ring utility), Field.tsx:30 (focus:ring-2 focus:ring-accent/40)
- Disabled: PRESENT — Field.tsx:32 (disabled:opacity-50 disabled:cursor-not-allowed)

**INLINE_STYLE_COUNT:** 7 `style={{ }}` attributes in Snapshot.tsx: hero gradient (line 74), noise texture (78–82), gold glow (86), gold decorative line (90), KPI grid layout+gradient (107), progress bar width (442), footer gradient (458).

**DEPENDENCY_COUNT:** 24 production dependencies. Notable bundle contributors: @supabase/supabase-js (~150KB), @radix-ui (12 packages ~100KB combined), @tanstack/react-query+virtual, date-fns, lucide-react. Source: package.json

**ANIMATION_ON_IDLE:** After useCountUp completes at 850ms, 0 continuous animations on Snapshot tab. Source: useCountUp.ts:7, Snapshot.tsx:490

**PREFERS_REDUCED_MOTION:** PRESENT — index.css:7–15, global `animation-duration: 0.01ms` and `transition-duration: 0.01ms` override. Comprehensive coverage.

**DARK_MODE:** ABSENT — no darkMode in tailwind.config.ts, no prefers-color-scheme media query in index.css.

---

## Copy & Honesty Evidence

**JARGON_FLAGS (20 terms identified):** PTE (GapAnalysis.tsx:24, EntityPayments.tsx:26), SDI (SalarySchedule.tsx:178), WH used as abbreviation for Withholding (SalarySchedule.tsx:244, 250, 417, 420), SS for Social Security (SalarySchedule.tsx:174, 418), Backdoor Roth (constants.ts:29), SALT (constants.ts:39), HSA (GapAnalysis.tsx:36), Fed (IndividualPayments.tsx:150), Mgr (Snapshot.tsx:118), Deferral (SalarySchedule.tsx:269), Catch-up (SalarySchedule.tsx:285), CA Corp estimate (EntityPayments.tsx:22), Sal. Schedule / Ind. Payments (tab labels — constants.ts:12–13)

**INFLATION_FLAGS:**
- "typically reduces $20k–$60k+" — GapAnalysis.tsx:21. Range-based estimate with open-ended "+" suffix. No source cited. Advisory-facing, not client-facing.
- "triple tax-advantaged" — GapAnalysis.tsx:36. Standard industry descriptor for HSA; factually accurate (deductible, grows tax-free, tax-free withdrawals) but uses superlative framing.

**DARK_PATTERN_FLAGS:** NONE — no forced continuity, hidden costs, confirmshaming, or fake scarcity.

**LABEL_BEHAVIOR_MISMATCHES:** NONE — all buttons describe their action accurately.

**ABBREVIATION_FLAGS:** PTE, SDI, WH, SS, Fed, Mgr, Auth, CA Corp, IRS, NYC — all unexplained inline without tooltip or first-use expansion. Source: multiple files as cited.

---

## Accessibility Evidence

**ARIA_ROLES:**
- `aria-label="Remove entity"` — Snapshot.tsx:279
- `aria-label={Remove ${STRATEGY_LABELS[k]}}` — Snapshot.tsx:453
- `role="switch"`, `aria-checked={checked}` — Toggle.tsx:14–15

**KEYBOARD_REACHABILITY:**
- Add strategy button: REACHABLE — `<button>` at Snapshot.tsx:376–378
- Status cycle: REACHABLE — `<button>` at Snapshot.tsx:416–430
- Remove strategy: REACHABLE — `<button>` at Snapshot.tsx:450–454
- Open strategy panel (clickable row): NOT REACHABLE — `<div onClick>` at Snapshot.tsx:404–413, not keyboard operable

**FOCUS_RINGS:** PRESENT — `focus-visible:ring-2 focus-visible:ring-accent/40` on all form inputs (Field.tsx:30), toggle (Toggle.tsx:20), `.focus-ring` utility (index.css:97–99)

**SEMANTIC HTML:** Correct — IndividualPayments.tsx and EntityPayments.tsx both use `<th>`, `<thead>`, `<tbody>` for tabular payment data (lines 149–159, 73–76 respectively). Tables used for tabular data, not layout.

**CONTRAST_INFERRED:**
- text-text-xs (#6a7a6d) on white: **4.55:1** — PASS WCAG AA ✓
- text-white on bg-navy (#1a3f28): **11.76:1** — PASS WCAG AAA ✓
- text-accent (#c8a96e) on bg-navy: **5.24:1** — PASS WCAG AA ✓
- text-white/40 (~#768c7e blended on navy): **3.26:1** — FAIL WCAG AA ✗

FAIL instance: "Total Est. Tax Savings" label at Snapshot.tsx:459 (`text-white/60`), supporting KPI labels (`text-white/45`), footer labels.

**SKIP_LINK:** ABSENT — no skip-to-main-content link.

**LANDMARK_COUNT:** 1 semantic landmark (`<aside>` — Sidebar.tsx:83). Missing: `<main>` (ClientProfile.tsx:127 uses generic `<div id="client-scroll">`), `<nav>` for TopBar tab list (div of buttons — TopBar.tsx:72), `<header>`. Tab list should be `role="tablist"` with individual `role="tab"` attributes.
