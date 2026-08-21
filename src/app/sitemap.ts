import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getAllOrganizationSlugs, getOrganization, visibleCampaigns } from "@/lib/data";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * With thousands of seeded profiles, organic search is the entire growth
 * channel — so every stub goes in the sitemap, not just the claimed ones.
 * A donor searching "tomchei shabbos brooklyn donate" is the whole point.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/search",
    "/about",
    "/verification",
    "/for-organizations",
    "/claim",
    "/request-removal",
    "/terms",
    "/privacy",
    "/contact",
    "/maaser",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const categoryPages = CATEGORIES.map((c) => ({
    url: `${BASE}/c/${c.slug}`,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const orgPages: MetadataRoute.Sitemap = [];
  for (const slug of getAllOrganizationSlugs()) {
    const org = getOrganization(slug);
    if (!org) continue;
    orgPages.push({
      url: `${BASE}/org/${slug}`,
      changeFrequency: org.claimStatus === "unclaimed" ? "monthly" : "weekly",
      priority: org.claimStatus === "unclaimed" ? 0.4 : 0.7,
    });
    for (const campaign of visibleCampaigns(org)) {
      orgPages.push({
        url: `${BASE}/org/${slug}/campaign/${campaign.slug}`,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  return [...staticPages, ...categoryPages, ...orgPages];
}
