import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Flag, Globe, MapPin, Phone } from "lucide-react";
import {
  getAllOrganizationSlugs,
  getOrganization,
  getRelatedOrganizations,
  visibleCampaigns,
} from "@/lib/data";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { formatEin } from "@/lib/format";
import { Markdown } from "@/lib/markdown";
import { OrgImage } from "@/components/org-image";
import { OrgGrid } from "@/components/org-rail";
import { CampaignCard } from "@/components/campaign-card";
import { DepartmentTabs } from "@/components/department-tabs";
import { PaymentMethods } from "@/components/payment-methods";
import { UnclaimedBanner } from "@/components/unclaimed-banner";
import { VerificationBadge } from "@/components/verification-badge";
import { VerificationPanel } from "@/components/verification-panel";
import { AddToGivingListButton, FavoriteButton, ShareButton } from "@/components/give-actions";
import { StaticChip } from "@/components/ui/chip";

export const revalidate = 3600;

export function generateStaticParams() {
  return getAllOrganizationSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const org = getOrganization(slug);
  if (!org) return {};

  const name = org.dba ?? org.legalName;
  const where = [org.city, org.region].filter(Boolean).join(", ");
  const description =
    org.tagline ??
    `${name}${where ? ` in ${where}` : ""}. Verification status, IRS record and how to give directly — Shaare Tzadaka takes no fee and never handles your donation.`;

  return {
    title: where ? `${name} — ${where}` : name,
    description,
    alternates: { canonical: `/org/${slug}` },
    openGraph: { title: name, description, url: `/org/${slug}` },
  };
}

export default async function OrgPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getOrganization(slug);
  if (!org) notFound();

  const name = org.dba ?? org.legalName;
  const unclaimed = org.claimStatus === "unclaimed";
  const campaigns = visibleCampaigns(org);
  const usPartner = org.usPartnerOrgSlug ? getOrganization(org.usPartnerOrgSlug) : undefined;
  const related = getRelatedOrganizations(org);

  const sections: { id: string; label: string }[] = [];
  if (org.storyMd) sections.push({ id: "about", label: "About" });
  for (const dept of [...org.departments].sort((a, b) => a.sortOrder - b.sortOrder)) {
    sections.push({ id: `dept-${dept.id}`, label: dept.name });
  }
  const orphanCampaigns = campaigns.filter((c) => !c.departmentId);
  if (orphanCampaigns.length > 0) sections.push({ id: "campaigns", label: "Other campaigns" });
  if (!unclaimed && org.paymentMethods.length > 0) {
    sections.push({ id: "give", label: "How to give" });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: org.legalName,
    alternateName: org.dba ?? undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/org/${org.slug}`,
    sameAs: org.website ? [org.website] : undefined,
    description: org.tagline ?? undefined,
    taxID: org.ein ?? undefined,
    foundingDate: org.rulingYear ? String(org.rulingYear) : undefined,
    address: org.city
      ? {
          "@type": "PostalAddress",
          streetAddress: org.addressLine1 ?? undefined,
          addressLocality: org.city,
          addressRegion: org.region || undefined,
          postalCode: org.postalCode ?? undefined,
          addressCountry: org.country,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative h-44 w-full overflow-hidden md:h-64">
        <OrgImage
          slug={org.slug}
          name={name}
          heroUrl={org.heroUrl}
          categorySlug={org.categorySlugs[0]}
          large
          className={unclaimed ? "opacity-40 saturate-50" : undefined}
        />
      </div>

      <div className="app">
        <div className="-mt-6 rounded-t-sheet bg-white pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <VerificationBadge level={org.verificationLevel} size="md" />
            {org.categorySlugs.map((s) => {
              const category = CATEGORY_BY_SLUG.get(s);
              return category ? (
                <Link key={s} href={`/c/${s}`}>
                  <StaticChip tone="brand">{category.nameEn}</StaticChip>
                </Link>
              ) : null;
            })}
          </div>

          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900">
            {name}
          </h1>
          {org.dba && org.dba !== org.legalName && (
            <p className="mt-1 text-sm text-ink-600">Legal name: {org.legalName}</p>
          )}
          {org.tagline && <p className="mt-2 max-w-2xl text-base text-ink-600">{org.tagline}</p>}

          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-600">
            {org.city && (
              <li className="flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4" />
                {[org.addressLine1, org.city, org.region].filter(Boolean).join(", ")}
              </li>
            )}
            {org.phone && (
              <li className="flex items-center gap-1.5">
                <Phone aria-hidden className="size-4" />
                <a href={`tel:${org.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                  {org.phone}
                </a>
              </li>
            )}
            {org.website && (
              <li className="flex items-center gap-1.5">
                <Globe aria-hidden className="size-4" />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  Website
                  <ExternalLink aria-hidden className="size-3.5" />
                </a>
              </li>
            )}
            {org.ein && <li className="tabular">EIN {formatEin(org.ein)}</li>}
          </ul>

          {!unclaimed && (
            <div className="mt-5 flex flex-wrap gap-3">
              <AddToGivingListButton orgSlug={org.slug} orgName={name} />
              <FavoriteButton orgSlug={org.slug} orgName={name} />
              <ShareButton title={name} text={org.tagline ?? undefined} />
            </div>
          )}
        </div>

        {unclaimed && (
          <div className="mt-6">
            <UnclaimedBanner orgSlug={org.slug} legalName={org.legalName} />
          </div>
        )}

        <div className="mt-6">
          <DepartmentTabs sections={sections} />
        </div>

        <div className="mt-6 flex flex-col gap-10 pb-4 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-10">
            {unclaimed && (
              /* Without a story or departments the left column would be empty
                 next to a tall verification panel, which reads as a broken
                 page rather than an incomplete one. Say what is missing. */
              <section className="rounded-card border border-ink-300 p-5">
                <h2 className="font-display text-lg font-bold text-ink-900">
                  What the public record says
                </h2>
                <p className="mt-2 text-sm text-ink-600">
                  {org.legalName} is listed in the IRS Business Master File
                  {org.rulingYear ? ` with recognition dating to ${org.rulingYear}` : ""}
                  {org.city ? `, at an address in ${org.city}${org.region ? `, ${org.region}` : ""}` : ""}
                  . That is all we know.
                </p>
                <p className="mt-3 text-sm text-ink-600">
                  What it does day to day, what it is raising for, and how to send it money are
                  things only the organization can tell you — and it has not claimed this listing
                  yet. If you know someone there, tell them the listing exists.
                </p>
              </section>
            )}

            {org.storyMd && (
              <section id="about" className="scroll-mt-32">
                <h2 className="font-display text-xl font-bold text-ink-900">About</h2>
                <Markdown source={org.storyMd} className="mt-3 text-base text-ink-600" />
              </section>
            )}

            {[...org.departments]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((dept) => {
                const deptCampaigns = campaigns.filter((c) => c.departmentId === dept.id);
                return (
                  <section key={dept.id} id={`dept-${dept.id}`} className="scroll-mt-32">
                    <h2 className="font-display text-xl font-bold text-ink-900">{dept.name}</h2>
                    {dept.description && (
                      <p className="mt-2 max-w-2xl text-sm text-ink-600">{dept.description}</p>
                    )}
                    {deptCampaigns.length > 0 ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {deptCampaigns.map((campaign) => (
                          <CampaignCard key={campaign.id} org={org} campaign={campaign} />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-ink-600">
                        No specific campaign listed — a general gift reaches this department.
                      </p>
                    )}
                  </section>
                );
              })}

            {orphanCampaigns.length > 0 && (
              <section id="campaigns" className="scroll-mt-32">
                <h2 className="font-display text-xl font-bold text-ink-900">Other campaigns</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {orphanCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} org={org} campaign={campaign} />
                  ))}
                </div>
              </section>
            )}

            {!unclaimed && org.paymentMethods.length > 0 && (
              <section id="give" className="scroll-mt-32">
                <h2 className="font-display text-xl font-bold text-ink-900">How to give</h2>
                <p className="mb-4 mt-2 max-w-2xl text-sm text-ink-600">
                  You are giving to {name} directly, through its own account. Copy the handle,
                  send from your banking app, then come back and log it so your maaser balance
                  stays right.
                </p>
                <PaymentMethods org={org} departments={org.departments} />
              </section>
            )}

            {org.endorsements.length > 0 && (
              <section id="endorsements" className="scroll-mt-32">
                <h2 className="font-display text-xl font-bold text-ink-900">Endorsements</h2>
                <p className="mt-2 text-sm text-ink-600">
                  Named people who have put their name to this organization in writing. We hold the
                  documents on file. This is what we publish instead of star ratings.
                </p>
                <ul className="mt-4 space-y-4">
                  {org.endorsements.map((e) => (
                    <li key={e.id} className="rounded-card border border-bronze-100 bg-bronze-100/40 p-5">
                      <blockquote className="text-base text-ink-900">
                        &ldquo;{e.quote}&rdquo;
                      </blockquote>
                      <p className="mt-2 text-sm font-semibold text-bronze-600">
                        {e.endorserName}
                        {e.endorserTitle ? `, ${e.endorserTitle}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="w-full shrink-0 space-y-4 lg:w-80">
            <VerificationPanel org={org} usPartner={usPartner} />

            <Link
              href={`/report?org=${org.slug}`}
              className="flex items-center gap-2 rounded-card border border-ink-300 p-4 text-sm font-semibold text-ink-900 hover:border-danger hover:text-danger"
            >
              <Flag aria-hidden className="size-4" />
              Report a problem with this listing
            </Link>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="border-t border-ink-300 py-10">
            <h2 className="mb-4 font-display text-xl font-bold text-ink-900">
              Others in {CATEGORY_BY_SLUG.get(org.categorySlugs[0])?.nameEn ?? "this category"}
            </h2>
            <OrgGrid orgs={related} />
          </section>
        )}
      </div>
    </>
  );
}
