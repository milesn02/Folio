---
verdict: REFINE
score: 20/30
no principle scored 0
---

## Verdict

REFINE — Folio's core information architecture is well-designed (0-click primary task, smart conditional tabs, disciplined pattern reuse), but the interface has a concrete thoroughness gap (missing error state everywhere, missing IndividualPayments empty state) and a hero band that over-decorates at the expense of restraint.

## Top 5 Highest-Leverage Moves

1. **Thorough (#8) — Add error state for network failures.** No audited file has an error boundary or error UI. A Supabase fetch failure leaves the user with a blank/stale screen and no feedback. Add one shared error state component and wire it into the Snapshot data load path. Evidence: absent from Snapshot.tsx, IndividualPayments.tsx, TaxSavings.tsx, SalarySchedule.tsx entirely.

2. **Thorough (#8) — Add IndividualPayments empty state.** When a client has no payment data, the table headers render with empty rows and no guidance. A single condition + empty message consistent with EntityPayments.tsx:35–41 would close this gap. Evidence: IndividualPayments.tsx:136–307 — no conditional check.

3. **Environmentally Friendly (#9) — Honor prefers-reduced-motion in useCountUp.** The CSS blanket rule (index.css:7–15) suppresses CSS transitions but does NOT stop the requestAnimationFrame loop in useCountUp.ts. Add `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check at the top of the effect — if true, set value to target immediately and return without scheduling animation. Evidence: useCountUp.ts:7–43.

4. **As Little Design as Possible (#10) / Long-lasting (#7) — Reduce hero band to one decorative effect.** The Snapshot hero band layers three effects: noise texture (Snapshot.tsx:78–82), ambient radial glow (Snapshot.tsx:86), and decorative gold line (Snapshot.tsx:90). Each has some individual purpose but together they add visual noise and trend-code the design. Keep the gradient background and noise texture (they reinforce premium materiality); remove the ambient glow and the decorative gold line. The client name and savings number carry the weight.

5. **Understandable (#4) — Expand abbreviations in table headers.** "Fed WH" and "State WH" in SalarySchedule (lines 417, 420) and "SDI" in the period breakdown (line 421) are unexpanded while the same concepts are spelled out in field labels above (lines 244, 250, 178). Use "Withholding" and "CA SDI" in the headers, or add a tooltip on the abbreviation. Evidence: SalarySchedule.tsx:417–421 vs. SalarySchedule.tsx:244–257.
