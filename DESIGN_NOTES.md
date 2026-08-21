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

---

## Step 2 — Organization card

Structure is the brief's: image full-bleed with 8px radius on all four corners,
text block beneath at 12px, **no border and no shadow around the card**. That
last part is what makes a feed read as a list rather than a stack of boxes, and
it is the detail most "card" components get wrong.

**The heart sits outside the `<Link>`.** Nesting a button inside an anchor is
invalid HTML and, worse, means a save can also navigate. It is absolutely
positioned over the image instead, and still calls `preventDefault` so a stray
event cannot bubble.

**`CardProgress` is a second component, not a prop.** The full `ProgressBar`
refuses to render without its "as reported by the organization, N days ago"
line — that rule is load-bearing, because none of these figures come from a
transaction. The card has no room for it.

Deviation, and the reasoning: the card shows `62% of $50,000` clean while the
figure is fresh, and appends `· updated 2 months ago` in `--warning` once it is
over 30 days old. A fresh number gets the tight row the brief asks for; a stale
one cannot hide on the browse surface waiting for someone to open the profile.
The full timestamp is in the progressbar's `aria-label` either way.

**Three image states, deliberately different.** A photograph when the
organization has uploaded one; a deterministic crest — initials over a blue
field, category glyph behind — when it is claimed but has not; flat `--ink-050`
with a building glyph when it is unclaimed. The unclaimed plate is quiet on
purpose: an IRS stub should never look as finished as a maintained profile.

**Rail cards drop the category from the meta row.** At 168px, three meta items
truncate mid-word every time. The city survives, because that is what a donor
scans a rail for.

## Step 3 — Home

**The location chip replaces the delivery address**, and the parallel is exact:
local giving is usually the first call, and a food program two towns over is one
you can go and look at yourself.

**The search bar is a link, not an input.** Tapping it opens the search screen,
as a delivery app does. Home stays a server component, and the first tap lands
somewhere built for searching instead of a keyboard covering a feed.

**Filter chips navigate rather than filter in place.** On a delivery app the
chips filter one list. Here the feed is composed of editorial sections, so a
chip takes you to the filtered list on `/search` instead of silently
rearranging the page under your thumb. The filtering is the existing URL-param
path — no new query, no new endpoint. "Near me" needs a location first and says
so rather than failing quietly.

**Rails run full-bleed on purpose.** The clipped last card is the only
affordance telling a thumb the row scrolls; a rail that ends flush inside the
gutter reads as a finished grid.

### Fixed during the step

**Section titles were `<span>`s.** Caught it when a screenshot script could not
find "Browse all" by role. They are `<h2>` now — a screen reader needs the
section list, and a heading that is not a heading is invisible to it.

### Verified

390×844: no horizontal overflow, no console errors, tab bar clear of content.

## Preview harness

`scripts/preview/` builds a shareable single-file preview by capturing the
rendered DOM and stylesheets from a running build — never a hand-maintained
mock, so it cannot drift. Two non-obvious details are documented in its README:
`next/font`'s self-hosted files have to be swapped for Google Fonts, and iframe
link clicks have to be intercepted on the capture phase or the frame navigates
to a URL the capture does not contain and goes blank.
