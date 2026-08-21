import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_BY_SLUG, CATEGORIES } from "@/lib/categories";
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
import { CategoryIcon } from "@/components/category-icon";

const PAGE_SIZE = 12;

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) return {};
  const count = listOrganizations({ categorySlug: slug }).length;
  return {
    title: `${category.nameEn} — ${count} organizations`,
    description: `${category.blurb} Browse ${count} ${category.nameEn.toLowerCase()} organizations, see how each is verified, and give directly.`,
    alternates: { canonical: `/c/${slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawParams>;
}) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) notFound();

  const raw = await searchParams;
  const filters = parseFilters(raw, slug);
  const sort = parseSort(raw, filters.near ? "distance" : "relevance");
  const page = parsePage(raw);

  const all = listOrganizations(filters, sort);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="app py-8">
      <div className="flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-050 text-blue-700">
          <CategoryIcon iconKey={category.iconKey} className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-900">
            {category.nameEn}
          </h1>
          <p className="he text-base text-ink-600" lang="he" dir="rtl">
            {category.nameHe}
          </p>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">{category.blurb}</p>
        </div>
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
                title="Nothing matches those filters"
                body="Try clearing a filter, or widen the distance. Every listing here is either an IRS record or a profile someone has claimed — we would rather show you nothing than pad the page."
                action={<ButtonLink href={`/c/${slug}`}>Clear filters</ButtonLink>}
              />
            )}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath={`/c/${slug}`}
            params={raw}
          />
        </div>
      </div>
    </div>
  );
}
