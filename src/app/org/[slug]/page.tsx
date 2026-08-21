import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrgScreen } from "@/components/org/org-screen";
import {
  effectiveStatus,
  getAllOrganizationSlugs,
  getOrganization,
  getRelatedOrganizations,
  visibleCampaigns,
} from "@/lib/data";
import type { Campaign } from "@/lib/types";

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

  const campaigns = visibleCampaigns(org);

  // Staleness is derived at read time so the rule holds even if the nightly
  // job has not run. Computed here rather than in the client component so the
  // page stays server-rendered.
  const statuses: Record<string, Campaign["status"]> = {};
  for (const campaign of campaigns) statuses[campaign.id] = effectiveStatus(campaign);

  const partner = org.usPartnerOrgSlug ? getOrganization(org.usPartnerOrgSlug) : undefined;
  const usPartner = partner
    ? { slug: partner.slug, name: partner.dba ?? partner.legalName }
    : undefined;

  const sections: { id: string; label: string }[] = [];
  if (org.storyMd) sections.push({ id: "about", label: "About" });
  for (const dept of [...org.departments].sort((a, b) => a.sortOrder - b.sortOrder)) {
    sections.push({ id: `dept-${dept.id}`, label: dept.name });
  }
  if (campaigns.some((c) => !c.departmentId)) {
    sections.push({ id: "campaigns", label: "Other campaigns" });
  }
  if (org.claimStatus !== "unclaimed" && org.paymentMethods.length > 0) {
    sections.push({ id: "give", label: "How to give" });
  }
  sections.push({ id: "verification", label: "Verification" });

  const related = getRelatedOrganizations(org, 4).map((o) => ({
    slug: o.slug,
    name: o.dba ?? o.legalName,
    city: [o.city, o.region].filter(Boolean).join(", "),
  }));

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
      <OrgScreen
        org={org}
        campaigns={campaigns}
        statuses={statuses}
        usPartner={usPartner}
        sections={sections}
        related={related}
      />
    </>
  );
}
