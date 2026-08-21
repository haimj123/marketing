import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppHeader } from "@/components/shell/app-header";
import { CategoryIcon } from "@/components/category-icon";
import { getCategories, getCategoryCounts } from "@/lib/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse Jewish tzedaka organizations by cause — chinuch, food, bikur cholim, hachnasas kallah, gemachim and more.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  const categories = getCategories();
  const counts = getCategoryCounts();

  return (
    <>
      <AppHeader title="Categories" />

      <div className="app py-4">
        <ul className="divide-y divide-ink-300">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/c/${category.slug}`}
                className="press flex items-center gap-3 py-3"
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-050 text-blue-700">
                  <CategoryIcon iconKey={category.iconKey} className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-base font-bold text-ink-900">
                    {category.nameEn}
                  </span>
                  <span className="block truncate text-sm text-ink-600">{category.blurb}</span>
                </span>
                <span className="tabular shrink-0 text-sm text-ink-600">
                  {counts[category.slug]}
                </span>
                <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-300" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
