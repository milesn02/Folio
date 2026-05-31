# Verdict — Folio Dieter Rams Audit

## REDESIGN — 19/30

Folio is a uniformly competent product (every principle scores 2) with one structural failure (#10 at 1), and the aggregate ceiling of 2s across all ten principles signals that no dimension is excellent — which means the design needs to be approached from first principles rather than incrementally patched.

**Why redesign, not refine:** The 19/30 total crosses below the 20-point REFINE threshold. More importantly, the pattern behind the score reveals a systemic issue: every dimension is "pretty good" but none is "great." A refine pass optimizes individual elements; a redesign re-asks what each screen is *for* — and the answers reveal structural changes (separating the presentation surface from the editing surface on Snapshot, consolidating the duplicate year-selector pattern, establishing a real error state, moving decorative elements to a single deliberate brand moment).

---

## Highest-leverage moves (top 5)

**1. Principle #2 (Useful) + #5 (Unobtrusive): Separate the Snapshot presentation surface from the editing surface.**
Evidence: Snapshot.tsx:140–330 (Client Information + Entities sections are editing controls visible on the client-facing hero screen). A CPA presenting to a client scrolls down and exposes advisor name, manager, internal rate data, and entity editing fields. Fix: Move Client Information + Entities to a dedicated "Client Settings" panel (gear icon in TopBar), keeping the Snapshot clean for presentation.

**2. Principle #10 (As little design as possible): Collapse three decorative hero band elements into one deliberate brand statement.**
Evidence: Snapshot.tsx:78–90 — noise texture at 0.035 opacity, gold ambient glow, and decorative gold line are three separate layers stacked in the hero band. Together they create interference rather than one clear identity moment. Fix: Choose one signature element (the gold decorative line is strongest — it mirrors the Login page divider); remove the noise texture (it's a dated trend) and ambient glow; apply the saved opacity budget to a single, stronger gold accent.

**3. Principle #8 (Thorough): Implement a network error state for the primary Snapshot surface.**
Evidence: ClientProfile.tsx:127–130 has a Suspense boundary (loading covered) but no error boundary. If Supabase returns an error or network fails, the Snapshot renders empty/stale with no user feedback. Fix: Wrap the tab content in an error boundary that shows a "Could not load client data — retry" state matching the design system (danger-bg, retry button).

**4. Principle #10 (As little design as possible) + #3 (Aesthetic): Consolidate the year-selector into a single reusable component.**
Evidence: TaxSavings.tsx:50–66 manually implements pill buttons; SalarySchedule.tsx:192 and IndividualPayments.tsx:137 use `<SubTabs>`. Three implementations of the same year-picker affordance. Fix: Extend SubTabs to accept a `variant="pills"` prop (or expose the existing behavior) and replace the manual implementation in TaxSavings with a SubTabs call.

**5. Principle #3 (Aesthetic): Move all gradient hex values to named design tokens.**
Evidence: Snapshot.tsx:74, 86, 90, 107, 458 use inline hex values (#1a3f28, #204d31, #265c3a, #1e4830, #142c1d) for gradients. These are intentional color ramps within the navy family but bypass the token system. Fix: Add `navy-dk: '#142c1d'` and `navy-xl: '#0f2318'` to tailwind.config.ts and replace inline gradient hex values with token references.
