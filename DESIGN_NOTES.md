# Design notes — Uber Eats mobile redesign

A running record of decisions, deviations, and things noticed but left alone.
Newest step at the bottom.

**Scope rule for this whole effort:** presentation layer only. No changes to
`src/lib/`, the API routes under `src/app/api/`, the Drizzle schema, or the BMF
ingest pipeline. Where a component wanted data that does not exist, it is
listed under "Deviations" rather than solved by widening a type.

---

## Approved defaults

Five open questions were raised in the audit and resolved as follows.

| # | Question | Resolution |
|---|---|---|
| 1 | Campaign rows need an 88×88 image; `Campaign` has no image field | Render the deterministic crest (campaign id + org category glyph). No schema change, nothing fabricated. |
| 2 | Zero organizations have a hero image | Proceed on crests, invest in making them good. Recorded as a launch-quality note, not a blocker. |
| 3 | Tab bar needs `/categories` and `/account`, neither exists | Build both as presentation-only screens. `/account` is a hub, honest that sign-in does not exist yet. |
| 4 | Location chip needs a donor city; nothing stores one | Add `city` to the localStorage donor store. Client state only — `donor_profiles.city` in Postgres stays untouched. |
| 5 | "Show 47 results" cannot update live without an API change | Filters apply on toggle. The count is always the real server count; the sheet button closes the sheet. |

Confirmed consequence: **the desktop layout is deleted.** The persistent filter
sidebar, multi-column grids and 1280px page are gone. Desktop is the mobile
column centred.

---

## Step 0 — Tokens

**Rename, not re-value.** The palette already held these exact hexes under
`--color-brand-*`. Everything is now `--color-blue-*` as specified. No colour
changed value; ~40 files changed class names.

**`--warning` kept, though it is not in the brief's list.** The stale-campaign
state (a figure the organization has not updated in 60 days) needs a colour that
is neither success nor danger. Using `--danger` there would tell a donor an
organization is untrustworthy when the truth is only that a number is old.

**Two hex literals survive, deliberately.**
- `layout.tsx` `themeColor` — Next's metadata API serialises to a `<meta>` tag
  and cannot read a CSS variable.
- `/kitchen-sink` swatch table — it is the token gallery. It now reads the
  computed value from the CSS variable and prints it, so it cannot drift.

**Press feedback is a CSS class, not a component.** `.press` gives
`scale(0.97)` on `:active` with a 120ms ease-out. Done in CSS rather than a
React wrapper so that server components get it too, no hydration, no JS on the
critical path. It is nulled inside the `prefers-reduced-motion` block.

**Type scale is now the brief's px values**, mapped onto the usual Tailwind
names so class names stay readable: `text-2xs` 10 (tab labels), `xs` 12 (tile
labels), `sm` 14 (meta), `base` 16 (campaign titles), `lg` 17 (card titles),
`xl` 20 (section headers), `2xl` 26 (organization names), `3xl` 32.

**Container is 480px.** "Desktop is a centered max-width column" taken
literally. Wider starts to look like a website again and the card proportions
stop reading as Uber Eats.

---

## Step 1 — Shell

**`SiteHeader` and `GivingListBadge` deleted.** The old header carried a
wordmark, a desktop search field and two nav links — all of it is now either the
tab bar or a per-screen header. The giving-list count moved onto the Giving tab
as a badge.

**`AppHeader` is one component with three slots** (`left`, `title`, `right`)
rather than a header per screen. Hide-on-scroll-down / reveal-on-scroll-up lives
in it once. Screens that want no header simply do not render it — the
organization profile is the only one, because its hero is full-bleed with
floating controls over it.

**The tab bar reserves its own space.** `<main>` carries bottom padding equal to
the bar plus the safe-area inset, so a fixed bar never covers the last card.
Toasts read the same variable and sit above it.

**Active tab is colour plus fill, not a second icon set.** Lucide ships outline
icons only; rather than hand-draw filled twins, the active tab fills the glyph
with `--blue-050` under a `--blue-700` stroke. Reads as filled at 24px, stays
one icon set.

**`/categories` and `/account` created now, not in their later steps**, because
a tab bar that 404s is worse than an unpolished screen. Both get their real pass
in steps 6 and 7.

**The footer moved to `/account`.** A site footer under every screen is a
website pattern, not an app one. Legal and organization links live on Account,
which is where an app puts them.

### Noticed, out of scope

- `src/components/ui/card.tsx` is now used by two components and both override
  most of it. Likely collapses into nothing by step 8; leaving it until then.
- The demo-data banner is honest and necessary but it is 3 lines tall at 390px
  and pushes the fold down. Worth shortening to one line before launch.

### Fixed during the step

**The Account tab's filled glyph rendered as a blank disc.** `CircleUserRound`
paints its enclosing circle last, so filling the icon covered the person
inside. Swapped to `UserRound`, which has no enclosing circle and fills into a
clean silhouette. The lesson generalises: with the fill trick, every icon has to
be checked *filled*, not just outlined. Verified all five — house keeps its
door, the grid squares fill cleanly, the magnifier reads as a tinted lens, the
hand-heart holds up.

### Verified

390×844, all five tabs: no horizontal overflow, no console errors, the fixed
bar never covers content, active state correct on each tab.
