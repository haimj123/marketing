import Link from "next/link";
import { CategoryIcon } from "../category-icon";
import type { Category } from "@/lib/types";

/**
 * The cuisine rail. 56px circle, blue-050 fill, blue glyph, 12/600 label
 * beneath at most two lines.
 *
 * It runs full-bleed so the last tile is cut off at the screen edge — that
 * clipped tile is the only thing telling a thumb the row scrolls, and a rail
 * that ends flush inside the gutter reads as a finished grid instead.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <nav aria-label="Browse by category">
      <ul className="rail bleed py-1">
        {categories.map((category) => (
          <li key={category.slug} className="w-[72px]">
            <Link
              href={`/c/${category.slug}`}
              className="press flex flex-col items-center gap-1.5 text-center"
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-blue-050 text-blue-700">
                <CategoryIcon iconKey={category.iconKey} className="size-6" />
              </span>
              <span className="clamp-2 text-xs font-semibold leading-tight text-ink-900">
                {category.nameEn}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
