import type { OrgFilters, SortKey } from "./data";
import type { BudgetBand } from "./types";

export type RawParams = Record<string, string | string[] | undefined>;

function one(params: RawParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

const VALID_SORTS: SortKey[] = ["relevance", "distance", "urgency", "progress", "newest"];

const VALID_BANDS: BudgetBand[] = [
  "under_100k",
  "100k_500k",
  "500k_2m",
  "2m_10m",
  "over_10m",
  "unknown",
];

export function parseFilters(params: RawParams, categorySlug?: string): OrgFilters {
  const lat = Number(one(params, "lat"));
  const lng = Number(one(params, "lng"));
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const radius = Number(one(params, "radius"));

  const budget = (one(params, "budget") ?? "")
    .split(",")
    .filter((b): b is BudgetBand => VALID_BANDS.includes(b as BudgetBand));

  return {
    categorySlug,
    query: one(params, "q")?.slice(0, 120),
    verifiedOnly: one(params, "verified") === "1",
    claimedOnly: one(params, "claimed") === "1",
    matchingOnly: one(params, "matching") === "1",
    acceptsZelle: one(params, "zelle") === "1",
    israelOnly: one(params, "israel") === "1",
    budgetBands: budget.length ? budget : undefined,
    near: hasCoords ? { lat, lng } : undefined,
    radiusMiles: hasCoords && Number.isFinite(radius) ? radius : undefined,
  };
}

export function parseSort(params: RawParams, fallback: SortKey = "relevance"): SortKey {
  const raw = one(params, "sort") as SortKey | undefined;
  if (raw && VALID_SORTS.includes(raw)) return raw;
  return fallback;
}

export function parsePage(params: RawParams): number {
  const page = Number(one(params, "page"));
  return Number.isFinite(page) && page > 1 ? Math.floor(page) : 1;
}

export function countActiveFilters(params: RawParams): number {
  let n = 0;
  for (const key of ["verified", "claimed", "matching", "zelle", "israel", "radius"]) {
    if (one(params, key)) n += 1;
  }
  const budget = one(params, "budget");
  if (budget) n += budget.split(",").filter(Boolean).length;
  return n;
}
