import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/shell/app-header";
import { CampaignScreen } from "@/components/org/campaign-screen";
import {
  effectiveStatus,
  getAllOrganizationSlugs,
  getCampaign,
  getOrganization,
  isEnded,
  visibleCampaigns,
} from "@/lib/data";

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
  const status = effectiveStatus(campaign);
  const closed = isEnded(campaign) || status === "complete" || status === "archived";
  const department = org.departments.find((d) => d.id === campaign.departmentId);

  return (
    <>
      <AppHeader back title={org.dba ?? org.legalName} />
      <CampaignScreen
        org={org}
        campaign={campaign}
        closed={closed}
        departmentName={department?.name}
      />
    </>
  );
}
