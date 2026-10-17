# HRMS client — design system

How the interface looks and moves. Use these pieces instead of inventing a card, button or header.
Every screen, including the Attendance Report, is on this system.

Sources: the look of Global Autocraft's HRMS (studied, not copied — no text, logo or name of theirs
is used), Anthropic's `frontend-design` skill, the taste-skill `redesign-skill`, Vercel's Web
Interface Guidelines, and the modern-web-guidance `motion` / `visual-effects` guides.

## Colour (the supplied palette)

The palette is `#081A2E` `#0E2A47` `#1F4E6B` `#9FB8C9` `#F2F5F7`; every other value is a tint between
two of those. Tokens live in `src/index.css` (`:root`); Tailwind's `slate-*` scale is pinned to the same
cool greys.

| Token | Value | Use |
|---|---|---|
| `--brand-900` / `--brand-800` | `#081a2e` / `#0e2a47` | dark surfaces: top bar, page banners, hero, sign-in |
| `--brand-600` | `#1f4e6b` | strong fills, dark buttons |
| `--accent` | `#2b6485` | **the one accent**: primary actions, active states, focus rings |
| `--accent-bright` | `#9fb8c9` | the accent on dark surfaces (eyebrows, icons in banners) |
| `--accent-soft` / `--accent-line` | `#e6eef3` / `#cfdce5` | tinted fills and hover borders |
| `--ink` | `#081a2e` | headings |
| `--canvas` / `--canvas-2` | `#f2f5f7` / `#e6ecf1` | page background and inset fills |
| `--line` | `#dce4ea` | hairlines and table rules |

Forms are white: panels and field groups inside a form use `bg-white` with a hairline border, never a
grey fill. Status colours keep their meaning and always come with a tinted background and a text label:
emerald = approved/present, amber = pending/half day, red = rejected/unapproved, slate = cancelled,
sky = holiday.

## Type

- **Inter** for everything; **Instrument Serif** (`font-display`) only for display headlines — the
  dashboard greeting and the sign-in headline — with `gradient-text` italic for one emphasised phrase.
- Page title 22–26px bold on the dark banner; section title 15–16px semibold `--ink`.
- Body 13–14px `slate-600/700`; muted 12–13px `slate-500`. Figures use `tabular-nums`.
- Sentence case. The only tracked capitals are the `eyebrow` section label and table headers.

## Building blocks (`src/Components/Common/PageHeader.jsx`)

- `<PageHeader icon title description actions eyebrow? />` — every screen opens with it: a
  breadcrumb + today's date, then a `smoke-dark` banner with the gold-style `eyebrow` (now sky) section
  label, title, one-line description and the page's actions on the right (they wrap under on phones).
  Inside the banner, `secondaryButton` and `glass-panel` turn to dark glass automatically.
- `segClass` / `segItemClass(active)` — tab rows (segmented control; active = white pill).
- `primaryButton` (sky gradient), `secondaryButton` (white glass), `darkButton` (navy) — 40px.
  Row buttons: same look at `h-8 px-2.5 rounded-lg text-xs`.
- `<Icon className="fa-solid fa-…" />` — inline Phosphor SVG. New icon: `scripts/generate-icons.mjs`.
- `<Pagination>` / `usePagination`, `<PageSkeleton>`.

## Surfaces (utilities in `src/index.css`)

| Class | Use |
|---|---|
| `glass-panel` | standard card: white glass, inner highlight, hairline outline |
| `glass-strong` | dense content: tables, forms, modals |
| `glass` | light chips, bars, small controls |
| `glass-dark` | the top bar and the phone menu |
| `smoke-dark` | dark navy surface with a dot grid and slowly drifting smoke: banners, hero, sign-in |
| `gradient-accent` | sky gradient for the primary action |
| `gradient-brand` | navy gradient for dark tiles |
| `eyebrow` | small tracked label with a leading rule, in `--accent-bright` |

- The canvas itself carries drifting navy/sky light fields (`body::before`) and a moving grain
  (`body::after`); both animate with `transform` only.
- Radius: banners `rounded-[20px]`, panels `rounded-2xl`, controls `rounded-xl`, badges `rounded-md`.
- Tables: light header row (`bg-[#edf1f4]`, 11px bold tracked caps, `slate-500`), rows `hover:bg-[#f2f5f7]/60`.
- Badges: `rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset`. Avatars: rounded squares;
  the account avatar in the top bar is a round sky-gradient disc.
- Inputs: `h-10 rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm focus:ring-2 focus:ring-[#2b6485]`.
- Loading: `skeleton` blocks shaped like the content. Empty states: icon tile + one sentence + next step.

## Motion

- `rise` — entrance (fade + 8px up), on the page header and the first content block only; stagger
  siblings with `style={{ '--i': n }}`.
- `lift` — hover rise, only on clickable cards. `press` — press feedback on buttons and rows.
- Signature moments: the smoke drift, the dashboard clock's blinking colon, the bell's `notif-ring`
  nudge while something is unread, the active nav item's glowing underline, the dashboard figures
  counting up, the light sweep across a primary button on hover.
- Animate transform/opacity/colour only; never `transition: all`. Reduced motion: each animation sets
  `--animation-reduced` (default none); never reintroduce a global `animation-duration` rule.

## Responsive

Every screen works at 390px, 768px and 1440px: no horizontal page scroll, and no list ever scrolls
sideways. Below `md` a table becomes a card list (title + labelled `dl` fields + actions at the
bottom, see `Table` in `src/Components/Pages/Master/ui.jsx`); from `md` the table fits its box —
long values wrap (`[overflow-wrap:anywhere]`), headers wrap until `lg`, row buttons wrap under each
other, and low-value columns are hidden until `lg` / `xl` (`fromLg` / `fromXl` in
`src/Components/Pages/recruitment/ui.js`). Actions stay on the right; hit targets ≥ 40px on touch.
`e2e/responsive.spec.js` enforces the first two. Only non-list strips scroll sideways: segmented tab
rows, the top nav, the progress stepper, chip rows and the exit stage strip.

## Layout

One container for every screen, in `PageLayout`'s `<main>`: `max-w-[1400px]`, `px-4 md:px-6`,
`py-6`. Screens never add their own width or gutters; they open with `PageHeader` and stack content
with `space-y`/`mt`. Each top-level section rises in on route change (`page-enter`).

## Testing

`npm run test:e2e` — Playwright in `e2e/` using the installed Chrome.
Env: `HRMS_TEST_ID`, `HRMS_TEST_PASSWORD`; `SHOTS_DIR` saves screenshots.
