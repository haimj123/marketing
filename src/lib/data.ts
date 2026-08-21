import "server-only";

import seed from "@/data/seed-organizations.json";
import { CATEGORIES } from "./categories";
import { daysSince, milesBetween } from "./format";
import type { BudgetBand, Campaign, Organization, VerificationLevel } from "./types";
import { VERIFICATION_ORDER } from "./types";

/**
 * The single data seam.
 *
 * Today every read resolves against the committed seed file, which means
 * `npm run dev` works with no database, no keys and no network. When M2 lands,
 * the bodies below are replaced with Drizzle queries against
 * `src/db/schema.ts` — the signatures are the contract and the pages never
 * learn which side they were served from.
 */

const ORGS = (seed.organizations as unknown as Organization[]).filter((o) => o.isPublished);

const BY_SLUG = new Map(ORGS.map((o) => [o.slug, o]));

/** True when the listings on screen are the fictional fixture, not IRS data. */
export const IS_DEMO_DATA: boolean = seed.isDemoData === true;

export type SortKey = "relevance" | "distance" | "urgency" | "progress" | "newest";

export interface Coords {
  lat: number;
  lng: number;
}

export interface OrgFilters {
  categorySlug?: string;
  /** claim_verified or better. */
  verifiedOnly?: boolean;
  claimedOnly?: boolean;
  matchingOnly?: boolean;
  acceptsZelle?: boolean;
  israelOnly?: boolean;
  budgetBands?: BudgetBand[];
  radiusMiles?: number;
  near?: Coords;
  query?: string;
}

export interface OrgListItem extends Organization {
  /** Populated only when `near` is supplied. */
  distanceMiles?: number;
  leadCampaign?: Campaign;
}

function rank(level: VerificationLevel): number {
  return VERIFICATION_ORDER.indexOf(level);
}

export function isVerified(org: Organization): boolean {
  return rank(org.verificationLevel) >= rank("claim_verified");
}

export function hasActiveMatch(org: Organization): boolean {
  return org.campaigns.some(
    (c) => c.status === "active" && (c.matchMultiplier ?? 0) > 1 && !isEnded(c),
  );
}

export function isEnded(c: Campaign): boolean {
  return c.endsAt ? new Date(c.endsAt).getTime() < Date.now() : false;
}

/**
 * §8.3: a campaign whose reported figure has not moved in 60 days is flagged,
 * and at 120 days it is archived. Derived at read time so the rule holds even
 * if the nightly job has not run.
 */
export function effectiveStatus(c: Campaign): Campaign["status"] {
  if (c.status === "archived" || c.status === "complete") return c.status;
  if (!c.goalCents) return c.status;
  const age = daysSince(c.raisedUpdatedAt);
  if (age >= 120) return "archived";
  if (age >= 60) return "flagged_stale";
  return c.status;
}

export function visibleCampaigns(org: Organization): Campaign[] {
  return org.campaigns.filter((c) => effectiveStatus(c) !== "archived");
}

/** The campaign a card should show: live, with a goal, furthest along. */
function pickLeadCampaign(org: Organization): Campaign | undefined {
  const live = org.campaigns.filter(
    (c) => effectiveStatus(c) === "active" && !isEnded(c) && (c.goalCents ?? 0) > 0,
  );
  if (live.length === 0) return undefined;
  return live.sort((a, b) => {
    const am = (a.matchMultiplier ?? 1) > 1 ? 1 : 0;
    const bm = (b.matchMultiplier ?? 1) > 1 ? 1 : 0;
    if (am !== bm) return bm - am;
    const ap = (a.raisedCents ?? 0) / (a.goalCents || 1);
    const bp = (b.raisedCents ?? 0) / (b.goalCents || 1);
    return bp - ap;
  })[0];
}

function decorate(org: Organization, near?: Coords): OrgListItem {
  const item: OrgListItem = { ...org, leadCampaign: pickLeadCampaign(org) };
  if (near && org.lat != null && org.lng != null) {
    item.distanceMiles = milesBetween(near, { lat: org.lat, lng: org.lng });
  }
  return item;
}

/* ------------------------------------------------------------------ search */

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9֐-׿]+/g, " ")
    .trim();
}

/**
 * Transliteration is the whole problem in this corpus: a donor types
 * "yeshiva", the record says "yeshivah"; they type "bais", the record says
 * "beis". Postgres FTS plus pg_trgm handles this in M2. Here it is a small
 * synonym table plus substring matching, which is enough for the fixture and
 * keeps the ranking behaviour visible.
 */
const SYNONYMS: Record<string, string[]> = {
  yeshiva: ["yeshivah", "yeshivas", "yeshivos"],
  bais: ["beis", "beth", "bet"],
  beis: ["bais", "beth", "bet"],
  chesed: ["chessed"],
  tzedaka: ["tzedakah", "tsedaka"],
  shul: ["synagogue", "congregation"],
  kollel: ["kollelim"],
  mikvah: ["mikveh", "mikvaos"],
  gemach: ["gemachim"],
  tomchei: ["tomchey"],
  kallah: ["kalla"],
  yesomim: ["yesomos", "orphan", "orphans"],
};

function expand(term: string): string[] {
  return [term, ...(SYNONYMS[term] ?? [])];
}

function scoreOrg(org: Organization, query: string): number {
  const q = normalise(query);
  if (!q) return 0;
  const haystack = normalise(
    [
      org.legalName,
      org.dba ?? "",
      org.city ?? "",
      org.region ?? "",
      org.tagline ?? "",
      org.categorySlugs.join(" "),
      org.departments.map((d) => d.name).join(" "),
      org.campaigns.map((c) => c.title).join(" "),
    ].join(" "),
  );
  const name = normalise(`${org.legalName} ${org.dba ?? ""}`);
  const einDigits = (org.ein ?? "").replace(/\D/g, "");
  const qDigits = query.replace(/\D/g, "");

  if (qDigits.length === 9 && einDigits === qDigits) return 1000;

  let score = 0;
  if (name.startsWith(q)) score += 60;
  if (name.includes(q)) score += 30;

  for (const term of q.split(" ")) {
    if (term.length < 2) continue;
    for (const variant of expand(term)) {
      if (name.includes(variant)) {
        score += 12;
        break;
      }
      if (haystack.includes(variant)) {
        score += 5;
        break;
      }
    }
  }

  // A verified profile outranks a stub on an otherwise equal match, because
  // a donor searching by name wants the listing that can actually take a gift.
  if (score > 0) score += rank(org.verificationLevel);
  return score;
}

/* ------------------------------------------------------------------ reads */

export function getCategories() {
  return CATEGORIES;
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of CATEGORIES) counts[c.slug] = 0;
  for (const org of ORGS) {
    for (const slug of org.categorySlugs) {
      if (slug in counts) counts[slug] += 1;
    }
  }
  return counts;
}

export function getOrganization(slug: string): Organization | undefined {
  return BY_SLUG.get(slug);
}

export function getAllOrganizationSlugs(): string[] {
  return ORGS.map((o) => o.slug);
}

export function getOrganizationCount(): number {
  return ORGS.length;
}

export function getClaimedCount(): number {
  return ORGS.filter((o) => o.claimStatus !== "unclaimed").length;
}

export function listOrganizations(
  filters: OrgFilters = {},
  sort: SortKey = "relevance",
): OrgListItem[] {
  let rows = ORGS;

  if (filters.categorySlug) {
    rows = rows.filter((o) => o.categorySlugs.includes(filters.categorySlug!));
  }
  if (filters.verifiedOnly) rows = rows.filter(isVerified);
  if (filters.claimedOnly) rows = rows.filter((o) => o.claimStatus !== "unclaimed");
  if (filters.matchingOnly) rows = rows.filter(hasActiveMatch);
  if (filters.acceptsZelle) {
    rows = rows.filter((o) => o.paymentMethods.some((p) => p.type === "zelle"));
  }
  if (filters.israelOnly) rows = rows.filter((o) => o.country === "IL");
  if (filters.budgetBands?.length) {
    rows = rows.filter((o) => filters.budgetBands!.includes(o.budgetBand));
  }

  let items = rows.map((o) => decorate(o, filters.near));

  if (filters.near && filters.radiusMiles) {
    items = items.filter(
      (o) => o.distanceMiles != null && o.distanceMiles <= filters.radiusMiles!,
    );
  }

  const query = filters.query?.trim();
  if (query) {
    items = items
      .map((o) => ({ item: o, score: scoreOrg(o, query) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item);
    if (sort === "relevance") return items;
  }

  return sortItems(items, sort);
}

function sortItems(items: OrgListItem[], sort: SortKey): OrgListItem[] {
  const copy = [...items];
  switch (sort) {
    case "distance":
      return copy.sort(
        (a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity),
      );
    case "urgency":
      // Soonest deadline first; a campaign with no deadline is not urgent.
      return copy.sort((a, b) => deadline(a) - deadline(b));
    case "progress":
      return copy.sort((a, b) => progress(b) - progress(a));
    case "newest":
      return copy.sort((a, b) => (b.rulingYear ?? 0) - (a.rulingYear ?? 0));
    default:
      // Default order: verified and claimed listings above bare IRS stubs,
      // then alphabetical. There is no paid placement and never will be.
      return copy.sort((a, b) => {
        const d = rank(b.verificationLevel) - rank(a.verificationLevel);
        if (d !== 0) return d;
        return a.legalName.localeCompare(b.legalName);
      });
  }
}

function deadline(o: OrgListItem): number {
  const ends = visibleCampaigns(o)
    .filter((c) => c.endsAt && effectiveStatus(c) === "active")
    .map((c) => new Date(c.endsAt!).getTime())
    .filter((t) => t > Date.now());
  return ends.length ? Math.min(...ends) : Number.POSITIVE_INFINITY;
}

function progress(o: OrgListItem): number {
  const c = o.leadCampaign;
  if (!c?.goalCents) return -1;
  return (c.raisedCents ?? 0) / c.goalCents;
}

export function searchOrganizations(query: string, limit = 8): OrgListItem[] {
  return listOrganizations({ query }, "relevance").slice(0, limit);
}

/** The "Matching now — every dollar doubled" rail. */
export function getMatchingOrganizations(limit = 8): OrgListItem[] {
  return listOrganizations({ matchingOnly: true }, "urgency").slice(0, limit);
}

/** Verified profiles with a live campaign — the home page's first rail. */
export function getFeaturedOrganizations(limit = 8): OrgListItem[] {
  return listOrganizations({ verifiedOnly: true }, "relevance")
    .filter((o) => o.leadCampaign)
    .slice(0, limit);
}

export function getNearbyOrganizations(near: Coords, limit = 8): OrgListItem[] {
  return listOrganizations({ near }, "distance").slice(0, limit);
}

export function getCampaign(
  orgSlug: string,
  campaignSlug: string,
): { org: Organization; campaign: Campaign } | undefined {
  const org = getOrganization(orgSlug);
  const campaign = org?.campaigns.find((c) => c.slug === campaignSlug);
  if (!org || !campaign) return undefined;
  return { org, campaign };
}

export function getRelatedOrganizations(org: Organization, limit = 4): OrgListItem[] {
  const primary = org.categorySlugs[0];
  if (!primary) return [];
  return listOrganizations({ categorySlug: primary })
    .filter((o) => o.slug !== org.slug)
    .slice(0, limit);
}
