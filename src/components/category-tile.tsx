import Link from "next/link";
import { CategoryIcon } from "./category-icon";
import type { Category } from "@/lib/types";

/** 56px circle, blue-050 fill, blue glyph, 12/600 label beneath. */
export function CategoryTile({ category, count }: { category: Category; count?: number }) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group flex w-[92px] flex-col items-center gap-2 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-050 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
        <CategoryIcon iconKey={category.iconKey} className="size-6" />
      </span>
      <span className="text-xs font-semibold leading-tight text-ink-900">{category.nameEn}</span>
      {count != null && <span className="tabular text-xs text-ink-600">{count}</span>}
    </Link>
  );
}

export function CategoryCard({ category, count }: { category: Category; count?: number }) {
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group flex items-start gap-3 rounded-[8px] border border-ink-300 bg-white p-4 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,.08)]"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-050 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
        <CategoryIcon iconKey={category.iconKey} className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-base font-bold text-ink-900">
          {category.nameEn}
        </span>
        <span className="he mt-0.5 block text-sm text-ink-600" lang="he" dir="rtl">
          {category.nameHe}
        </span>
        <span className="mt-1 block text-xs text-ink-600">
          {count != null ? `${count} listed` : category.blurb}
        </span>
      </span>
    </Link>
  );
}
