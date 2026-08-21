import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { CardProgress } from "./ui/progress-bar";
import { FavoriteHeart } from "./favorite-heart";
import { OrgImage } from "./org-image";
import { categoryName } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { OrgListItem } from "@/lib/data";

/**
 * The store card, in charity form. Image full-bleed with 8px radius on all
 * four corners, text block beneath it — no border and no shadow around the
 * card itself, which is what makes a feed of these read as a list rather than
 * a stack of boxes.
 *
 * An unclaimed listing is deliberately quieter: flat grey plate instead of a
 * crest, an "Unclaimed" pill where the promo pill would go, no progress bar
 * and no heart. Nobody should be able to mistake an IRS record for a profile
 * somebody maintains.
 */
export function OrgCard({
  org,
  variant = "feed",
  showDistance,
  className,
}: {
  org: OrgListItem;
  variant?: "feed" | "rail";
  showDistance?: boolean;
  className?: string;
}) {
  const name = org.dba ?? org.legalName;
  const unclaimed = org.claimStatus === "unclaimed";
  const campaign = unclaimed ? undefined : org.leadCampaign;
  const matching = (campaign?.matchMultiplier ?? 0) > 1;
  const verified = org.verificationLevel === "claim_verified" || org.verificationLevel === "endorsed";

  // A 168px rail card cannot hold three meta items without truncating
  // mid-word, so the category is dropped there and the city kept — the city is
  // what a donor actually scans a rail for.
  const meta = [
    showDistance && org.distanceMiles != null ? `${org.distanceMiles.toFixed(1)} mi` : null,
    [org.city, org.region].filter(Boolean).join(", ") || null,
    variant === "feed" && org.categorySlugs[0] ? categoryName(org.categorySlugs[0]) : null,
  ].filter(Boolean);

  return (
    <article className={cn("relative", className)}>
      <Link href={`/org/${org.slug}`} className="press block">
        <div className="relative aspect-video w-full overflow-hidden rounded-card">
          <OrgImage
            slug={org.slug}
            name={name}
            heroUrl={org.heroUrl}
            categorySlug={org.categorySlugs[0]}
            unclaimed={unclaimed}
            size={variant === "rail" ? "rail" : "card"}
          />

          {matching && (
            <span className="absolute bottom-2 left-2 rounded-pill bg-bronze-600 px-2 py-1 text-xs font-bold leading-none text-white">
              {campaign?.matchMultiplier}x match
            </span>
          )}

          {unclaimed && (
            <span className="absolute bottom-2 left-2 rounded-pill bg-white/95 px-2 py-1 text-xs font-semibold leading-none text-ink-600">
              Unclaimed
            </span>
          )}
        </div>

        <div className="pt-3">
          <h3 className="truncate text-lg font-bold leading-tight text-ink-900">{name}</h3>

          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-600">
            {verified && (
              <>
                <BadgeCheck
                  aria-label="Verified"
                  className="size-4 shrink-0 text-bronze-500"
                  strokeWidth={2}
                />
                <span className="shrink-0">Verified</span>
                <span aria-hidden className="shrink-0">
                  ·
                </span>
              </>
            )}
            <span className="truncate">{meta.join(" · ")}</span>
          </p>

          {campaign?.goalCents ? (
            <CardProgress
              className="mt-1.5"
              raisedCents={campaign.raisedCents}
              goalCents={campaign.goalCents}
              updatedAt={campaign.raisedUpdatedAt}
            />
          ) : null}
        </div>
      </Link>

      {/* Outside the Link, so the heart is not a nested interactive element. */}
      {!unclaimed && (
        <FavoriteHeart orgSlug={org.slug} orgName={name} className="absolute right-2 top-2" />
      )}
    </article>
  );
}
