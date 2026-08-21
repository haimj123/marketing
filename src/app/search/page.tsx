import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/shell/app-header";
import { BrowseControls } from "@/components/browse/browse-controls";
import { SearchField } from "@/components/browse/search-field";
import { CategoryIcon } from "@/components/category-icon";
import { OrgFeed } from "@/components/org-rail";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { getCategories, getCategoryCounts, listOrganizations } from "@/lib/data";
import { parseFilters, parsePage, parseSort, type RawParams } from "@/lib/search-params";

const PAGE_SIZE = 20;

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
  const sort = parseSort(raw, "relevance");
  const page = parsePage(raw);
  const query = filters.query ?? "";

  const hasCriteria =
    Boolean(query) ||
    Boolean(
      filters.verifiedOnly ||
        filters.claimedOnly ||
        filters.matchingOnly ||
        filters.acceptsZelle ||
        filters.israelOnly ||
        filters.budgetBands?.length ||
        filters.radiusMiles,
    );

  const all = listOrganizations(filters, sort);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const categories = getCategories();
  const counts = getCategoryCounts();

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-ink-300 bg-white">
        <div className="app py-2.5">
          <Suspense fallback={<div className="h-11 rounded-pill bg-ink-050" />}>
            <SearchField initialQuery={query} />
          </Suspense>
        </div>
      </div>

      <div className="app">
        <Suspense fallback={<div className="h-[53px]" />}>
          <BrowseControls resultCount={all.length} />
        </Suspense>

        {hasCriteria ? (
          <>
            <p className="tabular py-3 text-sm text-ink-600">
              {all.length} {all.length === 1 ? "result" : "results"}
              {query ? ` for “${query}”` : ""}
            </p>

            {rows.length > 0 ? (
              <OrgFeed orgs={rows} showDistance={Boolean(filters.near)} />
            ) : (
              <EmptyState
                title={query ? `No match for “${query}”` : "Nothing matches those filters"}
                body="Transliteration splits a lot of searches — try “beis” for “bais”, or drop a word. You can also browse by category."
                action={<ButtonLink href="/categories">Browse categories</ButtonLink>}
              />
            )}

            <Pagination page={page} totalPages={totalPages} basePath="/search" params={raw} />
          </>
        ) : (
          /* An empty search screen showing nothing wastes the most valuable
             moment on it. Offer the categories instead. */
          <section className="py-4">
            <h2 className="mb-2 font-display text-xl font-bold text-ink-900">Browse by cause</h2>
            <ul className="divide-y divide-ink-300">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link href={`/c/${category.slug}`} className="press flex items-center gap-3 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-050 text-blue-700">
                      <CategoryIcon iconKey={category.iconKey} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink-900">
                      {category.nameEn}
                    </span>
                    <span className="tabular shrink-0 text-sm text-ink-600">
                      {counts[category.slug]}
                    </span>
                    <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="h-6" />
      </div>
    </>
  );
}
