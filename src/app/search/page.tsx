import { Suspense } from "react";
import type { Metadata } from "next";
import { listOrganizations } from "@/lib/data";
import {
  countActiveFilters,
  parseFilters,
  parsePage,
  parseSort,
  type RawParams,
} from "@/lib/search-params";
import { OrgGrid } from "@/components/org-rail";
import { ActiveFilterPills, FilterSheetButton, FilterSidebar, SortSelect } from "@/components/filters";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { SearchBox } from "@/components/search-box";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search Jewish tzedaka organizations by name, department, city or EIN. Filter by verification, matching campaigns and distance.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const raw = await searchParams;
  const filters = parseFilters(raw);
  const sort = parseSort(raw, filters.near ? "distance" : "relevance");
  const page = parsePage(raw);
  const query = filters.query ?? "";

  const all = listOrganizations(filters, sort);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="app py-8">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
        {query ? `Results for “${query}”` : "Search"}
      </h1>

      <div className="mt-4 max-w-xl">
        <Suspense fallback={null}>
          <SearchBox
            initialQuery={query}
            autoFocus={!query}
            placeholder="Organization, department, city or EIN"
          />
        </Suspense>
      </div>

      <div className="mt-8 flex gap-8">
        <Suspense fallback={<div className="hidden w-64 shrink-0 lg:block" />}>
          <FilterSidebar />
        </Suspense>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="tabular text-sm text-ink-600">
              {all.length} {all.length === 1 ? "organization" : "organizations"}
            </p>
            <div className="flex items-center gap-2">
              <Suspense fallback={null}>
                <FilterSheetButton activeCount={countActiveFilters(raw)} />
                <SortSelect value={sort} />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={null}>
            <ActiveFilterPills />
          </Suspense>

          <div className="mt-4">
            {rows.length > 0 ? (
              <OrgGrid orgs={rows} showDistance={Boolean(filters.near)} />
            ) : (
              <EmptyState
                title={query ? `No match for “${query}”` : "Nothing matches those filters"}
                body="Transliteration splits a lot of searches — try “beis” for “bais”, or drop a word. You can also browse by category from the home page."
                action={<ButtonLink href="/">Browse categories</ButtonLink>}
              />
            )}
          </div>

          <Pagination page={page} totalPages={totalPages} basePath="/search" params={raw} />
        </div>
      </div>
    </div>
  );
}
