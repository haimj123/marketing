"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, ChevronRight, Flag } from "lucide-react";
import { OrgImage } from "../org-image";
import { Markdown } from "@/lib/markdown";
import { AddToListSheet, BackCircleButton, HeroActions } from "./give-actions";
import { CampaignRow } from "./campaign-row";
import { DepartmentTabs } from "./department-tabs";
import { GivingBar } from "./giving-bar";
import { PaymentMethods } from "./payment-card";
import { categoryName } from "@/lib/categories";
import {
  BUDGET_BAND_LABEL,
  TAX_STATUS_LABEL,
  TAX_STATUS_NOTE,
  VERIFICATION_LABEL,
  VERIFICATION_MEANING,
  formatEin,
  timeAgo,
} from "@/lib/format";
import type { Campaign, Organization } from "@/lib/types";

interface Section {
  id: string;
  label: string;
}

/**
 * The store page.
 *
 * A client component because the whole screen shares one add-to-list sheet:
 * every campaign row's "+" opens the same sheet with a different target, which
 * is one sheet in the tree instead of one per row. The page around it stays a
 * server component so metadata and JSON-LD are still rendered on the server.
 */
export function OrgScreen({
  org,
  campaigns,
  statuses,
  usPartner,
  sections,
  related,
}: {
  org: Organization;
  campaigns: Campaign[];
  statuses: Record<string, Campaign["status"]>;
  usPartner?: { slug: string; name: string };
  sections: Section[];
  related: { slug: string; name: string; city: string }[];
}) {
  const [target, setTarget] = React.useState<Parameters<typeof AddToListSheet>[0]["target"]>(null);
  const name = org.dba ?? org.legalName;
  const unclaimed = org.claimStatus === "unclaimed";
  const orphans = campaigns.filter((c) => !c.departmentId);

  return (
    <>
      <div className="relative h-[200px] w-full overflow-hidden">
        <OrgImage
          slug={org.slug}
          name={name}
          heroUrl={org.heroUrl}
          categorySlug={org.categorySlugs[0]}
          unclaimed={unclaimed}
          size="hero"
        />
        <BackCircleButton />
        {!unclaimed && <HeroActions orgSlug={org.slug} orgName={name} />}
      </div>

      {/* The content sheet rides 16px up over the hero. */}
      <div className="relative -mt-4 rounded-t-sheet bg-white">
        <div className="app pt-5">
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900">
            {name}
          </h1>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-ink-600">
            <Link href="/verification" className="press inline-flex items-center gap-1">
              <BadgeCheck
                aria-hidden
                className={
                  org.verificationLevel === "claim_verified" ||
                  org.verificationLevel === "endorsed"
                    ? "size-4 text-bronze-500"
                    : "size-4 text-ink-600"
                }
              />
              {VERIFICATION_LABEL[org.verificationLevel]}
            </Link>
            {org.city && (
              <>
                <span aria-hidden>·</span>
                <span>{[org.city, org.region].filter(Boolean).join(", ")}</span>
              </>
            )}
            {org.categorySlugs.map((slug) => (
              <React.Fragment key={slug}>
                <span aria-hidden>·</span>
                <Link href={`/c/${slug}`} className="press underline underline-offset-2">
                  {categoryName(slug)}
                </Link>
              </React.Fragment>
            ))}
          </p>

          <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-card bg-ink-300">
            <InfoTile label="EIN" value={formatEin(org.ein) ?? "Not listed"} />
            <InfoTile label="Founded" value={org.rulingYear ? String(org.rulingYear) : "Unknown"} />
            <InfoTile label="Status" value={TAX_STATUS_LABEL[org.taxStatus]} />
          </dl>

          {unclaimed && (
            <div className="mt-4 rounded-card bg-ink-050 p-4">
              <h2 className="font-semibold text-ink-900">
                This organization hasn&rsquo;t claimed its profile
              </h2>
              <p className="mt-1.5 text-sm text-ink-600">
                Everything here comes from the IRS Business Master File. Nobody from {org.legalName}{" "}
                has reviewed it, and we do not show payment details for an unclaimed listing — we
                have no way to know they would be correct.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href={`/claim?org=${org.slug}`}
                  className="press flex h-12 items-center justify-center rounded-card bg-blue-700 font-semibold text-white"
                >
                  Claim this profile
                </Link>
                <Link
                  href={`/request-removal?org=${org.slug}`}
                  className="press flex h-12 items-center justify-center rounded-card border border-ink-300 bg-white font-semibold text-ink-900"
                >
                  Request removal
                </Link>
              </div>
            </div>
          )}
        </div>

        {sections.length > 1 && (
          <div className="app mt-5">
            <DepartmentTabs sections={sections} />
          </div>
        )}

        <div className="app">
          {org.storyMd && (
            <section id="about" className="scroll-mt-14 py-5">
              <h2 className="font-display text-xl font-bold text-ink-900">About</h2>
              <Markdown source={org.storyMd} className="mt-2 text-base text-ink-600" />
            </section>
          )}

          {[...org.departments]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((dept) => {
              const rows = campaigns.filter((c) => c.departmentId === dept.id);
              return (
                <section key={dept.id} id={`dept-${dept.id}`} className="scroll-mt-14 py-5">
                  <h2 className="font-display text-xl font-bold text-ink-900">{dept.name}</h2>
                  {dept.description && (
                    <p className="mt-1.5 text-sm text-ink-600">{dept.description}</p>
                  )}
                  {rows.length > 0 ? (
                    <div className="mt-2">
                      {rows.map((campaign) => (
                        <CampaignRow
                          key={campaign.id}
                          org={org}
                          campaign={campaign}
                          status={statuses[campaign.id]}
                          onAdd={() =>
                            setTarget({
                              orgSlug: org.slug,
                              orgName: name,
                              campaignId: campaign.id,
                              campaignTitle: campaign.title,
                              suggestedAmountsCents: campaign.suggestedAmountsCents,
                            })
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-ink-600">
                      No specific campaign listed — a general gift reaches this department.
                    </p>
                  )}
                </section>
              );
            })}

          {orphans.length > 0 && (
            <section id="campaigns" className="scroll-mt-14 py-5">
              <h2 className="font-display text-xl font-bold text-ink-900">Other campaigns</h2>
              <div className="mt-2">
                {orphans.map((campaign) => (
                  <CampaignRow
                    key={campaign.id}
                    org={org}
                    campaign={campaign}
                    status={statuses[campaign.id]}
                    onAdd={() =>
                      setTarget({
                        orgSlug: org.slug,
                        orgName: name,
                        campaignId: campaign.id,
                        campaignTitle: campaign.title,
                        suggestedAmountsCents: campaign.suggestedAmountsCents,
                      })
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {!unclaimed && org.paymentMethods.length > 0 && (
            <section id="give" className="scroll-mt-14 py-5">
              <h2 className="font-display text-xl font-bold text-ink-900">How to give</h2>
              <p className="mb-3 mt-1.5 text-sm text-ink-600">
                You are giving to {name} directly, through its own account. Copy the handle, send
                from your banking app, then come back and log it.
              </p>
              <PaymentMethods org={org} departments={org.departments} />
            </section>
          )}

          <section id="verification" className="scroll-mt-14 py-5">
            <h2 className="font-display text-xl font-bold text-ink-900">Verification</h2>
            <p className="mt-1.5 text-sm text-ink-600">
              {VERIFICATION_MEANING[org.verificationLevel]}
            </p>

            <dl className="mt-3 divide-y divide-ink-300 border-y border-ink-300 text-sm">
              <Row label="Annual budget" value={BUDGET_BAND_LABEL[org.budgetBand]} />
              {org.irsLastSyncedAt && (
                <Row label="IRS record checked" value={timeAgo(org.irsLastSyncedAt)} />
              )}
            </dl>

            <p className="mt-3 rounded-card bg-ink-050 p-3 text-sm text-ink-600">
              {TAX_STATUS_NOTE[org.taxStatus]}
            </p>

            {usPartner && (
              <p className="mt-3 text-sm text-ink-900">
                US donors: give through{" "}
                <Link
                  href={`/org/${usPartner.slug}`}
                  className="font-semibold text-blue-700 underline"
                >
                  {usPartner.name}
                </Link>
                , the American entity for this organization.
              </p>
            )}

            <Link
              href="/verification"
              className="press mt-3 flex min-h-11 items-center justify-between gap-2 text-sm font-semibold text-blue-700"
            >
              How verification works
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          </section>

          {org.endorsements.length > 0 && (
            <section className="py-5">
              <h2 className="font-display text-xl font-bold text-ink-900">Endorsements</h2>
              <p className="mt-1.5 text-sm text-ink-600">
                Named people who put their name to this organization in writing. This is what we
                publish instead of star ratings.
              </p>
              <ul className="mt-3 space-y-3">
                {org.endorsements.map((e) => (
                  <li key={e.id} className="rounded-card bg-bronze-100/50 p-4">
                    <blockquote className="text-sm text-ink-900">&ldquo;{e.quote}&rdquo;</blockquote>
                    <p className="mt-2 text-sm font-semibold text-bronze-600">
                      {e.endorserName}
                      {e.endorserTitle ? `, ${e.endorserTitle}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="py-5">
              <h2 className="font-display text-xl font-bold text-ink-900">Similar organizations</h2>
              <ul className="mt-2 divide-y divide-ink-300">
                {related.map((row) => (
                  <li key={row.slug}>
                    <Link
                      href={`/org/${row.slug}`}
                      className="press flex min-h-[52px] items-center gap-3 py-3"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink-900">
                          {row.name}
                        </span>
                        <span className="block truncate text-sm text-ink-600">{row.city}</span>
                      </span>
                      <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link
            href={`/report?org=${org.slug}`}
            className="press mb-6 flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-600"
          >
            <Flag aria-hidden className="size-4" />
            Report a problem with this listing
          </Link>
        </div>
      </div>

      <AddToListSheet target={target} onClose={() => setTarget(null)} />
      <GivingBar />
    </>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-050 px-3 py-2.5">
      <dt className="text-2xs font-semibold uppercase tracking-wide text-ink-600">{label}</dt>
      <dd className="tabular mt-0.5 text-sm font-semibold leading-tight text-ink-900">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-ink-600">{label}</dt>
      <dd className="font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
