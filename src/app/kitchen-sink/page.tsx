import type { Metadata } from "next";
import { AppHeader } from "@/components/shell/app-header";
import { OrgCard } from "@/components/org-card";
import { OrgRail } from "@/components/org-rail";
import { CategoryIcon } from "@/components/category-icon";
import { MaaserRing } from "@/components/maaser-ring";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton, SkeletonOrgCard } from "@/components/shell/skeleton";
import { CardProgress, ProgressBar } from "@/components/ui/progress-bar";
import { CATEGORIES } from "@/lib/categories";
import { listOrganizations } from "@/lib/data";

export const metadata: Metadata = {
  title: "Kitchen sink",
  robots: { index: false, follow: false },
};

/**
 * The token gallery. Swatches read their value from the CSS variable at render
 * time rather than repeating a hex literal, so this page cannot drift out of
 * sync with globals.css the way a hand-typed table does.
 */
const SWATCHES: { token: string; note?: string }[] = [
  { token: "blue-900" },
  { token: "blue-700", note: "primary buttons" },
  { token: "blue-500", note: "links, focus rings" },
  { token: "blue-050", note: "tinted surfaces" },
  { token: "bronze-600", note: "bronze type, fill, pills" },
  { token: "bronze-500", note: "verified badge glyph only" },
  { token: "bronze-100", note: "track, surface (ink-900 type)" },
  { token: "ink-900" },
  { token: "ink-600" },
  { token: "ink-300" },
  { token: "ink-050" },
  { token: "success" },
  { token: "warning", note: "stale figures" },
  { token: "danger" },
];

const RADII = [
  { name: "card", note: "cards, buttons" },
  { name: "pill", note: "chips" },
  { name: "sheet", note: "sheets, modals" },
];

export default function KitchenSinkPage() {
  const orgs = listOrganizations({});
  const claimed = orgs.find((o) => o.claimStatus !== "unclaimed");
  const unclaimed = orgs.find((o) => o.claimStatus === "unclaimed");
  const day = 86_400_000;

  return (
    <>
      <AppHeader back title="Kitchen sink" />

      <div className="app space-y-10 py-6">
        <p className="text-sm text-ink-600">
          Every primitive at 390px. Bronze appears on exactly three things — the verified badge,
          progress fill and the maaser ring. Anywhere else is a bug.
        </p>

        <Section title="Colour">
          <ul className="grid grid-cols-2 gap-2">
            {SWATCHES.map((s) => (
              <li key={s.token} className="overflow-hidden rounded-card border border-ink-300">
                <div className="h-10" style={{ background: `var(--color-${s.token})` }} />
                <div className="p-2">
                  <p className="font-mono text-xs font-semibold text-ink-900">{s.token}</p>
                  {s.note && <p className="text-2xs text-ink-600">{s.note}</p>}
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type">
          <div className="space-y-2">
            <p className="font-display text-2xl font-extrabold tracking-tight">26 / 800 org name</p>
            <p className="font-display text-xl font-bold">20 / 700 section header</p>
            <p className="text-lg font-bold">17 / 700 card title</p>
            <p className="text-base font-semibold">16 / 600 campaign title</p>
            <p className="text-sm text-ink-600">14 / 400 meta and description</p>
            <p className="text-xs font-semibold">12 / 600 tile label</p>
            <p className="text-2xs font-semibold uppercase tracking-wide text-ink-600">
              10 / 600 tab label
            </p>
            <p className="tabular text-base font-semibold">$18,000 · $180 · 62% tabular</p>
            <p className="he text-lg" lang="he" dir="rtl">
              שערי צדקה — Frank Ruhl Libre
            </p>
          </div>
        </Section>

        <Section title="Radii">
          <ul className="flex flex-wrap gap-3">
            {RADII.map((r) => (
              <li key={r.name} className="text-center">
                <div
                  className="size-16 border border-ink-300 bg-blue-050"
                  style={{ borderRadius: `var(--radius-${r.name})` }}
                />
                <p className="mt-1 font-mono text-2xs text-ink-600">{r.name}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Buttons and chips">
          <div className="space-y-3">
            <button type="button" className="press h-13 w-full rounded-card bg-blue-700 py-4 font-semibold text-white">
              Primary, full width
            </button>
            <button type="button" className="press h-12 w-full rounded-card border border-ink-300 font-semibold text-blue-700">
              Secondary
            </button>
            <div className="flex flex-wrap gap-2">
              <span className="flex h-9 items-center rounded-pill border border-ink-300 px-3.5 text-sm font-semibold">
                Chip
              </span>
              <span className="flex h-9 items-center rounded-pill border border-blue-700 bg-blue-050 px-3.5 text-sm font-semibold text-blue-900">
                Chip, active
              </span>
              <span className="flex h-9 items-center rounded-pill bg-bronze-600 px-3 text-xs font-bold text-white">
                2x match
              </span>
            </div>
          </div>
        </Section>

        <Section title="Category tiles">
          <ul className="rail bleed py-1">
            {CATEGORIES.slice(0, 8).map((c) => (
              <li key={c.slug} className="w-[72px]">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-blue-050 text-blue-700">
                    <CategoryIcon iconKey={c.iconKey} className="size-6" />
                  </span>
                  <span className="clamp-2 text-xs font-semibold leading-tight">{c.nameEn}</span>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Progress">
          <div className="space-y-4">
            <CardProgress raisedCents={3_100_000} goalCents={5_000_000} updatedAt={new Date(Date.now() - 3 * day).toISOString()} />
            <CardProgress raisedCents={210_000} goalCents={8_000_000} updatedAt={new Date(Date.now() - 88 * day).toISOString()} />
            <ProgressBar raisedCents={1_425_000} goalCents={3_800_000} updatedAt={new Date(Date.now() - 11 * day).toISOString()} />
          </div>
        </Section>

        <Section title="Maaser ring">
          <div className="flex justify-center">
            <MaaserRing givenCents={420_000} obligationCents={1_200_000} size={220} />
          </div>
        </Section>

        <Section title="Organization card — claimed">{claimed && <OrgCard org={claimed} />}</Section>
        <Section title="Organization card — unclaimed">
          {unclaimed && <OrgCard org={unclaimed} />}
        </Section>
        <Section title="Rail">
          <OrgRail orgs={orgs.slice(0, 4)} />
        </Section>

        <Section title="Skeletons">
          <div className="space-y-4">
            <SkeletonOrgCard />
            <Skeleton className="h-11 w-full rounded-pill" />
          </div>
        </Section>

        <Section title="Empty state">
          <EmptyState
            title="Nothing matches those filters"
            body="We would rather show you nothing than pad the page."
          />
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-bold text-ink-900">{title}</h2>
      {children}
    </section>
  );
}
