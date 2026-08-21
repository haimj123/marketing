# Shaare Tzadaka

A free, non-commercial directory of Jewish tzedaka organizations. Delivery-app
mechanics, charity substance.

**We never handle the money and we never take a cut.** Donors browse, filter and
find an organization; they pay it directly through the organization's own rails.
This project is a signpost, not a pipe — which removes payment processing, PCI
scope, money-transmitter analysis, KYC, chargebacks and refund policy from the
build permanently.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000
```

No database, no keys, no services. The app boots against a committed fixture in
`src/data/seed-organizations.json`.

```bash
npm run typecheck      # tsc --noEmit
npm run test:filter    # spot checks for the IRS filter
npm run build
```

> **The fixture is fictional.** Every organization in it is invented and every
> payment handle is a placeholder. A banner says so on every page while it is
> serving. Publishing an invented Zelle address under a real charity's name is
> the one failure this project could not survive, so the sample data does not
> name real organizations at all.

## Seeding from the IRS

This is the cold-start solution, and it is only available *because* the project
is free. The IRS publishes the **Exempt Organizations Business Master File** —
every US tax-exempt organization, with EIN, legal name, address, ruling year,
NTEE classification and income band, updated monthly, free.

```bash
npm run ingest:bmf -- --download       # fetch eo1–eo4 into data/bmf-raw/
npm run ingest:bmf -- --sample 40      # print 40 matches and stop
npm run ingest:bmf                     # write a staged batch, publish nothing
npm run ingest:bmf -- --publish        # replace the live seed file
```

Without `--publish` the run writes `src/data/bmf-import.json` and nothing
reaches the site. That is deliberate: the exit test for this milestone is a
false-positive rate under 5% on a hand-checked sample, and you cannot measure
that on data you have already published.

The filter lives in `scripts/lib/bmf-filter.ts` and works in three passes:

1. **NTEE X30** (Judaism) matches outright.
2. **Name keywords** across the X / B / P / T / E families, because many Jewish
   organizations are classified by function rather than religion. Transliteration
   is the whole difficulty — *yeshiva / yeshivah / yeshivas*, *bais / beis /
   beth* — so the list is broad and matched on word boundaries, which is what
   keeps "torah" out of "Victoria".
3. **Negative keywords** checked first, so a church named for Zion or a
   Messianic organization filed under X30 never reaches the directory.

Organizations not in good standing (BMF `STATUS` other than `01`) are skipped
entirely, so a revoked exemption cannot carry a badge.

Everything imported lands as an **unclaimed stub**: IRS facts only, an
unmistakable unclaimed banner, and **no payment details at all** — we have no
way to know they would be correct. An organization then claims the listing and
adds the parts only it can know.

## Where the data lives

`src/lib/data.ts` is the single seam. Today every read resolves against the seed
file; the signatures are the contract and no page knows which side served it.
`src/db/schema.ts` is the Postgres target — `npm run db:generate` produces
`drizzle/0000_*.sql`, and `drizzle/0001_row_level_security.sql` carries the RLS
policies, search indexes and geo index by hand.

The RLS rule worth stating: **there is no admin SELECT policy on `gifts`,
`giving_list_items`, `favorites` or `donor_profiles`.** Nobody running this site
has any business reading what a person gave or what they earn.

Donor state — maaser settings, ledger, giving list, favorites — currently lives
in `localStorage` via `src/lib/donor-store.tsx`, in the same shape those tables
take. Signing in later is an upload, not a rewrite.

## What is built

| Area | State |
|---|---|
| Design system, tokens, `/kitchen-sink` | Built |
| Home, category listing, filters, sort, pagination | Built |
| Search — typeahead, transliteration synonyms, EIN lookup | Built |
| Near me — geolocation with a manual city fallback | Built |
| Org profile, claimed and unclaimed states | Built |
| Departments, campaigns, staleness rules | Built |
| Payment handoff — copy, deep links, "I've sent it" | Built |
| Giving list and guided give-through | Built |
| Maaser tracker, ring, history, CSV and print statement | Built |
| Claim / removal / abuse request flows | Built, queue is in-memory |
| Admin review queues | Built, shared-token gate |
| SEO — metadata, JSON-LD, sitemap covering every stub, ISR | Built |
| Postgres schema + migrations + RLS | Written, not yet wired |
| Supabase Auth, org portal editors, email | Not built |

Two limitations are load-bearing and are stated in the UI, not only here:

- **Request queues are held in server memory** (`src/lib/request-store.ts`).
  They do not survive a redeploy and are not shared across instances. The flows
  are genuinely wired end to end — a submission reaches a reviewable queue — but
  this is not storage. Do not launch on it.
- **`/admin` is gated by a shared `ADMIN_TOKEN`.** With the variable unset the
  page refuses to render the queues rather than exposing them. A shared token is
  the floor; Supabase Auth plus a role check is the goal.

## Design system

Blue does all the interactive work. White does all the breathing. **Bronze is a
signal, not a second brand colour**: it is allowed on the verification badge,
campaign progress fill and the maaser ring, and nowhere else. `--bronze-500` on
white fails AA below 18px, so bronze type uses `--bronze-600`.

Type is Plus Jakarta Sans for display, Inter for body and UI, Frank Ruhl Libre
for Hebrew — a real Hebrew face, not a Latin one with Hebrew bolted on. Amounts
and progress use tabular figures throughout.

`/kitchen-sink` renders every primitive on one page.

## Things deliberately not built

- **Payment processing.** Permanently out of scope. If it ever changes it is a
  new project with new legal work.
- **Star ratings and reviews.** Public ratings on charities invite lashon hara,
  expose the project to defamation claims it has no revenue to defend, and can
  materially damage a legitimate organization over one bad interaction. The
  replacement is objective signals: verification level, ruling year, budget
  band, named endorsements.
- **A campaign engine.** The 24-hour matching format belongs to people who are
  good at it. The wedge here is discovery plus the maaser tracker.

## Two rules that shape most of the code

**Every self-reported number carries its date.** There is no transaction data
behind any "raised so far" figure — the organization types it in. So
`ProgressBar` refuses to render without an "as reported by the organization, N
days ago" line, campaigns are flagged at 60 days without an update and hidden at
120, and the derivation happens at read time so the rule holds even if the
nightly job has not run.

**Tax status is not a boolean.** Many Jewish charities are Israeli *amutot* with
46א status rather than US 501(c)(3), and US donors reaching them route through
an American "friends of" entity. `taxStatus` models that, every profile prints
the matching deductibility sentence, and an Israeli listing points US donors at
its US partner. Getting this wrong means misrepresenting deductibility, which is
the largest legal exposure left once you stop touching money.

## Before launch

- USPTO TESS search on the name; buy `shaareitzedaka.*` and `shaaretzedakah.*`
  and 301 them to the canonical domain — the transliteration will split search
  traffic otherwise.
- Have a lawyer read `/terms` and `/privacy`; both are marked draft in the UI.
- Replace the in-memory request store and the admin token.
- Geocode the imported listings (a one-time, cacheable batch) so "near me"
  covers the whole directory, not just seeded coordinates.
- Decide the long-term home — a communal organization, an open-source handoff,
  or a small board. With no revenue, sustainability is the top risk, above
  fraud, and it should not be left to future-you.
