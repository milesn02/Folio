# Folio Design Intelligence — Master Reference

> This file is the authoritative design standard for Folio. It overrides all generated files,
> generic skills, and general-purpose design advice. Read it before touching any UI.

---

## Who This Is For

A CPA advisory platform has two users with different needs in the same session:

- **The CPA** — working fast, switching between clients, building salary schedules, tracking
  deadlines. Needs density, keyboard nav, and zero ambiguity.
- **The Client** — sitting across the table or on a Zoom call. Sees the Snapshot tab and the
  PDF. Needs clarity, confidence, and a sense that their money is in expert hands.

Every design decision must serve one of these two people. If it serves neither, cut it.

---

## Brand Tokens (Source of Truth)

Never use raw hex or Tailwind color names. Use these tokens only.

| Token | Hex | Role |
|-------|-----|------|
| `navy` / `bg-navy` | `#1a3f28` | Primary brand — sidebar, dark headers, CTA buttons |
| `navy-md` | `#204d31` | Hover state for navy elements |
| `accent` | `#c8a96e` | Gold — totals, active states, key numbers, CTAs only |
| `accent-lt` | `#dfc99a` | Lighter gold — hover states, subtle highlights |
| `surface` | `#f2f3ef` | Page background, input fills |
| `surface-lt` | `#f8f9f6` | Elevated surface, table alternating rows |
| `surface-dk` | `#e8ebe4` | Pressed states, borders |
| `border` | `#d4d8cf` | Default border |
| `border-dk` | `#b8bdb3` | Strong border, table dividers |
| `text` | `#0e1a11` | Primary text |
| `text-md` | `#364039` | Secondary text, card titles |
| `text-lt` | `#4a5c4d` | Supporting text, labels |
| `text-xs` | `#6a7a6d` | Placeholder, disabled, captions |
| `success` | `#1a7a4a` | Filed, paid, active |
| `danger` | `#c0392b` | Overdue, error, void |
| `info` | `#1f4f8a` | Informational states |

**Rules:**
- Forest green (`navy`) is the primary brand color. It is not navy-blue. It is not black.
- Gold (`accent`) is used for: total rows, primary CTAs, active tab indicators, KPI hero numbers.
  It is not used for: decorative borders, background fills, body text.
- Never introduce a new color. If you think you need one, use an existing token at reduced opacity.

---

## Typography

| Font | Token | Use |
|------|-------|-----|
| DM Serif Display | `font-serif` | Client-facing numbers, hero KPIs, client name in Snapshot |
| DM Sans | `font-sans` (default) | All UI text, labels, body, navigation |
| JetBrains Mono | `font-mono` / `font-num` | All financial figures in tables, dollar amounts, percentages |

**Rules:**
- `font-serif` is reserved for numbers and names that appear in client-facing views.
  Never use it for labels, buttons, or form elements.
- `font-num` (JetBrains Mono) must be used on every dollar amount in a table.
  This ensures column alignment and signals precision.
- Labels above form fields: `text-[11px] font-bold uppercase tracking-[.05em] text-text-lt`.
  This is the only acceptable uppercase pattern. Do not apply it to card section headers.
- Card section headers: `text-[13px] font-semibold text-text-md`. Mixed case. Not uppercase.

**Font size scale (Tailwind tokens):**
`2xs` (10px) · `xs` (11px) · `sm` (12px) · `base` (14px) · `md` (15px) ·
`lg` (16px) · `xl` (18px) · `2xl` (22px) · `3xl` (26px) · `4xl` (32px)

---

## Financial Data Rules (Non-Negotiable)

These conventions come from 30+ years of accounting software and CPA workflow standards.
Violating them signals to CPAs that the tool was not built by someone who understands their work.

### Numbers in tables
- **Always right-aligned.** Text is left-aligned. Numbers are right-aligned. No exceptions.
- **Always `font-num` (JetBrains Mono).** Proportional fonts misalign decimal places.
- **Negative values in parentheses, never minus sign.** `(12,450)` not `-12,450`. This is the
  universal accounting convention. It makes negative vs. positive scannable at a glance.
- **Dollar signs belong at the column header, not on every row.** One `$` at the top of the
  column. Repeating it on every cell is noise.
- **Consistent decimal precision per column.** A column showing whole dollars never shows cents.
  A column showing percentages shows one decimal place consistently.
- **Totals rows get visual weight.** Dark background strip (`bg-navy text-white`) or gold accent
  text. Never the same treatment as regular rows.
- **Zero values show as `—` not `$0`.** Empty data looks intentional, not missing.

### Status vocabulary (exact labels only)
| Status | Color | Meaning |
|--------|-------|---------|
| `Filed` | `success` green | Return submitted, done |
| `Paid` | `success` green | Payment confirmed received |
| `Scheduled` | muted sage | Payment set up, will run |
| `Authorized` | `navy` | CPA has approved the payment |
| `Overdue` | `danger` red | Past due date, action required |
| `Pending` | `accent` gold | Waiting on client or third party |
| `Void` | `text-xs` gray | Cancelled, no longer relevant |
| `In Progress` | `info` blue | Active work in progress |

Never invent new status labels. Never use vague words like "Processing" or "Active" without the
above mapping. Every status must map to a color in this table.

### Due dates
- Due dates are primary content, not metadata. They belong in the leftmost or most prominent
  column of any payment table.
- Overdue dates get a red `Overdue` badge immediately beside the date. Not in a tooltip. Not
  in a separate column. Right next to the date where it cannot be missed.
- "N days overdue" is more useful than just "Overdue." Show the number when known.
- Extension dates matter as much as original due dates. When an extension applies, show both
  the original and extended date.

---

## Layout Principles

### The two-zone model
Every screen in Folio has two zones:
1. **Working zone** — where CPAs enter data, set status, configure strategies. Dense. Efficient.
2. **Presentation zone** — where key numbers surface for client conversations. Spacious. High contrast.

The Snapshot tab is 80% presentation zone. The Salary Schedule is 80% working zone.
Never let working-zone clutter bleed into presentation-zone screens.

### Density
Folio is a professional tool used daily. Standard spacing is appropriate. Do not add padding
in the name of "premium feel" if it pushes working data off-screen.

- Table rows: `py-2` to `py-2.5`. Never more.
- Card padding: `p-5`. Never more for data-dense cards.
- Section gaps: `gap-3.5` between cards. Never more.
- The exception: KPI hero cards on Snapshot can breathe more (`p-5` or `p-6`).

### Cards
- All cards: `bg-white border border-border shadow rounded-xl`
- Cards lift off the `bg-surface` (#f2f3ef) page background. The shadow must be perceptible.
- `shadow-sm` is not enough. Use `shadow` minimum.
- Card title headers: `px-5 py-3.5 border-b border-border/60`
- Never nest cards. A card inside a card is a design failure.
- Use `border-l-[3px] border-l-accent` (accent prop) only when the card represents something
  the CPA should act on — a strategy opportunity, an overdue item.

### Tables
- Header row: `bg-navy text-accent/80` for CPA-primary tables (Paycheck Breakdown).
  `bg-surface border-b border-border` for secondary/data tables.
- Alternating rows: optional, use `bg-surface/50` on even rows only when the table has
  more than 6 rows.
- Always `border-t border-border` between rows. Never `border-b` — pick one direction.
- Last row has no border: use `last:border-t-0` or explicit exception.

### Inputs
- Background: `bg-surface` on white cards (creates a recessed "inset" feel).
- Border: `border border-border` (full opacity, never `border-border/80`).
- Focus: `focus:border-accent/70 focus:ring-2 focus:ring-accent/15` — gold ring.
- Never `bg-white` inputs on `bg-white` cards. The input must be distinguishable from the surface.
- Dollar inputs: `$` prefix positioned absolutely, input has `pl-6`.
- Select dropdowns use the same `inputCls` as text inputs. Consistent height, same border.

---

## Component Vocabulary

### Status badges
```
Overdue:    bg-danger-bg text-danger border border-danger-border
Scheduled:  bg-surface-dk text-text-lt border border-border
Filed/Paid: bg-success-bg text-success border border-success-border
Pending:    bg-amber-50 text-amber-700 border border-amber-200
Void:       bg-surface text-text-xs border border-border
```
Always `text-xs font-semibold px-2 py-0.5 rounded-full`.

### Year/period selectors
Use pill buttons, not a dropdown. CPAs switch years frequently during client meetings.
Active year: `bg-navy text-white`. Inactive: `bg-white text-text-lt border border-border`.
Never hide year navigation in a dropdown — it's primary navigation in tax work.

### Toggle/segmented controls (Traditional/Roth, etc.)
Same pill pattern. Active: `bg-navy text-white border-navy`.
Inactive: `bg-white text-text-lt border-border hover:border-navy/30`.

### Auth/Void action buttons
Never single-letter labels ("A", "V"). Use full readable words ("Auth", "Void").
Size: `h-7 px-2.5 text-[11px] font-semibold`. Same pill pattern as toggles.

### Section headers inside cards (CardTitle)
`text-[13px] font-semibold text-text-md` — mixed case, no uppercase, no tracking.
This is the rule. Do not revert to `text-xs uppercase tracking-wider`.

### Form field labels (Field component)
`text-[11px] font-bold uppercase tracking-[.05em] text-text-lt` — stays uppercase.
Form labels are the ONE place uppercase tracking is correct.

---

## The Snapshot Tab (Sacred)

The Snapshot is what CPAs open when a client is in the room. Design it accordingly.

**Non-negotiable rules:**
1. Est. Tax Savings number is the hero. It gets the largest font and most visual weight.
2. KPI cards use `font-serif` for the numbers. These are client-facing figures.
3. The strategies table must show progress bars. Clients understand visual completeness.
4. Strategy opportunities (inactive strategies) are calls-to-action, not just info.
5. Never put editing controls (inputs, dropdowns) in the visible hero zone of the Snapshot.
   Editing controls belong below the fold or in a separate edit state.
6. The dark gradient card for Est. Tax Savings should always use `bg-navy` with gold number.
   This is the design signature. Protect it.

---

## The Salary Schedule (Primary Advisory Tool)

The salary schedule is where CPAs spend the most time. It must be precise and fast.

**Rules:**
1. All dollar amounts: `font-num` (JetBrains Mono), right-aligned.
2. The Paycheck Breakdown table uses `bg-navy` header — it's a formal output, not a data entry form.
3. Net take-home pay row always gets visual weight: `font-bold`, slightly larger font, `bg-surface`.
4. Year comparison (vs. prior year) is a first-class feature. The `↔ vs 2025` button must be
   immediately visible, not buried.
5. The Download Summary button is primary — `bg-navy text-white`. CPAs send this PDF to clients.
6. Catch-up contribution buttons: show the dollar amount inline so CPAs can make the case to clients
   without mental math.

---

## PDF / Export Quality

Every PDF Folio generates is a client deliverable. It reflects the CPA's firm, not just the tool.

**Rules:**
1. Firm name and logo on every page. If no firm name is set, prompt the CPA to add one in Settings.
2. Client name in serif font, large and prominent at the top.
3. All dollar amounts in serif font in PDFs.
4. Disclaimer text at bottom of every page — small, gray, professional.
5. "CONFIDENTIAL" label in gold at the footer.
6. Dark header bar (`#1a3f28`) with gold accent text matches the in-app design.
7. Never use generic gray (#9ca3af) for the firm header. Use the brand green.

---

## Trust Signals (What Makes CPAs Trust the Tool)

From research on Canopy, TaxDome, Holistiplan, and Bloomberg Tax — the patterns that signal
professional credibility to accounting practitioners:

1. **Consistency above everything.** If buttons, borders, and spacing are slightly off in two
   different places, CPAs notice. They are trained to find discrepancies. Zero visual inconsistency.

2. **Last saved state.** CPAs are paranoid about data loss with client records. Visible "saved"
   confirmation after every change. Not a toast that fades — a subtle persistent indicator.

3. **Firm branding integration.** The tool should feel like it belongs to the firm, not to Folio.
   Firm name should appear prominently in the sidebar and on all exported PDFs.

4. **No empty states that look broken.** If a client has no strategies, show a helpful empty state
   with a call to action — not a blank white area. Blank = broken in a CPA's mental model.

5. **Status is never ambiguous.** A CPA must know at a glance: is this filed? is this paid?
   is anything overdue? Status vocabulary (see above) must be consistent across every screen.

6. **Audit-trail thinking.** Show who did what and when. "Last modified by Jared · 2h ago" on
   client records signals that the tool takes accountability seriously.

7. **Data density signals competence.** Tools that show sparse data with lots of whitespace feel
   like demos. A tool showing 8 rows of financial data with proper formatting looks like production
   software. Don't hide data to "clean up" the interface.

---

## Anti-Patterns (Never Do These)

These patterns actively undermine trust with CPAs and financial professionals.

### Data anti-patterns
- ❌ Minus signs for negative numbers. Always use parentheses: `(12,450)`.
- ❌ `$` on every row of a table. Dollar sign at column header only.
- ❌ Center-aligned numbers in table cells. Always right-align.
- ❌ Proportional fonts for financial figures. Always `font-num`.
- ❌ `$0` for empty data. Use `—`.
- ❌ Vague status labels ("Active", "Processing", "N/A"). Use the exact vocabulary above.
- ❌ Hidden year navigation. Year is primary navigation — keep it visible.

### Visual anti-patterns
- ❌ `bg-white` inputs on `bg-white` cards. Inputs must have visible fills.
- ❌ `border-border/70` or `border-border/80`. Full opacity borders only.
- ❌ `shadow-sm` on cards. At minimum `shadow`.
- ❌ Uppercase tracking on card section headers. Mixed case only.
- ❌ `shadow-sm` on cards floating on `bg-surface`. They disappear.
- ❌ Single-letter action buttons ("A", "V"). Use words.
- ❌ Decorative elements that don't carry data. Every pixel earns its place.
- ❌ Gold used for non-semantic decoration. Gold = totals, CTAs, active states. Nothing else.
- ❌ Cards inside cards. Flat hierarchy only.
- ❌ Animations on data tables. Tables are for scanning, not watching.

### Trust anti-patterns
- ❌ Empty states that look broken (blank white areas).
- ❌ No firm branding on client-facing PDFs.
- ❌ Editing controls visible in client presentation screens.
- ❌ Inconsistent status badge colors across screens.
- ❌ Any two buttons that look identical but do different things.

---

## Pre-Delivery Checklist

Before shipping any UI change in Folio:

- [ ] Numbers in tables: right-aligned, `font-num`, parentheses for negatives
- [ ] Status badges: match exact vocabulary and color map above
- [ ] Inputs: `bg-surface` fill, `border-border` full opacity, gold focus ring
- [ ] Cards: `border-border` full opacity, `shadow` minimum
- [ ] Card section headers: `text-[13px] font-semibold text-text-md`, mixed case
- [ ] Form labels: `text-[11px] font-bold uppercase tracking-[.05em] text-text-lt`
- [ ] Gold (`accent`) used only for: totals, CTAs, active states, KPI hero numbers
- [ ] Snapshot tab: no editing controls in the hero zone
- [ ] Any new action buttons: full word labels, never single letters
- [ ] PDFs: firm name, client name, disclaimer, CONFIDENTIAL footer
- [ ] Screenshot the screen before and after. Look at it. Would a CPA trust this?
