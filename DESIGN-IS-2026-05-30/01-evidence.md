---
source: 4 subagents (structural, copy/honesty, visual/weight, accessibility)
surface: Folio Snapshot tab + secondary tabs
---

## STRUCTURAL

**Interactive elements (Snapshot tab only — Snapshot.tsx + GapAnalysis.tsx + TaxProjectionCard.tsx):**
- Buttons: Add strategy, status cycle per strategy, remove per strategy, Activate per gap
- Inputs: client info fields (6 inputs, 3 selects), entity modal fields
- Toggles: 1 (TaxSavings)
- Tabs: 8 total in TopBar (5 always visible, 3 conditional: augusta/roth/hsa hidden when strategy inactive)
- Full application interactive count (all sub-tabs): ~78 elements

**Primary task depth:** 0 clicks. Est. Tax Savings KPI is visible immediately on Snapshot load. `Snapshot.tsx:112`

**Nesting depth:** 7 levels max. `Snapshot.tsx:143–150` (Card > CardBody > grid > Field > div > input)

**Repeated patterns (good reuse):** Year-selector pills, status cycle, Auth/Void button pairs, DollarInput ghost variant, SubTabs component, hover state transitions, StatusPill — all consistently reused.

**Empty state coverage:**
- Snapshot strategies list: PRESENT (`Snapshot.tsx:396–397`)
- GapAnalysis: PRESENT — returns null when 0 gaps (`GapAnalysis.tsx:50`)
- TaxSavings: PRESENT (`TaxSavings.tsx:73–79`)
- IndividualPayments: **MISSING** — table renders regardless of data (`IndividualPayments.tsx:136–307`)
- EntityPayments: PRESENT (`EntityPayments.tsx:35–41`)

**Dead props:** 1 — `htmlFor` accepted by Field.tsx but never applied to label element (`Field.tsx:6`)

**Conditional complexity:** 6 ternary expressions + 2 cn() conditional chains in Snapshot.tsx.

---

## VISUAL

**Spacing:** Standard Tailwind 4px base scale throughout. No orphan spacing values.

**Type scale:** 10 sizes defined in token system (`tailwind.config.ts:55–66`). However, Snapshot.tsx uses inline `text-[XXpx]` notation throughout rather than semantic token names — 10 different inline sizes observed. Visual result matches tokens but implementation bypasses them.

**Colors:** 25 named tokens in system. **2 orphan hex values** in Snapshot.tsx not in token system: `#1e4830` and `#142c1d` (both on `Snapshot.tsx:109`, hero band gradient). All other inline colors are token values with opacity modifiers.

**Inline styles:** 6 `style={{ }}` attributes in Snapshot.tsx — all are complex gradients or dynamic JS values that cannot be replaced by Tailwind classes.

**Animations:**
- 10 keyframes defined (7 in tailwind.config.ts, 3 in index.css including `ambient-drift` for login)
- Snapshot.tsx uses: transition-colors (4×), transition-all (2×), transition-opacity (1×)
- Idle animations after 850ms: **0** — count-up finishes, all others are hover-triggered

**States checklist:**
- Empty: PRESENT
- Loading: PRESENT (Suspense fallback)
- Error: **MISSING** — no error boundary or error UI in Snapshot or any sub-tab
- Success: PRESENT
- Focus: PRESENT (`.focus-ring` utility at `index.css:103–105`, Field focus styles)
- Disabled: PRESENT (`Field.tsx:26–33`)

**Dark mode:** NOT implemented. No `darkMode` config, no `dark:` classes on Snapshot surface.

**Bundle weight:** 25 production dependencies including Radix UI (11 packages), TanStack Query, Supabase, React Router, date-fns, lucide-react. Estimated bundle: 200–400KB gzipped (INFERRED, not measured).

**prefers-reduced-motion:** CSS blanket suppression present (`index.css:7–15`), sets all animation/transition to 0.01ms. Does NOT cover `useCountUp`'s requestAnimationFrame loop — JS animation runs regardless of OS preference.

---

## COPY & HONESTY

**Inflation flags (3):**
1. `"Entity owner — retirement plan typically reduces $20k–$60k+ in taxes"` — `GapAnalysis.tsx:21`. Specific financial claim without calculation or confidence range.
2. `"HSA is triple tax-advantaged"` — `GapAnalysis.tsx:36`. Marketing superlative without definition.
3. `"Optimized salary vs. distributions"` — `constants.ts:37`. Vague superlative implying superiority.

**Dark patterns:** NONE.

**Label/behavior mismatches:** NONE. All button labels accurately describe their action.

**Abbreviations unexpanded in UI:**
- `WH` — used in table headers (SalarySchedule.tsx:417, 420; IndividualPayments headers) without expansion. Spelled out in field labels elsewhere (`"Federal withholding — annual"` at `SalarySchedule.tsx:244`). **Inconsistent.**
- `SDI` — expanded once in label (`"CA SDI (%.1f%)"` at `SalarySchedule.tsx:178`), used bare in table headers (`SalarySchedule.tsx:421`). **Partially consistent.**
- `HSA` — never expanded in UI.
- `PTE` — used bare in gap analysis reasoning and entity payment labels (`EntityPayments.tsx:27`).

**Copy inconsistency:**
- "Est. Tax Savings" (Snapshot.tsx:112) vs. "Est. savings from strategies" (TaxProjectionCard.tsx:66–67) — same concept, different phrasing.
- "Federal withholding" (spelled out) vs. "Fed WH" (abbreviated) — same concept, different forms across sections.

---

## ACCESSIBILITY

**ARIA coverage (entire codebase):** 3 aria attributes total.
- `aria-checked="checked"` — `Toggle.tsx:15`
- `aria-label="Remove entity"` — `Snapshot.tsx:279`
- `aria-label="Remove ${STRATEGY_LABELS[k]}"` — `Snapshot.tsx:453`

**Strategy row keyboard access:** NOT REACHABLE. Strategy rows use `<div onClick>` wrapper (`Snapshot.tsx:404–413`). Tab stops on nested buttons only; the row itself has no keyboard activation.

**Focus rings:** PRESENT — `.focus-ring` utility class (`index.css:103–105`), Field focus styles (`Field.tsx:30, 40`), Toggle focus (`Toggle.tsx:20`). Comprehensive coverage.

**Table headers:** All tables use `<th>` elements but WITHOUT `scope` attribute. Applies to IndividualPayments, EntityPayments, SalarySchedule.

**Semantic landmarks:**
- `<aside>` present (`Sidebar.tsx:82`)
- `<nav>` present (`Settings.tsx:148`)
- `<main>` element: **MISSING** across all layout files
- No skip link anywhere in codebase

**WCAG contrast (all pass AA at 4.5:1):**
- text-text on bg-surface: ~19.3:1 ✓
- text-text-lt on bg-white: ~7.6:1 ✓
- text-accent on bg-navy: ~5.5:1 ✓
- text-white on bg-navy: ~11.9:1 ✓
- text-white/40 on bg-navy: ~5.2:1 ✓

**useCountUp motion:** Does NOT check `window.matchMedia('prefers-reduced-motion').matches`. CSS blanket rule suppresses CSS transitions but does not stop the RAF-based count animation in JS.
