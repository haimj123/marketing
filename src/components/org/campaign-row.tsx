"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AddCircleButton } from "./give-actions";
import { OrgImage } from "../org-image";
import { useDonor } from "@/lib/donor-store";
import { formatCompactCents, formatPercent, timeAgo } from "@/lib/format";
import type { Campaign, Organization } from "@/lib/types";

/**
 * The menu item. Text on the left, 88px thumbnail on the right with the add
 * button overlapping its corner.
 *
 * Campaigns carry no image in the data model and the schema is out of scope,
 * so the thumbnail is the deterministic crest keyed on the campaign id — the
 * layout the brief asks for, without inventing a field or a photograph.
 */
export function CampaignRow({
  org,
  campaign,
  status,
  onAdd,
}: {
  org: Organization;
  campaign: Campaign;
  status: Campaign["status"];
  onAdd: () => void;
}) {
  const { givingList } = useDonor();
  const added = givingList.some(
    (i) => i.campaignId === campaign.id && i.status === "pending",
  );
  const pct = campaign.goalCents ? formatPercent(campaign.raisedCents ?? 0, campaign.goalCents) : null;
  const stale = status === "flagged_stale";

  return (
    <div className="flex items-start gap-3 border-b border-ink-300 py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold leading-snug text-ink-900">
          <Link href={`/org/${org.slug}/campaign/${campaign.slug}`} className="press">
            {campaign.title}
          </Link>
        </h3>

        {campaign.description && (
          <p className="clamp-2 mt-1 text-sm text-ink-600">{campaign.description}</p>
        )}

        {campaign.goalCents ? (
          <p className="tabular mt-1.5 text-sm text-ink-900">
            {formatCompactCents(campaign.goalCents)} goal
            <span className="text-ink-600"> · {pct}% raised</span>
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-ink-600">Ongoing — no fixed goal</p>
        )}

        {(campaign.matchMultiplier ?? 0) > 1 && (
          <p className="mt-1 text-sm font-semibold text-bronze-600">
            {campaign.matchMultiplier}x match
            {campaign.matcherName ? ` by ${campaign.matcherName}` : ""}
          </p>
        )}

        {stale && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-warning">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>
              Last updated {timeAgo(campaign.raisedUpdatedAt)}. Check with the organization before
              giving to this one.
            </span>
          </p>
        )}
      </div>

      <div className="relative size-[88px] shrink-0">
        <div className="size-full overflow-hidden rounded-card">
          <OrgImage
            slug={campaign.id}
            name={campaign.title}
            categorySlug={org.categorySlugs[0]}
            size="thumb"
          />
        </div>
        <AddCircleButton
          onClick={onAdd}
          added={added}
          label={`Add ${campaign.title} to your giving list`}
        />
      </div>
    </div>
  );
}
