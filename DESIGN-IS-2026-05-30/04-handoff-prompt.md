```
/make-plan Refine Folio Snapshot tab based on a Dieter Rams audit (total 20/30).

Verdict paragraph:
> REFINE — Folio's core information architecture is well-designed (0-click primary task,
> smart conditional tabs, disciplined pattern reuse), but the interface has a concrete
> thoroughness gap (missing error state everywhere, missing IndividualPayments empty state)
> and a hero band that over-decorates at the expense of restraint.

Keep (already strong, do NOT touch in this pass):
- Principle #2 (Useful) scored 3 — 0-click path to Est. Tax Savings (Snapshot.tsx:112),
  strategy-gated conditional tabs (TopBar.tsx:54–56), proactive GapAnalysis surfacing.
  Regression check: grep for `calcSavings` and confirm the KPI renders before any user interaction.
- Principle #3 (Aesthetic) scored 2 — color token system and Tailwind spacing scale are coherent;
  do not introduce new inline hex values or orphan spacing values.

Fix in priority order:

1. Thorough (#8) — Add network error state.
   No error UI exists anywhere in the feature surface. A Supabase fetch failure silently
   leaves users with a blank/stale screen. Add a shared ErrorState component and wire it
   into the Snapshot data load path (and optionally TaxSavings, SalarySchedule, IndividualPayments).
   Evidence: absent from Snapshot.tsx, IndividualPayments.tsx, TaxSavings.tsx, SalarySchedule.tsx.
   Verification step: mock a rejected Supabase response and confirm the error UI renders.

2. Thorough (#8) — Add IndividualPayments empty state.
   When a client has no payment data, table headers render with empty rows and no guidance.
   Add a conditional check matching the EntityPayments pattern (EntityPayments.tsx:35–41):
   if no rows, render a centered message with instructions.
   Evidence: IndividualPayments.tsx:136–307 — no empty condition exists.
   Verification step: open a client with no individual payment rows; confirm message renders.

3. Environmentally Friendly (#9) — Honor prefers-reduced-motion in useCountUp.
   The CSS blanket rule (index.css:7–15) suppresses CSS transitions globally but does NOT
   stop the requestAnimationFrame loop in useCountUp.ts:7–43. Add this check at the top of
   the useEffect: if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
     setValue(target); return; }
   This makes the count-up skip animation for users who have opted out of motion.
   Evidence: useCountUp.ts:7–43 — no matchMedia check.
   Verification step: enable "Reduce Motion" in OS settings; confirm KPI displays final value
   immediately without animation.

4. As Little Design (#10) / Long-lasting (#7) — Reduce hero band to one decorative effect.
   The Snapshot hero band stacks three effects simultaneously:
   - Noise texture overlay (Snapshot.tsx:78–82)
   - Ambient radial glow (Snapshot.tsx:86)
   - Decorative gold line div (Snapshot.tsx:90)
   Remove the ambient glow (Snapshot.tsx:86) and the decorative gold line (Snapshot.tsx:90).
   Keep the gradient background and noise texture — they reinforce premium materiality without
   trend-coding the design. The client name and savings number carry the visual weight.
   Evidence: Snapshot.tsx:78–90.
   Verification step: screenshot the hero band and confirm the client name and KPI tray are
   visually dominant with the remaining texture.

5. Understandable (#4) — Expand abbreviations in SalarySchedule table headers.
   "Fed WH" (SalarySchedule.tsx:417) and "State WH" (SalarySchedule.tsx:420) appear in the
   period breakdown table without expansion, while the same concepts are spelled out in field
   labels above ("Federal withholding — annual" at line 244, "State withholding — annual" at
   line 250). Similarly "SDI" appears bare at line 421 after being expanded at line 178.
   Change table headers to "Withholding" (or "Fed / State") and "CA SDI" consistently.
   Evidence: SalarySchedule.tsx:417–421 vs. SalarySchedule.tsx:244–257.
   Verification step: review the period breakdown table and confirm abbreviations match their
   expanded equivalents above.

Out of scope for this refine pass:
- Dark mode (no design token changes for dark theme)
- Login page redesign
- New features or tabs
- Restyling areas that already scored 2–3 (KPI cards, GapAnalysis, TaxProjectionCard)
- Changing the color palette or typography

Deliverables for the plan:
- ErrorState component with file target, props interface, and wiring location
- IndividualPayments empty condition: exact line to add conditional + message copy
- useCountUp fix: exact 3-line patch with matchMedia check
- Hero band diff: lines 86 and 90 of Snapshot.tsx to remove
- SalarySchedule header strings: exact before/after for lines 417, 420, 421
- Regression checklist for every Keep item above
```
