"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { AddToListSheet } from "./give-actions";
import { PaymentMethods } from "./payment-card";
import { GivingBar } from "./giving-bar";
import { formatCompactCents, formatDate, formatPercent, timeAgo } from "@/lib/format";
import type { Campaign, Organization } from "@/lib/types";

export function CampaignScreen({
  org,
  campaign,
  closed,
  departmentName,
}: {
  org: Organization;
  campaign: Campaign;
  closed: boolean;
  departmentName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const name = org.dba ?? org.legalName;
  const pct = campaign.goalCents
    ? formatPercent(campaign.raisedCents ?? 0, campaign.goalCents)
    : null;

  return (
    <>
      <div className="app py-4">
        <Link href={`/org/${org.slug}`} className="press text-sm font-semibold text-blue-700">
          ← {name}
        </Link>

        {departmentName && (
          <p className="mt-3 text-sm text-ink-600">{departmentName}</p>
        )}

        <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900">
          {campaign.title}
        </h1>

        {(campaign.matchMultiplier ?? 0) > 1 && !closed && (
          <p className="mt-2 inline-flex rounded-pill bg-bronze-100 px-2.5 py-1 text-xs font-bold text-ink-900">
            {campaign.matchMultiplier}x match
            {campaign.matcherName ? ` · ${campaign.matcherName}` : ""}
          </p>
        )}

        {campaign.description && (
          <p className="mt-3 text-base text-ink-600">{campaign.description}</p>
        )}

        {campaign.goalCents ? (
          <div className="mt-5 rounded-card border border-ink-300 p-4">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="tabular text-base font-semibold text-ink-900">
                {formatCompactCents(campaign.raisedCents ?? 0)}
                <span className="font-normal text-ink-600">
                  {" "}
                  of {formatCompactCents(campaign.goalCents)}
                </span>
              </span>
              <span className="tabular font-semibold text-bronze-600">{pct}%</span>
            </div>
            <div
              className="h-1 w-full overflow-hidden rounded-pill bg-bronze-100"
              role="progressbar"
              aria-valuenow={pct ?? 0}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${pct} percent of goal, as reported by the organization`}
            >
              <div
                className="h-full rounded-pill bg-bronze-600"
                style={{ width: `${Math.min(100, pct ?? 0)}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-600">
              As reported by the organization, {timeAgo(campaign.raisedUpdatedAt)}. We have no
              transaction data behind this figure — we never handle the money — so treat it as the
              organization&rsquo;s own report, dated here.
            </p>
          </div>
        ) : null}

        {campaign.endsAt && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-600">
            <CalendarClock aria-hidden className="size-4" />
            {closed ? "Closed" : "Closes"} {formatDate(campaign.endsAt)}
          </p>
        )}

        {closed ? (
          <p className="mt-5 rounded-card bg-ink-050 p-4 text-sm text-ink-600">
            This campaign is no longer open. You can still give to {name} from{" "}
            <Link href={`/org/${org.slug}`} className="font-semibold text-blue-700 underline">
              its profile
            </Link>
            .
          </p>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="press mt-5 h-13 w-full rounded-card bg-blue-700 py-4 font-semibold text-white"
          >
            Add to giving list
          </button>
        )}

        {org.claimStatus !== "unclaimed" && org.paymentMethods.length > 0 && !closed && (
          <section className="mt-8">
            <h2 className="font-display text-xl font-bold text-ink-900">How to give</h2>
            <p className="mb-3 mt-1.5 text-sm text-ink-600">
              Put &ldquo;{campaign.title}&rdquo; in the memo so it reaches the right department.
            </p>
            <PaymentMethods
              org={org}
              departments={org.departments}
              filterDepartmentId={campaign.departmentId}
            />
          </section>
        )}

        <div className="h-6" />
      </div>

      <AddToListSheet
        target={
          open
            ? {
                orgSlug: org.slug,
                orgName: name,
                campaignId: campaign.id,
                campaignTitle: campaign.title,
                suggestedAmountsCents: campaign.suggestedAmountsCents,
              }
            : null
        }
        onClose={() => setOpen(false)}
      />
      <GivingBar />
    </>
  );
}
