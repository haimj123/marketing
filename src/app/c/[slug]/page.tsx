import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/shell/app-header";
import { BrowseControls } from "@/components/browse/browse-controls";
import { OrgFeed } from "@/components/org-rail";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/pagination";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/categories";
import { listOrganizations } from "@/lib/data";
import { parseFilters, parsePage, parseSort, type RawParams } from "@/lib/search-params";

const PAGE_SIZE = 20;

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
  const sort = parseSort(raw, "relevance");
  const page = parsePage(raw);

  const all = listOrganizations(filters, sort);
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <AppHeader back title={category.nameEn} />

      <div className="app">
        <Suspense fallback={<div className="h-[53px]" />}>
          <BrowseControls resultCount={all.length} />
        </Suspense>

        <p className="tabular py-3 text-sm text-ink-600">
          {all.length} {all.length === 1 ? "organization" : "organizations"}
        </p>

        {rows.length > 0 ? (
          <OrgFeed orgs={rows} showDistance={Boolean(filters.near)} />
        ) : (
          <EmptyState
            title="Nothing matches those filters"
            body="Try clearing one, or widening the distance. We would rather show you nothing than pad the page."
            action={<ButtonLink href={`/c/${slug}`}>Clear filters</ButtonLink>}
          />
        )}

        <Pagination page={page} totalPages={totalPages} basePath={`/c/${slug}`} params={raw} />

        <div className="h-6" />
      </div>
    </>
  );
}
