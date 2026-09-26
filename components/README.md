# Deevi component & design guide

This is the map a developer needs to keep building Deevi without re-inventing UI.
The visual system ("Reliable Service Fabric") is defined **once** in design tokens;
components consume the tokens; pages compose components. Restyle the tokens, not
the components; compose components, don't re-write markup.

```
Tokens (app/globals.css)  →  UI primitives (components/ui)  →  Patterns  →  Shells  →  Pages
```

## 1. Design tokens — `app/globals.css`

All colour, type, radius, shadow live in the `@theme` block. Change them there and
the whole app follows. Key tokens (Tailwind utility in brackets):

| Token | Value | Utility | Use |
| --- | --- | --- | --- |
| `--color-brand-600` | `#1b47d6` | `bg-brand-600` `text-brand-600` | primary actions, links, active nav |
| `--color-brand-700` | `#1738ac` | `hover:bg-brand-700` | hover / pressed |
| `--color-brand-50/100` | washes | `bg-brand-50` | selected chips, tints, message bubbles |
| `--color-brand-950` | `#0030ad` | gradient stop | feature-card gradients |
| `--color-ink` | `#0b1220` | `text-ink` | headings, strong text |
| `--color-ink-soft` | `#354152` | `text-ink-soft` | body copy |
| `--color-muted` | `#6b7688` | `text-muted` | captions, placeholders |
| `--color-line` | `#e6e9ef` | `border-line` | hairline borders |
| `--color-surface` | `#ffffff` | `bg-surface` | cards, sheets |
| `--color-canvas` | `#f8f9ff` | `bg-canvas` | app background |
| `--color-warn-500` | `#f5820b` | `bg-warn-500` | **urgency only** |
| `--color-success-600` | `#067647` | `text-success-600` | completed / verified |
| `--color-danger-600` | `#d22d20` | `text-danger-600` | errors / destructive |

- **Radii:** `rounded-card` (12px) for cards, `rounded-control` (10px) for buttons/inputs, `rounded-full` for pills.
- **Shadows:** `shadow-card` (resting), `shadow-pop` (hover), `shadow-float` (menus), `shadow-modal`.
- **Type:** Geist = display (`font-display`, applied to `h1–h4` automatically), Inter = body (default). `.eyebrow` = the small uppercase label above page titles. `.tnum` = tabular figures for money/metrics.

## 2. UI primitives — `components/ui/`

| Component | File | Notes |
| --- | --- | --- |
| `Button`, `LinkButton` | `Button.tsx` | variants: `primary` `secondary` `subtle` `ghost` `danger` `warn`; sizes `sm/md/lg`; `loading`, `fullWidth` |
| `Card` | `primitives.tsx` | resting elevation; `interactive` adds hover lift |
| `Badge`, `Avatar`, `VerifiedTick`, `VerifiedPill` | `primitives.tsx` | |
| `Field`, `Input`, `Textarea`, `Select` | `primitives.tsx` | 44px controls, brand focus glow; `Field` gives label + hint/error |
| `Toggle` | `Toggle.tsx` | iOS switch |
| `Spinner` | `Spinner.tsx` | |
| `Modal` | `Modal.tsx` | mobile bottom-sheet → desktop centered |
| `ConfirmDialog` | `ConfirmDialog.tsx` | confirm + optional reason field |
| `Pagination` | `Pagination.tsx` | drives `usePaginated` |
| Status badges: `JobStatusBadge`, `ApplicationStatusBadge`, `VerificationBadge`, `UrgencyBadge` | `bits.tsx` | tones come from `lib/format.ts` |
| `Stars`, `StarInput` | `bits.tsx` | display + input rating |
| `BackLink`, `PageHeader`, `Segmented` | `bits.tsx` | |
| Icons | `icons.tsx` | thin line-icon set, `<IconName size={} className={} />` |

### States — `components/ui/states.tsx`
Every data screen should route through these: `Loading`, `EmptyState`, `ErrorState`,
`Skeleton`/`SkeletonCard`/`SkeletonList`, and `AsyncBoundary` (loading→error→empty→content
in one wrapper). Pair with `useAsync` / `usePaginated` from `lib/hooks.ts`.

## 3. Patterns — `components/ui/patterns.tsx`

Higher-level layout blocks that recur in the Stitch design. Prefer these over ad-hoc markup:

- `WorkspaceHeader` — eyebrow + big display title + description + actions (the page header on every workspace screen).
- `SectionCard` — a card with an icon + title + description header and a body slot.
- `StatTile` — big number + label (dashboards, summaries).
- `FeatureCard` — the deep-blue promotional panel (white text).
- `Stepper` — horizontal numbered steps (`steps`, `current`).
- `StickyActionBar` — pinned footer with a note + action buttons (wizards, settings).
- `RailLayout` / `RightRail` — main content + right rail on desktop, stacks on mobile.

**Example — a standard workspace screen:**

```tsx
<WorkspaceHeader eyebrow="Live Activity" title="Notifications" description="…" actions={<Button size="sm">Mark all read</Button>} />
<RailLayout rail={<SectionCard title="Summary">…</SectionCard>}>
  <SectionCard icon={<IconBriefcase size={18} />} title="Details">…</SectionCard>
</RailLayout>
```

## 4. Shells — `components/layout/`

- `AppShell` — customer & artisan workspace: desktop left sidebar (brand + grouped
  nav + pinned user card) + content top bar; mobile bottom tab nav. Configured per
  role in `app/(customer)/layout.tsx` and `app/artisan/layout.tsx` via the `nav`,
  `roleLabel`, `sectionLabel`, `exactHref`, `topbar` props.
- `AdminShell` — the operations console (denser sidebar, mobile tab strip).
- `Guard` — client role gate (UX only; the backend authorises every request).

Because every page renders inside a shell and uses the primitives above, changing a
token or a primitive restyles the whole app. Adding a screen = new folder under the
right route group + compose `WorkspaceHeader` / `SectionCard` / `RailLayout`.

## 5. Data & logic (do not restyle these)

UI is fully separated from data. Never call `fetch` from a component — use the typed
clients in `lib/api/index.ts` (`jobsApi`, `applicationsApi`, …) through `useAsync` /
`usePaginated`, and turn errors into copy with `messageFor` (`lib/errors.ts`). Auth is
`useAuth()` (`lib/auth/context.tsx`). Money/dates/status tones are in `lib/format.ts`.

## Scope note

Most of the app is wired to the real backend. Some Stitch mockups show features the
backend does not implement (escrow, wallet, payouts, milestone settlement, GPS radar,
emergency-dispatch surge, Deevi Shield insurance) — dormant features.

Two of these were built at the owner's request as **demo screens with fabricated data**:
`/artisan/wallet` and `/saved-artisans`. Their placeholder data lives isolated in
`lib/mocks/` (`wallet.ts`, `savedArtisans.ts`) — delete those files and the pages to
remove them, or swap the mock import for a real API client when the endpoints ship.
Both carry a **"Demo data"** badge and their money/booking actions show a "preview —
not enabled" toast instead of faking a successful transaction. Everywhere else the app
matches the Stitch *visual language* against real data and does not fake flows.
