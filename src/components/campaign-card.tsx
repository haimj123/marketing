import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";
import { Card } from "./ui/card";
import { ProgressBar } from "./ui/progress-bar";
import { AddToGivingListButton } from "./give-actions";
import { formatDate, timeAgo } from "@/lib/format";
import { effectiveStatus, isEnded } from "@/lib/data";
import { cn } from "@/lib/cn";
import type { Campaign, Organization } from "@/lib/types";

/** The menu item of this product. */
export function CampaignCard({
  org,
  campaign,
  className,
}: {
  org: Organization;
  campaign: Campaign;
  className?: string;
}) {
  const status = effectiveStatus(campaign);
  const ended = isEnded(campaign);
  const matching = (campaign.matchMultiplier ?? 0) > 1 && !ended && status === "active";

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-ink-900">
          <Link href={`/org/${org.slug}/campaign/${campaign.slug}`} className="hover:underline">
            {campaign.title}
          </Link>
        </h3>
        {matching && (
          <span className="rounded-full bg-bronze-100 px-2.5 py-1 text-xs font-bold text-bronze-600">
            {campaign.matchMultiplier}× match
          </span>
        )}
        {status === "complete" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-050 px-2.5 py-1 text-xs font-semibold text-success">
            <CheckCircle2 aria-hidden className="size-3.5" />
            Goal met
          </span>
        )}
      </div>

      {campaign.description && (
        <p className="mt-2 text-sm text-ink-600">{campaign.description}</p>
      )}

      {matching && campaign.matcherName && (
        <p className="mt-2 text-sm text-bronze-600">
          Matched {campaign.matchMultiplier}× by {campaign.matcherName}. The match is the
          organization&rsquo;s arrangement with its sponsor, not ours.
        </p>
      )}

      {campaign.goalCents ? (
        <ProgressBar
          className="mt-4"
          raisedCents={campaign.raisedCents}
          goalCents={campaign.goalCents}
          updatedAt={campaign.raisedUpdatedAt}
        />
      ) : null}

      {campaign.endsAt && !ended && status === "active" && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-600">
          <CalendarClock aria-hidden className="size-4" />
          Closes {formatDate(campaign.endsAt)}
        </p>
      )}

      {status === "flagged_stale" && (
        <p className="mt-3 flex items-start gap-2 rounded-card bg-ink-050 p-3 text-sm text-warning">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            The organization last updated this figure {timeAgo(campaign.raisedUpdatedAt)}
            {campaign.endsAt && ended ? ", and the closing date has passed" : ""}. We flag a
            campaign at 60 days and stop showing it at 120. Check with the organization before
            giving to this one specifically.
          </span>
        </p>
      )}

      {status === "active" && !ended && (
        <div className="mt-4">
          <AddToGivingListButton
            orgSlug={org.slug}
            orgName={org.dba ?? org.legalName}
            campaignId={campaign.id}
            campaignTitle={campaign.title}
            suggestedAmountsCents={campaign.suggestedAmountsCents}
            size="md"
            variant="secondary"
          />
        </div>
      )}
    </Card>
  );
}
