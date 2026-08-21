import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { StaticChip } from "@/components/ui/chip";
import { Card, CardHoverable } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { CategoryCard, CategoryTile } from "@/components/category-tile";
import { VerificationBadge } from "@/components/verification-badge";
import { UnclaimedBanner } from "@/components/unclaimed-banner";
import { OrgCard } from "@/components/org-card";
import { MaaserRing } from "@/components/maaser-ring";
import { CATEGORIES } from "@/lib/categories";
import { listOrganizations } from "@/lib/data";
import { VERIFICATION_ORDER } from "@/lib/types";

export const metadata: Metadata = {
  title: "Kitchen sink",
  robots: { index: false, follow: false },
};

const SWATCHES: { name: string; token: string; note?: string }[] = [
  { name: "blue-900", token: "#062B5C" },
  { name: "blue-700", token: "#0A3D91", note: "primary buttons" },
  { name: "blue-500", token: "#1157C4", note: "links, focus rings" },
  { name: "blue-050", token: "#EDF3FC" },
  { name: "bronze-600", token: "#8C6A34", note: "bronze type ≤16px" },
  { name: "bronze-500", token: "#B08A4F", note: "badge, progress fill" },
  { name: "bronze-100", token: "#F4EADA" },
  { name: "ink-900", token: "#12161C" },
  { name: "ink-600", token: "#5A6472" },
  { name: "ink-300", token: "#C9CFD8" },
  { name: "ink-050", token: "#F5F6F8" },
  { name: "success", token: "#1B7F4E" },
  { name: "warning", token: "#B45309" },
  { name: "danger", token: "#B42318" },
];

export default function KitchenSinkPage() {
  const orgs = listOrganizations({});
  const claimed = orgs.find((o) => o.claimStatus !== "unclaimed");
  const unclaimed = orgs.find((o) => o.claimStatus === "unclaimed");

  return (
    <div className="app max-w-4xl space-y-14 py-10">
      <header>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
          Kitchen sink
        </h1>
        <p className="mt-2 text-ink-600">
          Every primitive on one page. Bronze appears on exactly three things: the verified badge,
          progress fill and the maaser ring. If you find it anywhere else, that is a bug.
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Colour</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SWATCHES.map((s) => (
            <li key={s.name} className="overflow-hidden rounded-card border border-ink-300">
              <div className="h-14" style={{ background: s.token }} />
              <div className="p-2">
                <p className="font-mono text-xs font-semibold text-ink-900">{s.name}</p>
                <p className="font-mono text-xs text-ink-600">{s.token}</p>
                {s.note && <p className="mt-0.5 text-xs text-ink-600">{s.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Type</h2>
        <div className="space-y-3">
          <p className="font-display text-4xl font-extrabold tracking-tight">Hero 48/800</p>
          <p className="font-display text-3xl font-extrabold tracking-tight">Display 36/800</p>
          <p className="font-display text-2xl font-bold">Heading 28/700</p>
          <p className="font-display text-xl font-bold">Section 22/700</p>
          <p className="text-lg font-bold">Card title 18/700</p>
          <p className="text-base">Body 16/400 — Inter, the workhorse.</p>
          <p className="text-sm text-ink-600">Small 14/400 for supporting text.</p>
          <p className="tabular text-lg font-semibold">$18,000 · $180 · 62% — tabular numerals</p>
          <p className="he text-xl" lang="he" dir="rtl">
            שערי צדקה — Frank Ruhl Libre
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg">Primary 48px</Button>
          <Button variant="secondary" size="lg">Secondary</Button>
          <Button variant="ghost" size="lg">Ghost</Button>
          <Button variant="danger" size="lg">Danger</Button>
          <Button disabled size="lg">Disabled</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button>Medium 40px</Button>
          <Button variant="secondary">Medium</Button>
          <ButtonLink href="/kitchen-sink" size="sm">Link as button</ButtonLink>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Chips &amp; badges</h2>
        <div className="flex flex-wrap gap-2">
          <StaticChip>Neutral</StaticChip>
          <StaticChip tone="brand">Brand</StaticChip>
          <StaticChip tone="bronze">Bronze</StaticChip>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {VERIFICATION_ORDER.map((level) => (
            <VerificationBadge key={level} level={level} size="md" asLink={false} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Progress</h2>
        <div className="max-w-md space-y-6">
          <ProgressBar raisedCents={3_100_000} goalCents={5_000_000} updatedAt={new Date(Date.now() - 3 * 86400000).toISOString()} />
          <ProgressBar raisedCents={11_500_000} goalCents={11_500_000} updatedAt={new Date(Date.now() - 30 * 86400000).toISOString()} />
          <ProgressBar raisedCents={210_000} goalCents={8_000_000} updatedAt={new Date(Date.now() - 88 * 86400000).toISOString()} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Maaser ring</h2>
        <div className="flex flex-wrap items-center gap-8">
          <MaaserRing givenCents={420_000} obligationCents={1_200_000} size={200} />
          <MaaserRing givenCents={1_200_000} obligationCents={1_200_000} size={200} />
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Category tiles</h2>
        <ul className="rail pb-2">
          {CATEGORIES.slice(0, 8).map((c) => (
            <li key={c.slug}>
              <CategoryTile category={c} count={4} />
            </li>
          ))}
        </ul>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.slice(0, 2).map((c) => (
            <li key={c.slug}>
              <CategoryCard category={c} count={4} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Cards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-5">
            <h3 className="font-display text-lg font-bold">Flat card</h3>
            <p className="mt-1 text-sm text-ink-600">8px radius, 1px ink-300 border.</p>
          </Card>
          <CardHoverable className="p-5">
            <h3 className="font-display text-lg font-bold">Hoverable</h3>
            <p className="mt-1 text-sm text-ink-600">Lifts on hover, flat at rest.</p>
          </CardHoverable>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Org cards — claimed vs unclaimed</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {claimed && <OrgCard org={claimed} />}
          {unclaimed && <OrgCard org={unclaimed} />}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Unclaimed banner</h2>
        <UnclaimedBanner orgSlug={unclaimed?.slug ?? ""} legalName={unclaimed?.legalName ?? "This organization"} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold">Empty state</h2>
        <EmptyState
          title="Nothing matches those filters"
          body="We would rather show you nothing than pad the page."
          action={<Button>Clear filters</Button>}
        />
      </section>
    </div>
  );
}
