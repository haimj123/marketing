import Link from "next/link";
import { Search } from "lucide-react";

/**
 * Not an input. Tapping it opens the search screen, exactly as a delivery app
 * does — which keeps the home page a server component, and means the first tap
 * lands on a screen built for searching rather than a keyboard covering a feed.
 */
export function SearchTrigger({
  placeholder = "Search organizations or causes",
}: {
  placeholder?: string;
}) {
  return (
    <Link
      href="/search"
      className="press flex h-11 w-full items-center gap-2 rounded-pill bg-ink-050 px-4 text-ink-600"
    >
      <Search aria-hidden className="size-[18px] shrink-0" />
      <span className="truncate text-sm">{placeholder}</span>
    </Link>
  );
}
