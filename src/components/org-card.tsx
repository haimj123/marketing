import Link from "next/link";
import { MapPin } from "lucide-react";
import { CardHoverable } from "./ui/card";
import { StaticChip } from "./ui/chip";
import { ProgressBar } from "./ui/progress-bar";
import { VerificationBadge } from "./verification-badge";
import { OrgImage } from "./org-image";
import { categoryName } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { OrgListItem } from "@/lib/data";

/**
 * The restaurant card of this product: hero, name, verification, category
 * chips, city, and the lead campaign's progress. An unclaimed stub is
 * deliberately quieter — muted crest, no progress, an explicit unclaimed
 * line — so that nobody mistakes an IRS record for a completed profile.
 */
export function OrgCard({
  org,
  className,
  showDistance,
}: {
  org: OrgListItem;
  className?: string;
  showDistance?: boolean;
}) {
  const unclaimed = org.claimStatus === "unclaimed";
  const campaign = org.leadCampaign;
  const matching = (campaign?.matchMultiplier ?? 0) > 1;

  return (
    <CardHoverable className={cn("group overflow-hidden", className)}>
      <Link href={`/org/${org.slug}`} className="block focus-visible:outline-none">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-[8px]">
          <OrgImage
            slug={org.slug}
            name={org.dba ?? org.legalName}
            heroUrl={org.heroUrl}
            categorySlug={org.categorySlugs[0]}
            className={unclaimed ? "opacity-45 saturate-50" : undefined}
          />
          {matching && (
            <span className="absolute left-2 top-2 rounded-full bg-bronze-500 px-2.5 py-1 text-xs font-bold text-white">
              {campaign?.matchMultiplier}× match
            </span>
          )}
          {unclaimed && (
            <span className="absolute inset-x-2 bottom-2 rounded-[6px] bg-white/95 px-2 py-1 text-center text-xs font-semibold text-ink-600">
              Unclaimed listing
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold leading-snug text-ink-900 line-clamp-2-safe">
              {org.dba ?? org.legalName}
            </h3>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <VerificationBadge level={org.verificationLevel} asLink={false} />
            {org.categorySlugs.slice(0, 2).map((slug) => (
              <StaticChip key={slug}>{categoryName(slug)}</StaticChip>
            ))}
          </div>

          {(org.city || org.distanceMiles != null) && (
            <p className="mt-2 flex items-center gap-1 text-sm text-ink-600">
              <MapPin aria-hidden className="size-3.5" />
              {[org.city, org.region].filter(Boolean).join(", ")}
              {showDistance && org.distanceMiles != null && (
                <span className="tabular"> · {org.distanceMiles.toFixed(1)} mi</span>
              )}
            </p>
          )}

          {org.tagline && !unclaimed && (
            <p className="mt-2 text-sm text-ink-600 line-clamp-2-safe">{org.tagline}</p>
          )}

          {campaign?.goalCents ? (
            <div className="mt-3 border-t border-ink-050 pt-3">
              <p className="mb-2 text-sm font-semibold text-ink-900 line-clamp-2-safe">
                {campaign.title}
              </p>
              <ProgressBar
                raisedCents={campaign.raisedCents}
                goalCents={campaign.goalCents}
                updatedAt={campaign.raisedUpdatedAt}
              />
            </div>
          ) : null}
        </div>
      </Link>
    </CardHoverable>
  );
}
