# Folio Design System — Master Reference

Tax advisory platform for CPAs. Professional, premium, restrained. Forest green + warm gold.

---

## Brand Identity

**Personality:** Trustworthy, premium, efficient. Feels like a Bloomberg terminal crossed with a boutique accounting firm.
**Never:** Playful, colorful, decorative, consumer-app-like.

---

## Color Tokens

| Token | Hex | Use |
|-------|-----|-----|
| `navy` | `#1a3f28` | Sidebar background, hero cards, dark footers, primary CTA |
| `navy-md` | `#204d31` | Gradients, hover states on dark surfaces |
| `accent` | `#c8a96e` | Gold — brand signature. Active states, key numbers, highlights |
| `accent-dk` | `#a8863e` | Darker gold for text on light backgrounds |
| `surface` | `#f2f3ef` | Page background |
| `surface-lt` | `#f8f9f6` | Card hover background |
| `border` | `#d4d8cf` | Default borders |
| `text` | `#0e1a11` | Primary text |
| `text-lt` | `#6a7a6d` | Secondary/label text |
| `text-xs` | `#9aaa9d` | Tertiary/hint text |
| `success` | `#1a7a4a` | Paid, complete, verified |
| `danger` | `#c0392b` | Overdue, errors |

**Rule:** Never use raw Tailwind colors (amber-400, blue-500, etc.). Always use Folio tokens.

---

## Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| Hero numbers, totals | DM Serif Display | `text-2xl` – `text-4xl` | 400 |
| Page/section headings | DM Serif Display | `text-3xl` | 400 |
| Card labels (uppercase) | DM Sans | `text-xs` | 700 |
| Body / table content | DM Sans | `text-sm` – `text-base` | 400–500 |
| Micro labels | DM Sans | `text-xs` | 600 |
| Monospace numbers | JetBrains Mono | `text-sm` | 400–500 |

**Scale (from tailwind.config.ts):**
`text-2xs` (10px) · `text-xs` (11px) · `text-sm` (12px) · `text-base` (14px) · `text-xl` (18px) · `text-2xl` (22px) · `text-3xl` (26px)

**Rule:** Never use raw pixel sizes like `text-[13px]`. Always use the defined scale.

---

## Spacing

Cards use `p-5` internally. Table cells use `px-5 py-3`. Section gaps use `gap-4`. Consistent.

---

## Cards

```
rounded-xl border border-border/70 bg-white shadow-sm
```

- Standard: `shadow-sm`
- Elevated (modals, hero): `shadow-md`
- Dark variant (totals, hero): `bg-navy` with gradient
- Accent left border: `border-l-[3px] border-l-accent`
- Card header divider: `border-b border-border/60`
- Card total row: `bg-navy rounded-b-xl` with gradient

---

## Status Indicators

**Pattern:** Small colored dot + text. No backgrounds, no borders, no pill shapes.

```
● Considering  — gray dot, text-text-xs
● Committed    — gold dot, text-accent-dk  
● Implementing — green dot, text-navy
● Complete     — green dot, text-success
● Unpaid       — gray dot, text-text-xs
● Scheduled    — gold dot, text-accent-dk
● Paid         — green dot, text-success
```

---

## Inputs

```
rounded-md border border-border/80 bg-white px-3 py-[7px] text-sm
focus:border-accent/70 focus:ring-2 focus:ring-accent/15
```

Dollar inputs: `DollarInput` component — formats with commas on blur.

---

## Sidebar

Dark surface (`bg-navy`). White/transparent text. Frosted inputs (`bg-white/[0.07]`).
Active client: `bg-white/[0.10]`. Hover: `bg-white/[0.05]`.
Status dots: red=overdue, amber=due soon, green=on track.

---

## Animations

- Page/tab transitions: `animate-enter` (spring easing, 28ms)
- Hover transitions: `transition-all duration-150`
- Always respect `prefers-reduced-motion`
- No infinite decorative animations

---

## Components (shadcn/ui installed)

- `Tooltip` — use for all icon-only buttons
- `Popover` — use for dropdown pickers (Add Strategy, etc.)
- `Skeleton` — use for loading states, shaped like the content
- `Select`, `Table`, `Badge` — available, not yet wired everywhere

---

## Anti-patterns

- ❌ `text-[13px]` — use `text-sm`
- ❌ `rounded-b-[10px]` — use `rounded-b-xl`
- ❌ `text-amber-700` — use `text-accent-dk`
- ❌ `bg-green-50` — use `bg-success-bg`
- ❌ Colored pill backgrounds on status indicators — use dot + text
- ❌ `hover:rounded-lg` dynamically — apply fixed radius
- ❌ Raw amber/blue/green Tailwind colors anywhere
