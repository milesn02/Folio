# Handoff Prompt — Folio REDESIGN Pass

Copy the block below and paste it as your next message.

---

````
/make-plan Redesign Folio's client view. Current design scored 19/30 on a Dieter Rams audit with structural gaps in principles #10 (as little design as possible, score 1), and uniform 2/3 ceilings across all other dimensions.

Verdict paragraph (from audit):
> Folio is a uniformly competent product (every principle scores 2) with one structural failure (#10 at 1), and the aggregate ceiling of 2s across all ten principles signals that no dimension is excellent — which means the design needs to be approached from first principles rather than incrementally patched.

Why redesign and not refine: every principle scored 2 — no dimension is excellent and no dimension failed catastrophically. The REDESIGN pass is not "throw it away"; it is "re-ask what each screen is FOR, then build from that answer." The primary structural problem is that the Snapshot tab conflates two distinct user modes (CPA working mode and client presentation mode) in a single scrollable surface.

Preserve from current design (DO NOT touch):
- Brand tokens: navy #1a3f28, accent gold #c8a96e, surface cream #f2f3ef — tailwind.config.ts:7–48
- Font stack: DM Serif Display (serif), DM Sans (sans), JetBrains Mono (mono)
- Tab architecture: snapshot, salary, payments, entity, tax savings as the primary CPA workflow
- Paycheck Breakdown table treatment: navy header with gold-tinted column labels, navy gradient footer row with gold numbers — SalarySchedule.tsx:314–337
- Tax Savings total row: navy bg + gold serif numbers — TaxSavings.tsx:154–174
- Status vocabulary: Overdue/Scheduled/Paid/Auth/Void with current color mapping
- Count-up animation on savings number — useCountUp.ts

Discard (structural patterns causing the score failures):
- Client Information + Entities editing fields embedded in Snapshot.tsx:140–330. Caused failure on principle #2 (useful) and #5 (unobtrusive): presentation surface has editing chrome below the fold that exposes internal CPA data during client meetings.
- Three stacked decorative hero band elements (noise texture Snapshot.tsx:78–82, ambient glow line 86, gold decorative line line 90). Caused failure on principle #10: three removable decorative layers where one deliberate brand statement would do more.
- Manual year-selector pill implementation in TaxSavings.tsx:50–66 duplicating SubTabs. Caused failure on principle #10: same affordance implemented three different ways across three files.
- Absence of network error state in ClientProfile.tsx. Caused failure on principle #8 (thorough): Supabase failure leaves users with a stale/empty screen and no feedback.
- Inline gradient hex values in Snapshot.tsx:74, 86, 90, 107, 458 bypassing the token system. Caused failure on principle #3 (aesthetic).

Top 5 moves from the audit (implement in this order):

1. Principle #2 (Useful) + #5 (Unobtrusive): Move Client Information + Entities to a dedicated "Client Settings" drawer or modal triggered by a gear/settings icon in the TopBar action area. The Snapshot tab becomes a pure read/presentation surface: hero KPIs, strategy opportunities, strategies table, tax projection — no form fields. This is the single highest-leverage change: it cleans up the presentation surface AND reduces the interactive element count on Snapshot by ~20 elements.

2. Principle #10 (As little design as possible): Collapse the three hero band decorative layers (noise, glow, gold line) into one deliberate brand statement. Keep the gold decorative line at the top (it's the strongest element and mirrors the Login page divider). Remove noise texture and ambient glow. Reallocate the removed visual weight to the gold line's opacity (raise from 55% to 70%).

3. Principle #8 (Thorough): Add an error boundary wrapping the ClientProfile tab content. When the error boundary catches, render: a danger-bg card with "Client data could not be loaded" headline, the Supabase error message (in monospace), and a "Retry" button that clears the error boundary and remounts. File: ClientProfile.tsx:127–130.

4. Principle #10 (As little design as possible) + #3 (Aesthetic): Replace the manual year-pill implementation in TaxSavings.tsx:50–66 with a `<SubTabs>` call using `tabs={yearOptions}`. This makes the year selector pattern identical across SalarySchedule, IndividualPayments, and TaxSavings — one implementation, three surfaces.

5. Principle #3 (Aesthetic): Add `navy-dk: '#142c1d'` and `navy-xl: '#0f2318'` to tailwind.config.ts and replace all inline gradient hex values in Snapshot.tsx (lines 74, 107, 458) with token references. The hero gradient becomes `from-navy to-navy-xl`, the KPI tray gradient becomes `from-navy-md to-navy-dk`.

Redesign principles in priority order:
1. Principle #2 (Useful) — a presentation surface must never contain editing controls; the CPA's workflow and the client's view are distinct modes that should not share screen real estate
2. Principle #10 (As little design as possible) — every element on the Snapshot must earn its place by contributing to either the CPA's understanding or the client's confidence; decoration without function is a sign of insecurity, not quality
3. Principle #8 (Thorough) — a professional advisory tool that silently fails on network errors destroys the trust that the premium visual language is trying to build

Deliverables for the plan:
- Architecture decision: does Client Information become a drawer, a modal, or a dedicated tab? Evaluate against the primary task (CPA needs to edit client info during setup, not during meetings). Recommendation: modal triggered by ✏️ icon in the hero band (opens without leaving Snapshot).
- Error boundary component spec: what data does it display, what recovery options exist, what design tokens does it use
- SubTabs extension spec: does SubTabs need a `variant` prop, or is the existing behavior sufficient for TaxSavings? Check if TaxSavings needs the year selector inside the CardHeader (current position) vs. above the card (SubTabs convention)
- Token addition: navy-dk and navy-xl additions to tailwind.config.ts with migration of all 5 inline usages in Snapshot.tsx
- Regression checklist: verify count-up animation still works, KPI savings card still shows "—" for new clients (not $0), all 16 tests still pass after structural changes

Anti-patterns to guard against (specific to REDESIGN):
- Porting the old Snapshot structure under new styling — the editing sections must move, not be hidden with CSS
- Keeping both the old and new structures behind a feature flag indefinitely — make the move, delete the old code
- Redesigning to follow the Rams audit rather than the CPA's actual workflow — validate the Client Settings modal against how often CPAs edit client info (probably: once at setup, rarely after)
- Treating the Preserve list as optional — the brand tokens, font stack, and tab architecture are the identity of Folio; they do not change in this pass
````
