import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock } from "lucide-react";
import {
  effectiveStatus,
  getAllOrganizationSlugs,
  getCampaign,
  getOrganization,
  isEnded,
  visibleCampaigns,
} from "@/lib/data";
import { formatCompactCents, formatDate, timeAgo } from "@/lib/format";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AddToGivingListButton, ShareButton } from "@/components/give-actions";
import { PaymentMethods } from "@/components/payment-methods";
import { VerificationBadge } from "@/components/verification-badge";

export const revalidate = 3600;

/** Every live campaign gets a static page — organic search is the only growth
 *  channel a directory with no marketing budget has. */
export function generateStaticParams() {
  const params: { slug: string; campaignSlug: string }[] = [];
  for (const slug of getAllOrganizationSlugs()) {
    const org = getOrganization(slug);
    if (!org) continue;
    for (const campaign of visibleCampaigns(org)) {
      params.push({ slug, campaignSlug: campaign.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; campaignSlug: string }>;
}): Promise<Metadata> {
  const { slug, campaignSlug } = await params;
  const found = getCampaign(slug, campaignSlug);
  if (!found) return {};
  const { org, campaign } = found;
  const name = org.dba ?? org.legalName;

  return {
    title: `${campaign.title} — ${name}`,
    description: campaign.description?.slice(0, 200) ?? `Support ${campaign.title} at ${name}.`,
    alternates: { canonical: `/org/${slug}/campaign/${campaignSlug}` },
  };
}

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ slug: string; campaignSlug: string }>;
}) {
  const { slug, campaignSlug } = await params;
  const found = getCampaign(slug, campaignSlug);
  if (!found) notFound();

  const { org, campaign } = found;
  const name = org.dba ?? org.legalName;
  const status = effectiveStatus(campaign);
  const ended = isEnded(campaign);
  const department = org.departments.find((d) => d.id === campaign.departmentId);
  const closed = ended || status === "complete" || status === "archived";

  return (
    <div className="page max-w-3xl py-8">
      <Link
        href={`/org/${org.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {name}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <VerificationBadge level={org.verificationLevel} />
        {department && (
          <span className="rounded-full bg-ink-050 px-2.5 py-1 text-xs font-semibold text-ink-600">
            {department.name}
          </span>
        )}
        {(campaign.matchMultiplier ?? 0) > 1 && !closed && (
          <span className="rounded-full bg-bronze-100 px-2.5 py-1 text-xs font-bold text-bronze-600">
            {campaign.matchMultiplier}× match
          </span>
        )}
      </div>

      <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900">
        {campaign.title}
      </h1>

      {campaign.description && (
        <p className="mt-3 text-base text-ink-600">{campaign.description}</p>
      )}

      {campaign.goalCents ? (
        <div className="mt-6 rounded-[8px] border border-ink-300 p-5">
          <ProgressBar
            raisedCents={campaign.raisedCents}
            goalCents={campaign.goalCents}
            updatedAt={campaign.raisedUpdatedAt}
          />
          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-ink-050 pt-4 text-sm">
            <div>
              <dt className="text-ink-600">Goal</dt>
              <dd className="tabular font-semibold text-ink-900">
                {formatCompactCents(campaign.goalCents)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-600">Figure last updated</dt>
              <dd className="font-semibold text-ink-900">{timeAgo(campaign.raisedUpdatedAt)}</dd>
            </div>
            {campaign.matcherName && (
              <div className="col-span-2">
                <dt className="text-ink-600">Matched by</dt>
                <dd className="font-semibold text-ink-900">{campaign.matcherName}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-xs text-ink-600">
            This total is entered by the organization. We have no transaction data behind it — we
            never handle the money — so treat it as the organization&rsquo;s own report, dated
            above.
          </p>
        </div>
      ) : null}

      {campaign.endsAt && (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-ink-600">
          <CalendarClock aria-hidden className="size-4" />
          {ended ? "Closed" : "Closes"} {formatDate(campaign.endsAt)}
        </p>
      )}

      {closed ? (
        <p className="mt-6 rounded-[8px] bg-ink-050 p-4 text-sm text-ink-600">
          This campaign is no longer open. You can still give to {name} generally from{" "}
          <Link href={`/org/${org.slug}`} className="font-semibold text-brand-700 underline">
            its profile
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          <AddToGivingListButton
            orgSlug={org.slug}
            orgName={name}
            campaignId={campaign.id}
            campaignTitle={campaign.title}
            suggestedAmountsCents={campaign.suggestedAmountsCents}
          />
          <ShareButton title={`${campaign.title} — ${name}`} />
        </div>
      )}

      {org.claimStatus !== "unclaimed" && org.paymentMethods.length > 0 && !closed && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink-900">How to give</h2>
          <p className="mb-4 mt-2 text-sm text-ink-600">
            Put &ldquo;{campaign.title}&rdquo; in the memo so it reaches the right department.
          </p>
          <PaymentMethods
            org={org}
            departments={org.departments}
            filterDepartmentId={campaign.departmentId}
          />
        </section>
      )}
    </div>
  );
}
